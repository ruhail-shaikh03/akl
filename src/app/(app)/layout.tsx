import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { SessionProvider } from "@/components/session-provider";
import { BottomTabBar } from "@/components/nav/BottomTabBar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <SessionProvider session={session}>
      <div className="flex min-h-dvh flex-col">
        <div className="flex-1 pb-24">{children}</div>
        <BottomTabBar />
      </div>
    </SessionProvider>
  );
}
