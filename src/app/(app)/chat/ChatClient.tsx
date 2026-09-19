"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, CloudRain, ImageIcon, Laugh, Phone, Plus, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { getRandomMemory, startNewConversation } from "./actions";
import { CompanionOrb } from "./CompanionOrb";
import type { ChatMessage } from "./types";

const CHIPS = [
  { label: "Tell me something nice", icon: Sparkles },
  { label: "Make me laugh", icon: Laugh },
  { label: "Remind me of a memory", icon: ImageIcon },
  { label: "I just need to vent", icon: CloudRain },
] as const;

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `local-${Date.now()}-${idCounter}`;
}

export function ChatClient({
  conversationId,
  initialMessages,
  waLink,
}: {
  conversationId: string;
  initialMessages: ChatMessage[];
  waLink: string | null;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [ventMode, setVentMode] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string, opts?: { vent?: boolean }) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const vent = opts?.vent ?? ventMode;
    if (opts?.vent) setVentMode(true);

    setInput("");
    setMessages((m) => [...m, { id: nextId(), role: "user", content: trimmed }]);
    setSending(true);

    const assistantId = nextId();
    setMessages((m) => [...m, { id: assistantId, role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: trimmed, ventMode: vent }),
      });

      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((m) => m.map((msg) => (msg.id === assistantId ? { ...msg, content: msg.content + chunk } : msg)));
      }
    } catch {
      setMessages((m) =>
        m.map((msg) =>
          msg.id === assistantId ? { ...msg, content: "Something went wrong. Try again in a bit 💛" } : msg,
        ),
      );
    } finally {
      setSending(false);
    }
  }

  async function handleChip(chip: (typeof CHIPS)[number]["label"]) {
    if (chip === "Remind me of a memory") {
      const memory = await getRandomMemory().catch(() => null);
      if (!memory) {
        toast.info("No photos in the gallery yet.");
        return;
      }
      setMessages((m) => [
        ...m,
        { id: nextId(), role: "memory", content: memory.caption ?? "", memoryPhoto: { blobUrl: memory.blobUrl, caption: memory.caption } },
      ]);
      await sendMessage(`Here's a memory: "${memory.caption ?? "a photo of us"}"`);
      return;
    }
    if (chip === "I just need to vent") {
      await sendMessage(chip, { vent: true });
      return;
    }
    await sendMessage(chip);
  }

  async function handleNewConversation() {
    await startNewConversation();
    setMessages([]);
    setVentMode(false);
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background pt-safe">
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-3 py-2.5">
        <Link href="/" aria-label="Back" className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted">
          <ArrowLeft className="size-5" aria-hidden="true" />
        </Link>
        <div className="flex flex-1 items-center gap-2.5">
          <CompanionOrb size={30} />
          <span className="font-heading text-base italic">Your companion</span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={handleNewConversation}
            aria-label="New conversation"
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <Plus className="size-4" aria-hidden="true" />
          </button>
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp Ruhail"
              className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground"
            >
              <Phone className="size-4" aria-hidden="true" />
            </a>
          )}
        </div>
      </header>

      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex max-w-md flex-col gap-3">
          {messages.length === 0 && (
            <div className="mt-10 flex flex-col items-center gap-3 text-center">
              <CompanionOrb size={56} />
              <p className="font-heading text-lg text-balance italic">Say anything. I&apos;m listening.</p>
            </div>
          )}
          {messages.map((msg) => {
            if (msg.role === "memory" && msg.memoryPhoto) {
              return (
                <div key={msg.id} className="flex items-end gap-2 self-start">
                  <CompanionOrb size={20} />
                  <div className="flex flex-col gap-1 overflow-hidden rounded-2xl rounded-bl-md border border-border bg-card p-2">
                    <div className="relative h-40 w-56 overflow-hidden rounded-xl">
                      <Image src={msg.memoryPhoto.blobUrl} alt={msg.memoryPhoto.caption ?? ""} fill sizes="224px" className="object-cover" />
                    </div>
                    {msg.memoryPhoto.caption && <span className="px-1 text-xs text-muted-foreground">{msg.memoryPhoto.caption}</span>}
                  </div>
                </div>
              );
            }
            const isUser = msg.role === "user";
            const isStreamingEmpty = !msg.content && sending && msg.role === "assistant";

            if (isUser) {
              return (
                <div
                  key={msg.id}
                  className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-primary px-4 py-2 text-sm text-primary-foreground"
                >
                  {msg.content}
                </div>
              );
            }

            return (
              <div key={msg.id} className="flex max-w-[85%] items-end gap-2 self-start">
                <CompanionOrb size={20} pulsing={isStreamingEmpty} />
                <div className="rounded-2xl rounded-bl-md bg-secondary px-4 py-2 text-sm text-secondary-foreground">
                  {isStreamingEmpty ? (
                    <span className="flex gap-1 py-1">
                      <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-current" />
                    </span>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="shrink-0 border-t border-border p-3">
        <div className="mx-auto flex max-w-md gap-2 overflow-x-auto pb-3 scrollbar-none">
          {CHIPS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => handleChip(label)}
              disabled={sending}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-primary/20 bg-card px-3 py-1.5 text-xs whitespace-nowrap disabled:opacity-50"
            >
              <Icon className="size-3.5 text-primary" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="mx-auto flex max-w-md items-center gap-1.5 rounded-full bg-secondary py-1 pr-1 pl-4 pb-safe"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="h-9 flex-1 border-none bg-transparent text-base dark:bg-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            aria-label="Send"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
          >
            <Send className="size-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}
