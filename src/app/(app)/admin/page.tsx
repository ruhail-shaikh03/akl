import { redirect } from "next/navigation";
import Link from "next/link";
import { Bell, Mail, Heart } from "lucide-react";
import { getSession } from "@/lib/auth/session";

const SECTIONS = [
  { href: "/admin/letters", label: "Letters", icon: Mail },
  { href: "/admin/reasons", label: "Reasons", icon: Heart },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
] as const;

export default async function AdminPage() {
  const session = await getSession();
  if (session?.role !== "admin") {
    redirect("/");
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-safe pt-6">
      <div>
        <h1 className="font-heading text-2xl">Admin</h1>
        <p className="text-sm text-muted-foreground">
          Coupons and personal context management arrive with their own phases.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {SECTIONS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-accent/10"
          >
            <Icon className="size-5 text-primary" aria-hidden="true" />
            <span className="text-sm font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
