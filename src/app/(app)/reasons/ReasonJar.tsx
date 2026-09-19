"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { vibrate } from "@/lib/haptics";
import { drawReason, toggleFavoriteReason } from "./actions";

type DrawnReason = { id: string; text: string; imageUrl: string | null };

export function ReasonJar({ initialTotal }: { initialTotal: number }) {
  const [phase, setPhase] = useState<"idle" | "shaking" | "revealed">("idle");
  const [reason, setReason] = useState<DrawnReason | null>(null);
  const [progress, setProgress] = useState<{ seen: number; total: number }>({ seen: 0, total: initialTotal });
  const [favorited, setFavorited] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);

  async function handleTapJar() {
    if (phase === "shaking") return;
    setPhase("shaking");
    vibrate(10);
    const result = await drawReason();
    if (!result.reason) {
      setPhase("idle");
      toast.info("No reasons added yet — check back soon.");
      return;
    }
    setTimeout(() => {
      setReason(result.reason);
      setFavorited(result.favorited);
      setProgress({ seen: result.seenCount, total: result.totalCount });
      setPhase("revealed");
      if (result.newCycleStarted && result.seenCount > 1) {
        toast("You've seen them all — starting a new round 💫");
      }
    }, 500);
  }

  async function handleToggleFavorite() {
    if (!reason || togglingFavorite) return;
    vibrate(12);
    setTogglingFavorite(true);
    setFavorited((f) => !f);
    try {
      await toggleFavoriteReason(reason.id);
    } catch {
      setFavorited((f) => !f);
      toast.error("Couldn't save that favorite");
    } finally {
      setTogglingFavorite(false);
    }
  }

  function handleDrawAnother() {
    setReason(null);
    setPhase("idle");
  }

  return (
    <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-6">
      <AnimatePresence mode="wait">
        {phase !== "revealed" ? (
          <motion.button
            key="jar"
            onClick={handleTapJar}
            animate={phase === "shaking" ? { rotate: [0, -8, 8, -8, 8, 0] } : { rotate: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-3"
            aria-label="Pull a reason"
          >
            <span className="text-8xl" role="img" aria-hidden="true">
              🫙
            </span>
            <span className="text-sm text-muted-foreground">Tap the jar</span>
          </motion.button>
        ) : (
          <motion.div
            key="card"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            style={{ transformStyle: "preserve-3d" }}
            className="flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center shadow-sm"
          >
            <p className="font-heading text-lg text-balance">{reason?.text}</p>
            <button
              onClick={handleToggleFavorite}
              aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
              className="flex size-11 items-center justify-center rounded-full text-primary"
            >
              <Heart className={`size-6 ${favorited ? "fill-primary" : ""}`} aria-hidden="true" />
            </button>
            <Button variant="outline" onClick={handleDrawAnother}>
              Pull another
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {progress.total > 0 && (
        <p className="text-xs text-muted-foreground">
          {progress.seen} of {progress.total} this round
        </p>
      )}
    </div>
  );
}
