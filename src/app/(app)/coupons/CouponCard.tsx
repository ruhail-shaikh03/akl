"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Clock } from "lucide-react";
import { ScratchCanvas } from "@/components/ScratchCanvas";
import { celebrate } from "@/lib/confetti";
import { vibrate } from "@/lib/haptics";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { redeemCoupon, scratchCoupon } from "./actions";
import type { Coupon } from "./types";

export function CouponCard({ coupon }: { coupon: Coupon }) {
  const router = useRouter();
  const [status, setStatus] = useState(coupon.status);
  const [usesCount, setUsesCount] = useState(coupon.usesCount);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [note, setNote] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  const expired = coupon.expiryAt ? new Date(coupon.expiryAt) < new Date() : false;
  const exhausted =
    status === "redeemed" &&
    (coupon.usageType === "single" || coupon.maxUses === null || usesCount >= (coupon.maxUses ?? Infinity));
  const canRedeem = status !== "locked" && !expired && !exhausted;

  async function handleRevealed() {
    setStatus("revealed");
    vibrate([10, 40, 10]);
    try {
      await scratchCoupon(coupon.id);
    } catch {
      // non-critical: the card already looks revealed locally
    }
  }

  async function handleRedeem() {
    setRedeeming(true);
    try {
      await redeemCoupon({ id: coupon.id, note: note.trim() || undefined });
      const newUsesCount = usesCount + 1;
      setUsesCount(newUsesCount);
      if (coupon.usageType === "single" || (coupon.maxUses !== null && newUsesCount >= coupon.maxUses)) {
        setStatus("redeemed");
      }
      vibrate([15, 50, 15, 50, 15]);
      celebrate();
      toast.success("Redeemed! Ruhail's been notified.");
      setRedeemOpen(false);
      setNote("");
      router.refresh();
    } catch {
      toast.error("Couldn't redeem this right now");
    } finally {
      setRedeeming(false);
    }
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <ScratchCanvas disabled={status !== "locked" || expired} onRevealed={handleRevealed} className="aspect-square">
        <div className="flex h-full flex-col items-center justify-center gap-1 p-4 text-center">
          <span className="text-4xl" role="img" aria-hidden="true">
            {coupon.emoji}
          </span>
          <span className="font-heading text-sm">{coupon.title}</span>
          {coupon.description && <span className="text-xs text-muted-foreground">{coupon.description}</span>}
        </div>
      </ScratchCanvas>

      <div className="flex items-center justify-center p-3">
        {expired ? (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3.5" aria-hidden="true" />
            Expired
          </span>
        ) : exhausted ? (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Check className="size-3.5" aria-hidden="true" />
            Redeemed
          </span>
        ) : canRedeem ? (
          <Drawer open={redeemOpen} onOpenChange={setRedeemOpen}>
            <DrawerTrigger render={<Button size="sm" />}>Redeem</DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>
                  Redeem &ldquo;{coupon.title}&rdquo; {coupon.emoji}
                </DrawerTitle>
                <DrawerDescription>Ruhail will get notified right away.</DrawerDescription>
              </DrawerHeader>
              <div className="flex flex-col gap-1.5 p-4">
                <Label htmlFor="redeem-note">Note (optional)</Label>
                <Textarea
                  id="redeem-note"
                  className="text-base"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Tonight at 8?"
                />
              </div>
              <DrawerFooter>
                <Button onClick={handleRedeem} disabled={redeeming}>
                  {redeeming ? "Redeeming..." : "Confirm redeem"}
                </Button>
                <DrawerClose render={<Button variant="ghost" />}>Cancel</DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        ) : (
          <span className="text-xs text-muted-foreground">Scratch to reveal</span>
        )}
      </div>
    </div>
  );
}
