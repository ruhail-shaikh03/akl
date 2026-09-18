import Link from "next/link";
import { Heart } from "lucide-react";
import { getReasonsOverview } from "./actions";
import { ReasonJar } from "./ReasonJar";

export default async function ReasonsPage() {
  const { total, favoriteCount } = await getReasonsOverview();

  return (
    <main className="mx-auto flex max-w-md flex-col px-4 pt-safe pt-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl">Reasons I Love You</h1>
        <Link href="/reasons/favorites" className="flex items-center gap-1 text-sm text-muted-foreground">
          <Heart className="size-4" aria-hidden="true" />
          {favoriteCount}
        </Link>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{total} reasons and counting</p>

      <ReasonJar initialTotal={total} />
    </main>
  );
}
