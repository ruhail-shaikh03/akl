import { getTodaysCheckin } from "./actions";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { nowKarachiTime } from "@/lib/time";
import { MoodPageClient } from "./MoodPageClient";

export default async function MoodPage() {
  const checkin = await getTodaysCheckin();
  const waLink = getWhatsAppLink("Hey, I'm feeling a bit down, can we talk? 💛");
  const isEvening = Number(nowKarachiTime().split(":")[0]) >= 20;

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 px-4 pt-safe pt-6">
      <h1 className="font-heading text-2xl">How are you?</h1>
      <MoodPageClient initialLevel={checkin?.moodLevel ?? null} waLink={waLink} isEvening={isEvening} />
    </main>
  );
}
