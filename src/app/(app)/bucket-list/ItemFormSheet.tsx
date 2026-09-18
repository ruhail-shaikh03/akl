"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBucketItem, updateBucketItem } from "./actions";
import type { BucketItem } from "./types";

export function ItemFormSheet({
  item,
  open,
  onOpenChange,
}: {
  item?: BucketItem;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const router = useRouter();
  const isEdit = Boolean(item);
  const [internalOpen, setInternalOpen] = useState(false);
  const [title, setTitle] = useState(item?.title ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [category, setCategory] = useState(item?.category ?? "");
  const [targetDate, setTargetDate] = useState(item?.targetDate ?? "");
  const [saving, setSaving] = useState(false);

  const isOpen = open ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title,
        description: description.trim() || undefined,
        category: category.trim() || undefined,
        targetDate: targetDate || undefined,
      };
      if (isEdit) {
        await updateBucketItem({ id: item!.id, ...payload });
      } else {
        await createBucketItem(payload);
        setTitle("");
        setDescription("");
        setCategory("");
        setTargetDate("");
      }
      router.refresh();
      setIsOpen(false);
      toast.success(isEdit ? "Updated" : "Added to the list");
    } catch {
      toast.error("Couldn't save this item");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      {!isEdit && (
        <DrawerTrigger
          className="fixed right-4 bottom-24 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"
          aria-label="Add item"
        >
          <Plus className="size-6" aria-hidden="true" />
        </DrawerTrigger>
      )}
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{isEdit ? "Edit item" : "Add to the list"}</DrawerTitle>
        </DrawerHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bl-title">Title</Label>
            <Input id="bl-title" className="text-base" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bl-description">Description (optional)</Label>
            <Textarea id="bl-description" className="text-base" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="bl-category">Category (optional)</Label>
              <Input id="bl-category" className="text-base" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Travel" />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="bl-date">Target date (optional)</Label>
              <Input id="bl-date" type="date" className="text-base" value={targetDate ?? ""} onChange={(e) => setTargetDate(e.target.value)} />
            </div>
          </div>
          <DrawerFooter className="px-0">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Save changes" : "Add"}
            </Button>
            <DrawerClose render={<Button type="button" variant="ghost" />}>Cancel</DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
