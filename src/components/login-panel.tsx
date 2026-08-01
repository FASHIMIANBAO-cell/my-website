"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff } from "lucide-react";

interface LoginPanelProps {
  open: boolean;
  onClose: () => void;
  onRegister: () => void;
}

export function LoginPanel({ open, onClose, onRegister }: LoginPanelProps) {
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [eyeAnimating, setEyeAnimating] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError("");

      const res = await fetch("/api/auth/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", username, password }),
      });

      if (res.ok) {
        await new Promise((r) => setTimeout(r, 200));
        onClose();
        window.location.reload();
      } else {
        const data = await res.json();
        setError(data.error || "登录失败");
      }
      setLoading(false);
    },
    [username, password, onClose]
  );

  const togglePassword = () => {
    setEyeAnimating(true);
    setShowPassword(!showPassword);
    setTimeout(() => setEyeAnimating(false), 200);
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ y: "30%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "30%", opacity: 0 }}
              transition={{ type: "tween", duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
              className="w-full max-w-md rounded-[26px] px-8 pb-10 pt-6 shadow-2xl shadow-black/40"
              style={{
                background: "rgba(255, 255, 255, 0.35)",
                backdropFilter: "blur(30px)",
                WebkitBackdropFilter: "blur(30px)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="flex items-center justify-between mb-8"
              >
                <div className="flex-1 flex justify-center">
                  <div className="h-1 w-9 rounded-full bg-white/40" />
                </div>
                <button
                  onClick={onClose}
                  className="flex h-7 w-7 items-center justify-center rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.25)",
                  }}
                >
                  <X size={14} className="text-white/70" />
                </button>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.35 }}
                className="text-center text-xl font-light tracking-wider text-white/90 mb-8"
              >
                欢迎回来
              </motion.h2>

              <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28, duration: 0.35 }}
                >
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="账号"
                    autoComplete="off"
                    required
                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition-all duration-300 focus:ring-[#A8D8EA]/30 focus:ring-[5px]"
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      boxShadow: "inset 0 1px 2px rgba(255,255,255,0.06)",
                    }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.35 }}
                  className="relative"
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="密码"
                    autoComplete="new-password"
                    required
                    className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/40 outline-none transition-all duration-300 focus:ring-[#A8D8EA]/30 focus:ring-[5px]"
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      boxShadow: "inset 0 1px 2px rgba(255,255,255,0.06)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    <motion.div
                      animate={{ scale: eyeAnimating ? [1, 0.85, 1] : 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {showPassword ? <Eye size={14} className="text-white/60" /> : <EyeOff size={14} className="text-white/60" />}
                    </motion.div>
                  </button>
                </motion.div>

                {error && <p className="text-sm text-red-300 text-center">{error}</p>}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.35 }}
                >
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.97, y: 2 }}
                    className="w-full rounded-xl py-3 text-sm font-medium tracking-wider transition-all disabled:opacity-60"
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      color: "white",
                      boxShadow: "0 0 20px rgba(168,216,234,0.15)",
                    }}
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        登录中...
                      </span>
                    ) : (
                      "登  录"
                    )}
                  </motion.button>
                </motion.div>
              </form>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.58, duration: 0.35 }}
                className="mt-6 text-center text-xs text-white/35"
              >
                还没有账号？{" "}
                <button
                  type="button"
                  onClick={() => { onClose(); setTimeout(() => onRegister(), 300); }}
                  className="text-[#A8D8EA] hover:text-white transition-colors"
                >
                  注册
                </button>
              </motion.p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
