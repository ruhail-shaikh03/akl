"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fulfillRedemption } from "../actions";

type Redemption = {
  id: string;
  couponTitle: string;
  couponEmoji: string;
  redeemedByName: string;
  redeemedAt: Date;
  note: string | null;
  fulfilledAt: Date | null;
  adminResponseNote: string | null;
};

export function RedemptionRow({ redemption }: { redemption: Redemption }) {
  const router = useRouter();
  const [responding, setResponding] = useState(false);
  const [response, setResponse] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleFulfill() {
    setSaving(true);
    try {
      await fulfillRedemption({ redemptionId: redemption.id, adminResponseNote: response.trim() || undefined });
      router.refresh();
      toast.success("Marked fulfilled");
    } catch {
      toast.error("Couldn't update this redemption");
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {redemption.couponEmoji} {redemption.couponTitle}
        </span>
        <span className="text-xs text-muted-foreground">{new Date(redemption.redeemedAt).toLocaleString()}</span>
      </div>
      <span className="text-xs text-muted-foreground">Redeemed by {redemption.redeemedByName}</span>
      {redemption.note && <p className="text-sm">&ldquo;{redemption.note}&rdquo;</p>}

      {redemption.fulfilledAt ? (
        <span className="flex items-center gap-1 text-xs text-primary">
          <Check className="size-3.5" aria-hidden="true" />
          Fulfilled{redemption.adminResponseNote ? ` — ${redemption.adminResponseNote}` : ""}
        </span>
      ) : responding ? (
        <div className="flex flex-col gap-2">
          <Input
            className="text-base"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Optional reply, e.g. 'On it!'"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleFulfill} disabled={saving}>
              {saving ? "Saving..." : "Confirm fulfilled"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setResponding(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button size="sm" variant="outline" className="w-fit" onClick={() => setResponding(true)}>
          Mark fulfilled
        </Button>
      )}
    </li>
  );
}
