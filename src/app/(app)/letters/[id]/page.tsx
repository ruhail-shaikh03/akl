import { notFound, redirect } from "next/navigation";
import { getLetter } from "../actions";
import { LetterReveal } from "./LetterReveal";

export default async function LetterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const letter = await getLetter(id);
  if (!letter) notFound();

  const locked = letter.unlockAt ? new Date(letter.unlockAt) > new Date() : false;
  if (locked) redirect("/letters");

  return <LetterReveal letter={letter} />;
}
