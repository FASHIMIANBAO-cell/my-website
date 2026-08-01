import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { post, resource } from "@/lib/db";
import { FileText, Package } from "lucide-react";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/admin");

  const postCount = (await post.findMany()).length;
  const resourceCount = (await resource.findMany()).length;

  return (
    <div>
      <h1 className="text-2xl font-light tracking-wider text-white/85 mb-1">
        仪表盘
      </h1>
      <p className="text-sm text-white/35 mb-10">欢迎回来，{session.username}</p>

      <div className="grid gap-4 sm:grid-cols-2 mb-10">
        <Link
          href="/admin/dashboard/posts"
          className="rounded-xl px-6 py-7 transition-all hover:translate-y-[-2px]"
          style={{
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="flex items-center justify-between">
            <FileText size={22} className="text-white/40" />
            <span className="text-2xl font-light text-white/70">{postCount}</span>
          </div>
          <p className="mt-3 text-sm text-white/50">文章总数</p>
        </Link>

        <Link
          href="/admin/dashboard/resources"
          className="rounded-xl px-6 py-7 transition-all hover:translate-y-[-2px]"
          style={{
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="flex items-center justify-between">
            <Package size={22} className="text-white/40" />
            <span className="text-2xl font-light text-white/70">{resourceCount}</span>
          </div>
          <p className="mt-3 text-sm text-white/50">资源总数</p>
        </Link>
      </div>
    </div>
  );
}
