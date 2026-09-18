"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Image as ImageIcon, Mail, Heart, Ticket, SmilePlus, ListChecks, Music, MessageCircle } from "lucide-react";
import { useSession } from "@/components/session-provider";
import { getTodaysCheckin } from "./mood/actions";

const TILES = [
  { href: "/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/letters", label: "Open When...", icon: Mail },
  { href: "/reasons", label: "Reasons I Love You", icon: Heart },
  { href: "/coupons", label: "Coupons", icon: Ticket },
  { href: "/mood", label: "How are you?", icon: SmilePlus },
  { href: "/bucket-list", label: "Bucket List", icon: ListChecks },
  { href: "/playlist", label: "Our Playlist", icon: Music },
  { href: "/chat", label: "Chat", icon: MessageCircle },
] as const;

function timeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Still up?";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

export default function HomePage() {
  const session = useSession();
  const [hasCheckedInToday, setHasCheckedInToday] = useState<boolean | null>(null);

  useEffect(() => {
    getTodaysCheckin()
      .then((checkin) => setHasCheckedInToday(Boolean(checkin)))
      .catch(() => setHasCheckedInToday(null));
  }, []);

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-safe pt-6">
      <header>
        <p className="text-sm text-muted-foreground">{timeOfDayGreeting()},</p>
        <h1 className="font-heading text-3xl">{session.name || "there"} 💛</h1>
      </header>

      {hasCheckedInToday === false && (
        <Link
          href="/mood"
          className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-4 transition-colors hover:bg-primary/15"
        >
          <SmilePlus className="size-6 text-primary" aria-hidden="true" />
          <span className="text-sm font-medium">How are you feeling today?</span>
        </Link>
      )}

      <section className="grid grid-cols-2 gap-3">
        {TILES.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-start gap-2 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-accent/10"
          >
            <Icon className="size-6 text-primary" aria-hidden="true" />
            <span className="text-sm font-medium">{label}</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
