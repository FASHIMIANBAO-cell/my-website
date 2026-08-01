"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CommentItem {
  id: number;
  resourceId: number | null;
  username: string;
  displayName: string;
  content: string;
  createdAt: string;
}

export default function CommentsPage() {
  const router = useRouter();
  const [comments, setComments] = useState<CommentItem[]>([]);

  useEffect(() => {
    fetch("/api/admin/comments").then(async (r) => {
      if (r.ok) setComments(await r.json());
      else if (r.status === 401) router.push("/admin");
    });
  }, [router]);

  async function deleteComment(id: number) {
    if (!confirm("确定删除？")) return;
    await fetch("/api/admin/comments", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setComments(comments.filter((c) => c.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-light tracking-wider text-white/85">留言管理</h1>
        <span className="text-xs text-white/25">{comments.length} 条留言</span>
      </div>

      <div className="space-y-2">
        {comments.map((c) => (
          <div key={c.id} className="flex items-start justify-between rounded-xl px-5 py-3.5"
            style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-white/60">{c.displayName || c.username}</span>
                <span className="text-[10px] text-white/25">{new Date(c.createdAt).toLocaleString("zh-CN")}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{
                  background: c.resourceId ? "rgba(168,216,234,0.15)" : "rgba(255,255,255,0.08)",
                  color: c.resourceId ? "#A8D8EA" : "rgba(255,255,255,0.4)"
                }}>
                  {c.resourceId ? `资源 #${c.resourceId}` : "关于页"}
                </span>
              </div>
              <p className="text-sm text-white/45 break-words">{c.content}</p>
            </div>
            <button onClick={() => deleteComment(c.id)}
              className="ml-4 text-xs text-white/20 hover:text-red-300/80 flex-shrink-0">删除</button>
          </div>
        ))}
        {comments.length === 0 && <p className="text-sm text-white/20 text-center py-16">暂无留言</p>}
      </div>
    </div>
  );
}
