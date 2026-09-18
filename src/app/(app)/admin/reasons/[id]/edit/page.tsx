import { notFound } from "next/navigation";
import { getAdminReason } from "../../actions";
import { ReasonForm } from "../../ReasonForm";

export default async function EditReasonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reason = await getAdminReason(id);
  if (!reason) notFound();

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 px-4 pb-8 pt-safe pt-6">
      <h1 className="font-heading text-2xl">Edit reason</h1>
      <ReasonForm initialReason={reason} />
    </main>
  );
}
