import "server-only";
import { getSession, type Role, type SessionPayload } from "./session";

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor() {
    super("Forbidden");
    this.name = "ForbiddenError";
  }
}

/** Re-verifies the session server-side. Throws if there is none. Never trust middleware alone. */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new UnauthorizedError();
  return session;
}

/** Re-verifies the session and role server-side. Use inside every admin-only Server Action/Route Handler. */
export async function requireRole(roles: Role[]): Promise<SessionPayload> {
  const session = await requireSession();
  if (!roles.includes(session.role)) throw new ForbiddenError();
  return session;
}
