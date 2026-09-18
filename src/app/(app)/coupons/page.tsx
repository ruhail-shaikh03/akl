import { Ticket } from "lucide-react";
import { getCoupons } from "./actions";
import { CouponCard } from "./CouponCard";

export default async function CouponsPage() {
  const coupons = await getCoupons();

  return (
    <main className="mx-auto max-w-md px-4 pt-safe pt-6">
      <h1 className="mb-4 font-heading text-2xl">Coupons</h1>

      {coupons.length === 0 ? (
        <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-3 text-center">
          <Ticket className="size-10 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">No coupons yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {coupons.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} />
          ))}
        </div>
      )}
    </main>
  );
}
