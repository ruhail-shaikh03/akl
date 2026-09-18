import { notFound } from "next/navigation";
import { getAdminLetter } from "../../actions";
import { LetterForm } from "../../LetterForm";

export default async function EditLetterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const letter = await getAdminLetter(id);
  if (!letter) notFound();

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 px-4 pb-8 pt-safe pt-6">
      <h1 className="font-heading text-2xl">Edit letter</h1>
      <LetterForm initialLetter={letter} />
    </main>
  );
}
