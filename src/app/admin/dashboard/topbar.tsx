"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function TopBar({ username }: { username: string }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <div
      className="flex items-center justify-end px-6 py-3"
      style={{
        background: "rgba(0,0,0,0.15)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="text-right leading-tight">
          <div className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs"
              style={{
                background: "rgba(212,165,116,0.25)",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              {username[0]?.toUpperCase()}
            </div>
            <span className="text-sm text-white/70 font-light">{username}</span>
          </div>
          <button
            onClick={logout}
            className="text-xs text-white/25 hover:text-red-300/70 transition-colors mt-0.5"
          >
            退出登录
          </button>
        </div>
      </div>
    </div>
  );
}
