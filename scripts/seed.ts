import "dotenv/config";
import { db } from "@/db";
import { users, personalContext, appSettings, notificationSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { QuietHoursSetting } from "@/db/schema/appSettings";

async function upsertUser(role: "admin" | "partner", displayName: string, passcodeHash: string) {
  const [existing] = await db.select().from(users).where(eq(users.role, role)).limit(1);
  if (existing) {
    console.log(`- ${role} user already exists, skipping`);
    return;
  }
  await db.insert(users).values({ role, displayName, passcodeHash });
  console.log(`- created ${role} user`);
}

async function main() {
  const adminHash = process.env.ADMIN_PASSCODE_HASH;
  const partnerHash = process.env.PARTNER_PASSCODE_HASH;
  if (!adminHash || !partnerHash) {
    throw new Error(
      "ADMIN_PASSCODE_HASH and PARTNER_PASSCODE_HASH must be set. Generate one with: npm run hash-passcode -- \"your passcode\"",
    );
  }

  await upsertUser("admin", "Ruhail", adminHash);
  await upsertUser("partner", "Aisha", partnerHash);

  const [existingContext] = await db.select().from(personalContext).limit(1);
  if (!existingContext) {
    await db.insert(personalContext).values({
      id: 1,
      partnerName: "Aisha",
      relationshipStartDate: "2020-01-01",
      partnerBirthday: "2000-01-01",
    });
    console.log("- created placeholder personal_context row (edit via /admin/personal-context once built)");
  } else {
    console.log("- personal_context already exists, skipping");
  }

  const [existingQuietHours] = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.key, "quiet_hours"))
    .limit(1);
  if (!existingQuietHours) {
    const value: QuietHoursSetting = { enabled: true, start: "22:00", end: "08:00", tz: "Asia/Karachi" };
    await db.insert(appSettings).values({ key: "quiet_hours", value });
    console.log("- created quiet_hours app_setting");
  } else {
    console.log("- quiet_hours app_setting already exists, skipping");
  }

  const defaultEvents: { eventType: string; quietHoursExempt: boolean }[] = [
    { eventType: "letter.opened", quietHoursExempt: false },
    { eventType: "coupon.redeemed", quietHoursExempt: false },
    { eventType: "mood.checkin", quietHoursExempt: false },
    { eventType: "bucketlist.completed", quietHoursExempt: false },
    { eventType: "chat.distress_detected", quietHoursExempt: true },
  ];
  for (const { eventType, quietHoursExempt } of defaultEvents) {
    const [existing] = await db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.eventType, eventType))
      .limit(1);
    if (!existing) {
      await db.insert(notificationSettings).values({ eventType, enabled: true, quietHoursExempt });
      console.log(`- created notification_settings row for ${eventType}`);
    }
  }

  console.log("\nSeed complete.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
