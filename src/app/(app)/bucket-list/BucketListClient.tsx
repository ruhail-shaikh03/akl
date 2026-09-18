"use client";

import { useMemo, useState } from "react";
import { ListChecks } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BucketItemRow } from "./BucketItemRow";
import { ItemFormSheet } from "./ItemFormSheet";
import type { BucketItem } from "./types";

type Filter = "all" | "todo" | "done";

export function BucketListClient({ items }: { items: BucketItem[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const completedCount = items.filter((i) => i.completedAt).length;
  const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const filtered = useMemo(() => {
    if (filter === "todo") return items.filter((i) => !i.completedAt);
    if (filter === "done") return items.filter((i) => i.completedAt);
    return items;
  }, [items, filter]);

  return (
    <div className="flex flex-col gap-4">
      {items.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">
            {completedCount} of {items.length} done
          </span>
        </div>
      )}

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="todo">To-do</TabsTrigger>
          <TabsTrigger value="done">Done</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <div className="flex min-h-[40dvh] flex-col items-center justify-center gap-3 text-center">
          <ListChecks className="size-10 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            {items.length === 0 ? "Nothing on the list yet." : "Nothing here."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((item) => (
            <BucketItemRow key={item.id} item={item} />
          ))}
        </ul>
      )}

      <ItemFormSheet />
    </div>
  );
}
