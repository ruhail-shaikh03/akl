"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, Plus, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getRandomMemory, startNewConversation } from "./actions";
import type { ChatMessage } from "./types";

const CHIPS = ["Tell me something nice", "Make me laugh", "Remind me of a memory", "I just need to vent"] as const;

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
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
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

  async function handleChip(chip: (typeof CHIPS)[number]) {
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
    <div className="fixed inset-0 z-50 flex flex-col bg-background pt-safe">
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border p-3">
        <Link href="/" aria-label="Back" className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted">
          <ArrowLeft className="size-5" aria-hidden="true" />
        </Link>
        <span className="font-heading text-base">Chat</span>
        <div className="flex items-center gap-1">
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

      <div ref={listRef} className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto flex max-w-md flex-col gap-3">
          {messages.length === 0 && (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Say hi, or tap a chip below to get started.
            </p>
          )}
          {messages.map((msg) => {
            if (msg.role === "memory" && msg.memoryPhoto) {
              return (
                <div key={msg.id} className="flex flex-col gap-1 self-start rounded-2xl border border-border bg-card p-2">
                  <div className="relative h-40 w-56 overflow-hidden rounded-xl">
                    <Image src={msg.memoryPhoto.blobUrl} alt={msg.memoryPhoto.caption ?? ""} fill sizes="224px" className="object-cover" />
                  </div>
                  {msg.memoryPhoto.caption && <span className="px-1 text-xs text-muted-foreground">{msg.memoryPhoto.caption}</span>}
                </div>
              );
            }
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                  isUser ? "self-end bg-primary text-primary-foreground" : "self-start bg-card border border-border"
                }`}
              >
                {msg.content || (sending && msg.role === "assistant" ? "…" : "")}
              </div>
            );
          })}
        </div>
      </div>

      <div className="shrink-0 border-t border-border p-2">
        <div className="mx-auto flex max-w-md gap-2 overflow-x-auto pb-2">
          {CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => handleChip(chip)}
              disabled={sending}
              className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs whitespace-nowrap disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="mx-auto flex max-w-md items-center gap-2 pb-safe"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="text-base"
            disabled={sending}
          />
          <Button type="submit" size="icon" disabled={sending || !input.trim()} aria-label="Send">
            <Send className="size-4" aria-hidden="true" />
          </Button>
        </form>
      </div>
    </div>
  );
}
