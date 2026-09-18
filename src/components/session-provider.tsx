"use client";

import { createContext, useContext } from "react";
import type { SessionPayload } from "@/lib/auth/session";

const SessionContext = createContext<SessionPayload | null>(null);

export function SessionProvider({
  session,
  children,
}: {
  session: SessionPayload;
  children: React.ReactNode;
}) {
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

/** Client-side access to the current user. Only valid inside the protected (app) layout. */
export function useSession(): SessionPayload {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error("useSession must be used within the protected app layout");
  }
  return session;
}
