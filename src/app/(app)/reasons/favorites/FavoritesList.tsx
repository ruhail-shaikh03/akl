"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { toggleFavoriteReason } from "../actions";

type FavoriteReason = { id: string; text: string; imageUrl: string | null };

export function FavoritesList({ initialFavorites }: { initialFavorites: FavoriteReason[] }) {
  const [favorites, setFavorites] = useState(initialFavorites);

  async function handleRemove(id: string) {
    setFavorites((f) => f.filter((r) => r.id !== id));
    try {
      await toggleFavoriteReason(id);
    } catch {
      toast.error("Couldn't remove that favorite");
      setFavorites(initialFavorites);
    }
  }

  if (favorites.length === 0) {
    return <p className="text-sm text-muted-foreground">No favorites yet — hearts you tap in the jar show up here.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {favorites.map((reason) => (
        <li key={reason.id} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card p-3">
          <span className="text-sm">{reason.text}</span>
          <button
            onClick={() => handleRemove(reason.id)}
            aria-label="Remove from favorites"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-primary"
          >
            <Heart className="size-4 fill-primary" aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}
