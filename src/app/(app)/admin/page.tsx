import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function AdminPage() {
  const session = await getSession();
  if (session?.role !== "admin") {
    redirect("/");
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-2 px-4 pt-safe pt-6">
      <h1 className="font-heading text-2xl">Admin</h1>
      <p className="text-sm text-muted-foreground">
        Content management (letters, reasons, coupons, personal context, notification settings) arrives phase by
        phase as each feature is built.
      </p>
    </main>
  );
}
