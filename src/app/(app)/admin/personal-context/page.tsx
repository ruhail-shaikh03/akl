import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getPersonalContext } from "./actions";
import { PersonalContextForm } from "./PersonalContextForm";

export default async function PersonalContextPage() {
  const session = await getSession();
  if (session?.role !== "admin") redirect("/");

  const context = await getPersonalContext();
  if (!context) {
    return (
      <main className="mx-auto flex max-w-md flex-col gap-4 px-4 pt-safe pt-6">
        <h1 className="font-heading text-2xl">Personal context</h1>
        <p className="text-sm text-muted-foreground">
          No row found — run the seed script first (npm run db:seed).
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 px-4 pb-8 pt-safe pt-6">
      <h1 className="font-heading text-2xl">Personal context</h1>
      <p className="text-sm text-muted-foreground">This shapes how the chatbot talks to her — keep it warm and specific.</p>
      <PersonalContextForm
        initial={{
          partnerName: context.partnerName,
          nicknames: context.nicknames,
          insideJokes: context.insideJokes,
          cheerUpList: context.cheerUpList,
          favorites: context.favorites,
          avoidTopics: context.avoidTopics,
          tone: context.tone,
          language: context.language,
          relationshipStartDate: context.relationshipStartDate,
          partnerBirthday: context.partnerBirthday,
          adminName: context.adminName,
        }}
      />
    </main>
  );
}
