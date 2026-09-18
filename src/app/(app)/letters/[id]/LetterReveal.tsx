"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";
import { openLetter } from "../actions";
import type { Letter } from "../types";

export function LetterReveal({ letter }: { letter: Letter }) {
  const [revealed, setRevealed] = useState(Boolean(letter.openedAt));
  const [opening, setOpening] = useState(false);

  function handleOpen() {
    if (opening || revealed) return;
    setOpening(true);
    openLetter(letter.id).catch(() => toast.error("Couldn't mark this as opened, but here it is anyway."));
    setTimeout(() => setRevealed(true), 550);
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pt-safe pt-6">
      <Link href="/letters" className="mb-4 flex w-fit items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back
      </Link>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 pb-16">
        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.button
              key="envelope"
              onClick={handleOpen}
              animate={opening ? { scale: 0.6, opacity: 0, rotate: -8 } : { scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.5, ease: "easeIn" }}
              className="flex flex-col items-center gap-4"
              aria-label="Open letter"
            >
              <Mail className="size-24 text-primary" aria-hidden="true" />
              <span className="font-heading text-xl">{letter.title}</span>
              <span className="text-sm text-muted-foreground">Tap to open</span>
            </motion.button>
          ) : (
            <motion.div
              key="letter"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex w-full flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <h1 className="font-heading text-xl">{letter.title}</h1>
              {letter.imageBlobUrl && (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                  <Image src={letter.imageBlobUrl} alt="" fill sizes="400px" className="object-cover" />
                </div>
              )}
              <div className="prose prose-sm dark:prose-invert max-w-none text-foreground [&_p]:leading-relaxed">
                <ReactMarkdown>{letter.bodyMarkdown}</ReactMarkdown>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
