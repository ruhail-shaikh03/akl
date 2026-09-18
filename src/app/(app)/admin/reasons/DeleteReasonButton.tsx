"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteReason } from "./actions";

export function DeleteReasonButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    await deleteReason(id);
    router.refresh();
    toast.success("Reason deleted");
  }

  return (
    <button
      onClick={handleDelete}
      aria-label={confirming ? "Confirm delete" : "Delete"}
      className={`flex size-9 items-center justify-center rounded-full ${
        confirming ? "bg-destructive text-destructive-foreground" : "text-muted-foreground hover:bg-muted"
      }`}
    >
      <Trash2 className="size-4" aria-hidden="true" />
    </button>
  );
}
