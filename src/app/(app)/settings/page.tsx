"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop, ShieldCheck, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/components/session-provider";
import { cn } from "@/lib/utils";

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
] as const;

export default function SettingsPage() {
  const session = useSession();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  // next-themes doesn't know the persisted theme until after mount, so the
  // server-rendered markup can't know which button is "active" — avoid a
  // hydration mismatch by only applying that styling once mounted.
  const [mounted, setMounted] = useState(false);
  // Standard next-themes mount-detection pattern — there's no external event
  // to subscribe to here, just "has the client taken over from SSR yet".
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-safe pt-6">
      <h1 className="font-heading text-2xl">Settings</h1>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <div>
            <p className="text-sm font-medium">Theme</p>
            <div className="mt-2 grid grid-cols-3 gap-2 rounded-lg bg-muted p-1">
              {THEMES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-md py-2 text-xs font-medium transition-colors",
                    mounted && theme === value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {session.role === "admin" && (
            <Button
              variant="outline"
              className="justify-start gap-2"
              nativeButton={false}
              render={<Link href="/admin" />}
            >
              <ShieldCheck className="size-4" aria-hidden="true" />
              Admin
            </Button>
          )}

          <Button variant="outline" className="justify-start gap-2" onClick={handleLogout}>
            <LogOut className="size-4" aria-hidden="true" />
            Log out
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
