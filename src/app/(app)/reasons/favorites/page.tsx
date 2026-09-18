import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getFavoriteReasons } from "../actions";
import { FavoritesList } from "./FavoritesList";

export default async function FavoriteReasonsPage() {
  const favorites = await getFavoriteReasons();

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 px-4 pb-8 pt-safe pt-6">
      <Link href="/reasons" className="flex w-fit items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back
      </Link>
      <h1 className="font-heading text-2xl">Favorites</h1>
      <FavoritesList initialFavorites={favorites} />
    </main>
  );
}
