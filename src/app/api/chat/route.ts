import { NextRequest } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { streamText } from "ai";
import { db } from "@/db";
import { chatConversations, chatMessages, personalContext, moodCheckins } from "@/db/schema";
import { requireSession, UnauthorizedError } from "@/lib/auth/guards";
import { checkChatLimit } from "@/lib/ratelimit/limiters";
import { notify } from "@/lib/notify/notify";
import { todayKarachiDate, daysSince, daysUntilNextAnniversary } from "@/lib/time";
import { sendMessageSchema } from "@/lib/validations/chat.schema";
import { deepseekModel, MAX_OUTPUT_TOKENS, MAX_HISTORY_MESSAGES, REQUEST_TIMEOUT_MS } from "@/lib/deepseek/client";
import { buildSystemPrompt, buildTurnContext } from "@/lib/deepseek/systemPrompt";
import { detectDistressKeywords } from "@/lib/deepseek/distress";
import { isOverDailyBudget } from "@/lib/deepseek/tokenBudget";

export const runtime = "nodejs";

const FALLBACK_TEXT = "I'm having trouble connecting right now. If you need to talk, Ruhail's just a tap away 💛";
const SAFETY_TAG_RE = /\s*<<SAFETY:(OK|DISTRESS)>>\s*$/i;
const TAIL_HOLD = 30; // must exceed the longest possible tag + leading whitespace
const MOOD_EMOJIS = ["😢", "😕", "😐", "🙂", "😄"];

function textResponse(text: string) {
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

export async function POST(req: NextRequest) {
  let session;
  try {
    session = await requireSession();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return new Response("Unauthorized", { status: 401 });
    }
    throw err;
  }

  const body = await req.json().catch(() => null);
  const parsed = sendMessageSchema.safeParse(body);
  if (!parsed.success) {
    return new Response("Invalid request", { status: 400 });
  }
  const { conversationId, message, ventMode } = parsed.data;

  const { success } = await checkChatLimit(session.sub);
  if (!success) {
    return new Response("Too many messages. Take a breather and try again soon.", { status: 429 });
  }

  const [conversation] = await db
    .select()
    .from(chatConversations)
    .where(and(eq(chatConversations.id, conversationId), eq(chatConversations.userId, session.sub)))
    .limit(1);
  if (!conversation) {
    return new Response("Conversation not found", { status: 404 });
  }

  const keywordHit = detectDistressKeywords(message);
  await db.insert(chatMessages).values({ conversationId, role: "user", content: message, flaggedDistress: keywordHit });

  async function persistAssistant(content: string, tokensUsed: number, flaggedDistress: boolean) {
    await db.insert(chatMessages).values({ conversationId, role: "assistant", content, tokensUsed, flaggedDistress });
    await db.update(chatConversations).set({ lastMessageAt: new Date() }).where(eq(chatConversations.id, conversationId));
  }

  if (await isOverDailyBudget()) {
    await persistAssistant(FALLBACK_TEXT, 0, false);
    await notify({ type: "chat.spend_guard_triggered", priority: "normal", data: {} });
    return textResponse(FALLBACK_TEXT);
  }

  const [context] = await db.select().from(personalContext).where(eq(personalContext.id, 1)).limit(1);
  if (!context) {
    await persistAssistant(FALLBACK_TEXT, 0, keywordHit);
    return textResponse(FALLBACK_TEXT);
  }

  const today = todayKarachiDate();
  const [todaysMood] = await db
    .select()
    .from(moodCheckins)
    .where(and(eq(moodCheckins.userId, session.sub), eq(moodCheckins.checkinDate, today)))
    .limit(1);

  const systemPrompt =
    buildSystemPrompt(context) +
    "\n\n" +
    buildTurnContext({
      todayMoodEmoji: todaysMood ? MOOD_EMOJIS[todaysMood.moodLevel - 1] : null,
      todayMoodNote: todaysMood?.note ?? null,
      daysSinceMet: daysSince(context.relationshipStartDate),
      daysUntilBirthday: daysUntilNextAnniversary(context.partnerBirthday),
      ventMode,
    });

  const history = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.conversationId, conversationId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(MAX_HISTORY_MESSAGES);
  const modelMessages = history.reverse().map((m) => ({ role: m.role, content: m.content }) as const);

  try {
    const result = streamText({
      model: deepseekModel,
      system: systemPrompt,
      messages: modelMessages,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      abortSignal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let raw = "";
        let sent = 0;
        let streamFailed = false;

        try {
          for await (const chunk of result.textStream) {
            raw += chunk;
            const safeLength = Math.max(0, raw.length - TAIL_HOLD);
            if (safeLength > sent) {
              controller.enqueue(encoder.encode(raw.slice(sent, safeLength)));
              sent = safeLength;
            }
          }
        } catch (err) {
          console.error("[chat] stream error:", err);
          streamFailed = true;
        }

        if (streamFailed && raw.length === 0) {
          controller.enqueue(encoder.encode(FALLBACK_TEXT));
          controller.close();
          await persistAssistant(FALLBACK_TEXT, 0, keywordHit).catch(() => {});
          return;
        }

        const modelFlagged = SAFETY_TAG_RE.test(raw) && /DISTRESS/i.test(raw.slice(-40));
        const cleanText = raw.replace(SAFETY_TAG_RE, "").trimEnd();
        if (cleanText.length > sent) {
          controller.enqueue(encoder.encode(cleanText.slice(sent)));
        }
        controller.close();

        let totalTokens = 0;
        try {
          const usage = await result.usage;
          totalTokens = usage.totalTokens ?? 0;
        } catch {
          // usage unavailable (e.g. aborted mid-stream) — persist with 0, not fatal
        }

        await persistAssistant(cleanText || FALLBACK_TEXT, totalTokens, keywordHit || modelFlagged);

        if (keywordHit || modelFlagged) {
          await notify({
            type: "chat.distress_detected",
            priority: "high",
            data: {
              snippet: message.slice(0, 120),
              detectedBy: keywordHit && modelFlagged ? "both" : keywordHit ? "keyword" : "model_tag",
            },
          });
        }
      },
    });

    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (err) {
    console.error("[chat] request setup error:", err);
    await persistAssistant(FALLBACK_TEXT, 0, keywordHit);
    return textResponse(FALLBACK_TEXT);
  }
}
