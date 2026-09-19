import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";

const [, , role, passcode] = process.argv;

if (role !== "admin" && role !== "partner") {
  console.error('Usage: npm run set-passcode -- admin|partner "new passcode"');
  process.exit(1);
}
if (!passcode) {
  console.error('Usage: npm run set-passcode -- admin|partner "new passcode"');
  process.exit(1);
}

async function main() {
  const hash = await bcrypt.hash(passcode, 12);
  const result = await db
    .update(users)
    .set({ passcodeHash: hash })
    .where(eq(users.role, role as "admin" | "partner"))
    .returning({ id: users.id });

  if (result.length === 0) {
    console.error(`No ${role} user found — run npm run db:seed first.`);
    process.exit(1);
  }
  console.log(`Updated ${role}'s passcode.`);
}

main().then(() => process.exit(0));
