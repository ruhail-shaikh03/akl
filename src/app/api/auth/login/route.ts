import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { loginSchema } from "@/lib/validations/auth.schema";
import { verifyPasscode } from "@/lib/auth/passcode";
import { setSessionCookie } from "@/lib/auth/session";
import { checkLoginLimit } from "@/lib/ratelimit/limiters";

export const runtime = "nodejs";

function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { role, passcode } = parsed.data;

  const ip = getClientIp(req);
  const { success } = await checkLoginLimit(ip, role);
  if (!success) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const [user] = await db.select().from(users).where(eq(users.role, role)).limit(1);
  if (!user) {
    return NextResponse.json({ error: "Invalid passcode" }, { status: 401 });
  }

  const valid = await verifyPasscode(passcode, user.passcodeHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid passcode" }, { status: 401 });
  }

  await setSessionCookie({ sub: user.id, role: user.role, name: user.displayName });

  return NextResponse.json({ ok: true, role: user.role, name: user.displayName });
}
