"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteCoupon, reissueCoupon } from "./actions";

export function CouponRowActions({ id, showReissue }: { id: string; showReissue: boolean }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    await deleteCoupon(id);
    router.refresh();
    toast.success("Coupon deleted");
  }

  async function handleReissue() {
    await reissueCoupon(id);
    router.refresh();
    toast.success("Coupon reissued");
  }

  return (
    <div className="flex shrink-0 items-center gap-1">
      {showReissue && (
        <button
          onClick={handleReissue}
          aria-label="Reissue"
          className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
        </button>
      )}
      <button
        onClick={handleDelete}
        aria-label={confirming ? "Confirm delete" : "Delete"}
        className={`flex size-9 items-center justify-center rounded-full ${
          confirming ? "bg-destructive text-destructive-foreground" : "text-muted-foreground hover:bg-muted"
        }`}
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
