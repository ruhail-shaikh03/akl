"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CONFIGURABLE_EVENT_TYPES, EVENT_TYPE_LABELS, type NotifyEventType } from "@/lib/notify/events";
import { updateEventSetting, updateQuietHours, sendTestNotification } from "./actions";

type EventSettingRow = {
  eventType: string;
  enabled: boolean;
  quietHoursExempt: boolean;
};

type QuietHours = { enabled: boolean; start: string; end: string };

export function NotificationSettingsClient({
  initialSettings,
  initialQuietHours,
}: {
  initialSettings: EventSettingRow[];
  initialQuietHours: QuietHours;
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [quietHours, setQuietHours] = useState(initialQuietHours);
  const [isPending, startTransition] = useTransition();
  const [isTesting, setIsTesting] = useState(false);

  function updateRow(eventType: NotifyEventType, patch: Partial<EventSettingRow>) {
    setSettings((prev) => prev.map((row) => (row.eventType === eventType ? { ...row, ...patch } : row)));
    startTransition(async () => {
      try {
        await updateEventSetting({ eventType, ...patch });
      } catch {
        toast.error("Couldn't save that setting. Try again.");
      }
    });
  }

  function saveQuietHours() {
    startTransition(async () => {
      try {
        await updateQuietHours(quietHours);
        toast.success("Quiet hours saved");
      } catch {
        toast.error("Couldn't save quiet hours — check the time format (HH:mm).");
      }
    });
  }

  async function handleTest() {
    setIsTesting(true);
    try {
      const result = await sendTestNotification();
      if (result.delivered) {
        toast.success("Test notification sent — check Telegram.");
      } else if (result.skipped === "quiet_hours") {
        toast.info("Suppressed: it's currently quiet hours.");
      } else if (result.skipped === "disabled") {
        toast.info("This event type is disabled.");
      } else {
        toast.error(result.error ?? "Delivery failed on every channel — check the log below.");
      }
    } finally {
      setIsTesting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Event notifications</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {CONFIGURABLE_EVENT_TYPES.map((type) => {
            const row = settings.find((s) => s.eventType === type) ?? {
              eventType: type,
              enabled: true,
              quietHoursExempt: false,
            };
            return (
              <div key={type} className="flex flex-col gap-2 border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor={`${type}-enabled`} className="text-sm font-medium">
                    {EVENT_TYPE_LABELS[type]}
                  </Label>
                  <Switch
                    id={`${type}-enabled`}
                    checked={row.enabled}
                    onCheckedChange={(enabled) => updateRow(type, { enabled })}
                    disabled={isPending}
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor={`${type}-exempt`} className="text-xs text-muted-foreground">
                    Bypass quiet hours
                  </Label>
                  <Switch
                    id={`${type}-exempt`}
                    checked={row.quietHoursExempt}
                    onCheckedChange={(quietHoursExempt) => updateRow(type, { quietHoursExempt })}
                    disabled={isPending}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quiet hours (Asia/Karachi)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="qh-enabled">Enabled</Label>
            <Switch
              id="qh-enabled"
              checked={quietHours.enabled}
              onCheckedChange={(enabled) => setQuietHours((q) => ({ ...q, enabled }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="qh-start" className="text-xs text-muted-foreground">
                Start
              </Label>
              <Input
                id="qh-start"
                type="time"
                className="text-base"
                value={quietHours.start}
                onChange={(e) => setQuietHours((q) => ({ ...q, start: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="qh-end" className="text-xs text-muted-foreground">
                End
              </Label>
              <Input
                id="qh-end"
                type="time"
                className="text-base"
                value={quietHours.end}
                onChange={(e) => setQuietHours((q) => ({ ...q, end: e.target.value }))}
              />
            </div>
          </div>
          <Button onClick={saveQuietHours} disabled={isPending}>
            Save quiet hours
          </Button>
        </CardContent>
      </Card>

      <Button variant="outline" onClick={handleTest} disabled={isTesting}>
        {isTesting ? "Sending..." : "Send test notification"}
      </Button>
    </div>
  );
}
