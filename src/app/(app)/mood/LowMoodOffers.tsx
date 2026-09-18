import Link from "next/link";
import { MessageCircle, Mail, Heart, Phone } from "lucide-react";

export function LowMoodOffers({ waLink }: { waLink: string | null }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <p className="text-sm font-medium">However you&apos;re feeling, you don&apos;t have to sit with it alone.</p>
      <div className="grid grid-cols-2 gap-2">
        <Link href="/chat" className="flex items-center gap-2 rounded-xl border border-border p-3 text-sm">
          <MessageCircle className="size-4 text-primary" aria-hidden="true" />
          Talk to the chatbot
        </Link>
        <Link href="/letters" className="flex items-center gap-2 rounded-xl border border-border p-3 text-sm">
          <Mail className="size-4 text-primary" aria-hidden="true" />
          Open a letter
        </Link>
        <Link href="/reasons" className="flex items-center gap-2 rounded-xl border border-border p-3 text-sm">
          <Heart className="size-4 text-primary" aria-hidden="true" />
          Pull a reason
        </Link>
        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-primary p-3 text-sm text-primary-foreground"
          >
            <Phone className="size-4" aria-hidden="true" />
            WhatsApp Ruhail
          </a>
        )}
      </div>
    </div>
  );
}
