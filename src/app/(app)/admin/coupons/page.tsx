import Link from "next/link";
import { Plus, Pencil, ClipboardList } from "lucide-react";
import { getAdminCoupons } from "./actions";
import { CouponRowActions } from "./CouponRowActions";

function statusLabel(coupon: Awaited<ReturnType<typeof getAdminCoupons>>[number]): string {
  const expired = coupon.expiryAt ? new Date(coupon.expiryAt) < new Date() : false;
  if (expired) return "expired";
  if (coupon.status === "locked") return "locked";
  if (coupon.status === "redeemed") return "redeemed";
  return coupon.usageType === "multi" ? `revealed · ${coupon.usesCount} used` : "revealed";
}

export default async function AdminCouponsPage() {
  const coupons = await getAdminCoupons();

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 px-4 pb-8 pt-safe pt-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl">Coupons</h1>
        <Link
          href="/admin/coupons/new"
          className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
        >
          <Plus className="size-4" aria-hidden="true" />
          New
        </Link>
      </div>

      <Link href="/admin/coupons/redemptions" className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-sm">
        <ClipboardList className="size-4 text-primary" aria-hidden="true" />
        Redemption log
      </Link>

      {coupons.length === 0 && <p className="text-sm text-muted-foreground">No coupons yet.</p>}

      <ul className="flex flex-col gap-2">
        {coupons.map((coupon) => (
          <li key={coupon.id} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card p-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="text-xl">{coupon.emoji}</span>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{coupon.title}</span>
                <span className="text-xs text-muted-foreground">{statusLabel(coupon)}</span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Link
                href={`/admin/coupons/${coupon.id}/edit`}
                aria-label="Edit"
                className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <Pencil className="size-4" aria-hidden="true" />
              </Link>
              <CouponRowActions id={coupon.id} showReissue={coupon.status !== "locked"} />
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
