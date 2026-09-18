import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getRedemptions } from "../actions";
import { RedemptionRow } from "./RedemptionRow";

export default async function RedemptionsPage() {
  const redemptions = await getRedemptions();

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 px-4 pb-8 pt-safe pt-6">
      <Link href="/admin/coupons" className="flex w-fit items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back
      </Link>
      <h1 className="font-heading text-2xl">Redemptions</h1>

      {redemptions.length === 0 && <p className="text-sm text-muted-foreground">No redemptions yet.</p>}

      <ul className="flex flex-col gap-2">
        {redemptions.map((r) => (
          <RedemptionRow key={r.id} redemption={r} />
        ))}
      </ul>
    </main>
  );
}
