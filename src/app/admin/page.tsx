"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      await new Promise((r) => setTimeout(r, 400));
      router.push("/admin/dashboard");
    } else {
      const data = await res.json();
      setError(data.error || "登录失败");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
    setLoading(false);
  }

  return (
    <div className="relative z-50 flex min-h-screen items-center justify-center px-4">
      <motion.div
        animate={shake ? { x: [0, -8, 8, -8, 8, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[400px] rounded-2xl px-8 py-10"
        style={{
          background: "rgba(255,255,255,0.18)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.2)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
        }}
      >
        <div className="text-center mb-8">
          <span className="text-2xl">⚡</span>
          <h1 className="mt-2 text-xl font-light tracking-widest text-white/85">
            管理后台
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="管理员用户名"
            required
            className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/35 outline-none transition-all duration-300"
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(212,165,116,0.5)";
              e.target.style.boxShadow = "0 0 0 4px rgba(212,165,116,0.12)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(255,255,255,0.15)";
              e.target.style.boxShadow = "inset 0 1px 2px rgba(0,0,0,0.1)";
            }}
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密码"
            required
            className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/35 outline-none transition-all duration-300"
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(212,165,116,0.5)";
              e.target.style.boxShadow = "0 0 0 4px rgba(212,165,116,0.12)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(255,255,255,0.15)";
              e.target.style.boxShadow = "inset 0 1px 2px rgba(0,0,0,0.1)";
            }}
          />

          {error && (
            <p className="text-sm text-center text-red-300/80">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 text-sm font-medium tracking-wider text-white transition-all disabled:opacity-50"
            style={{
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.25)",
              boxShadow: "0 0 24px rgba(212,165,116,0.1)",
            }}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
                验证中...
              </span>
            ) : (
              "登  录"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/25">
          首次登录即自动创建管理员账号
        </p>
      </motion.div>
    </div>
  );
}
