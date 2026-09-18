import { notFound } from "next/navigation";
import { getAdminCoupon } from "../../actions";
import { CouponForm } from "../../CouponForm";

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const coupon = await getAdminCoupon(id);
  if (!coupon) notFound();

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 px-4 pb-8 pt-safe pt-6">
      <h1 className="font-heading text-2xl">Edit coupon</h1>
      <CouponForm initialCoupon={coupon} />
    </main>
  );
}
