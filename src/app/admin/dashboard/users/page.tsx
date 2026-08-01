"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserItem {
  id: number;
  username: string;
  displayName: string;
  avatar: string;
  createdAt: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>([]);

  useEffect(() => {
    fetch("/api/admin/users").then(async (r) => {
      if (r.ok) setUsers(await r.json());
      else if (r.status === 401) router.push("/admin");
    });
  }, [router]);

  async function deleteUser(id: number) {
    if (!confirm("确定删除该用户？")) return;
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setUsers(users.filter((u) => u.id !== id));
  }

  return (
    <div>
      <h1 className="text-2xl font-light tracking-wider text-white/85 mb-8">
        用户管理
      </h1>
      <div className="space-y-2">
        {users.map((u) => (
          <div
            key={u.id}
            className="flex items-center justify-between rounded-xl px-5 py-3.5"
            style={{
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="flex items-center gap-4">
              {u.avatar ? (
                <img src={u.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs"
                  style={{ background: "rgba(168,216,234,0.25)", color: "rgba(255,255,255,0.8)" }}
                >
                  {u.username[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <span className="text-sm text-white/80">
                  {u.displayName || u.username}
                </span>
                <span className="ml-2 text-xs text-white/25">@{u.username}</span>
              </div>
              <span className="text-xs text-white/20">
                {new Date(u.createdAt).toLocaleDateString("zh-CN")}
              </span>
            </div>
            <button
              onClick={() => deleteUser(u.id)}
              className="text-xs text-white/25 hover:text-red-300/80 transition-colors"
            >
              删除
            </button>
          </div>
        ))}
        {users.length === 0 && (
          <p className="text-sm text-white/20 text-center py-16">暂无用户</p>
        )}
      </div>
    </div>
  );
}
