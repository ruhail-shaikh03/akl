"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCoupon, updateCoupon } from "./actions";
import type { Coupon } from "@/app/(app)/coupons/types";

function toDatetimeLocal(iso: string | Date | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function CouponForm({ initialCoupon }: { initialCoupon?: Coupon }) {
  const router = useRouter();
  const isEdit = Boolean(initialCoupon);

  const [title, setTitle] = useState(initialCoupon?.title ?? "");
  const [description, setDescription] = useState(initialCoupon?.description ?? "");
  const [emoji, setEmoji] = useState(initialCoupon?.emoji ?? "🎁");
  const [usageType, setUsageType] = useState<"single" | "multi">(initialCoupon?.usageType ?? "single");
  const [maxUses, setMaxUses] = useState(initialCoupon?.maxUses ? String(initialCoupon.maxUses) : "");
  const [hasExpiry, setHasExpiry] = useState(Boolean(initialCoupon?.expiryAt));
  const [expiryAt, setExpiryAt] = useState(toDatetimeLocal(initialCoupon?.expiryAt ?? null));
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title,
        description: description.trim() || undefined,
        emoji,
        usageType,
        maxUses: usageType === "multi" && maxUses ? Number(maxUses) : undefined,
        expiryAt: hasExpiry && expiryAt ? new Date(expiryAt).toISOString() : undefined,
      };
      if (isEdit) {
        await updateCoupon({
          id: initialCoupon!.id,
          ...payload,
          description: payload.description ?? null,
          maxUses: payload.maxUses ?? null,
          expiryAt: payload.expiryAt ?? null,
        });
      } else {
        await createCoupon(payload);
      }
      router.push("/admin/coupons");
      router.refresh();
      toast.success(isEdit ? "Coupon updated" : "Coupon created");
    } catch {
      toast.error("Couldn't save this coupon");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex gap-3">
        <div className="flex w-20 flex-col gap-1.5">
          <Label htmlFor="emoji">Emoji</Label>
          <Input id="emoji" className="text-center text-base" value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={8} />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" className="text-base" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Movie night, your pick" required />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea id="description" className="text-base" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Usage</Label>
        <Select value={usageType} onValueChange={(v) => setUsageType(v as "single" | "multi")}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Single use</SelectItem>
            <SelectItem value="multi">Multi-use</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {usageType === "multi" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="maxUses">Max uses (leave blank for unlimited)</Label>
          <Input
            id="maxUses"
            type="number"
            min={1}
            className="text-base"
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
          />
        </div>
      )}

      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <Label htmlFor="expiry-toggle">Expires</Label>
        <Switch id="expiry-toggle" checked={hasExpiry} onCheckedChange={setHasExpiry} />
      </div>
      {hasExpiry && (
        <Input
          type="datetime-local"
          className="text-base"
          value={expiryAt}
          onChange={(e) => setExpiryAt(e.target.value)}
          required={hasExpiry}
        />
      )}

      <Button type="submit" disabled={saving}>
        {saving ? "Saving..." : isEdit ? "Save changes" : "Create coupon"}
      </Button>
    </form>
  );
}
