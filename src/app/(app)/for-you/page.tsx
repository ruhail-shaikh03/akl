import Link from "next/link";
import { Mail, Heart, Ticket, ListChecks, Music } from "lucide-react";

const ITEMS = [
  { href: "/letters", label: "Open When...", icon: Mail },
  { href: "/reasons", label: "Reasons I Love You", icon: Heart },
  { href: "/coupons", label: "Coupons", icon: Ticket },
  { href: "/bucket-list", label: "Bucket List", icon: ListChecks },
  { href: "/playlist", label: "Our Playlist", icon: Music },
] as const;

export default function ForYouPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-safe pt-6">
      <h1 className="font-heading text-2xl">For You</h1>
      <section className="grid grid-cols-2 gap-3">
        {ITEMS.map(({ href, label, icon: Icon }) => (
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
