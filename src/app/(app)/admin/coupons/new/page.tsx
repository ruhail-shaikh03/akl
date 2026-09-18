import { CouponForm } from "../CouponForm";

export default function NewCouponPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 px-4 pb-8 pt-safe pt-6">
      <h1 className="font-heading text-2xl">New coupon</h1>
      <CouponForm />
    </main>
  );
}
