import { redirect } from "next/navigation";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { notificationSettings, notificationsLog } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { getQuietHoursSetting } from "@/lib/notify/quietHours";
import { NotificationSettingsClient } from "./NotificationSettingsClient";

export default async function AdminNotificationsPage() {
  const session = await getSession();
  if (session?.role !== "admin") {
    redirect("/");
  }

  const [settings, quietHours, log] = await Promise.all([
    db.select().from(notificationSettings),
    getQuietHoursSetting(),
    db.select().from(notificationsLog).orderBy(desc(notificationsLog.createdAt)).limit(20),
  ]);

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-4 pb-8 pt-safe pt-6">
      <h1 className="font-heading text-2xl">Notifications</h1>

      <NotificationSettingsClient
        initialSettings={settings}
        initialQuietHours={{ enabled: quietHours.enabled, start: quietHours.start, end: quietHours.end }}
      />

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">Recent activity</h2>
        {log.length === 0 && <p className="text-sm text-muted-foreground">Nothing yet.</p>}
        <ul className="flex flex-col gap-2">
          {log.map((entry) => (
            <li key={entry.id} className="rounded-lg border border-border bg-card p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium">{entry.eventType}</span>
                <span
                  className={
                    entry.status === "sent"
                      ? "text-green-600 dark:text-green-400"
                      : entry.status === "skipped"
                        ? "text-muted-foreground"
                        : "text-destructive"
                  }
                >
                  {entry.status}
                </span>
              </div>
              <div className="mt-1 text-muted-foreground">
                {entry.channel} · {new Date(entry.createdAt).toLocaleString()}
              </div>
              {entry.errorMessage && <div className="mt-1 text-destructive">{entry.errorMessage}</div>}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
