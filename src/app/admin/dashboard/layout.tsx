import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardSidebar } from "./sidebar";
import { TopBar } from "./topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin");

  return (
    <div className="relative z-50 flex min-h-screen">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <TopBar username={session.username} />
        <main className="flex-1 p-8 md:p-10">{children}</main>
        <a
          href="/"
          className="fixed bottom-5 right-5 z-50 glass px-3 py-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          回网站
        </a>
      </div>
    </div>
  );
}
