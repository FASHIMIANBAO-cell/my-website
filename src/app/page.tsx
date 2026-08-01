"use client";

import Link from "next/link";
import { useState } from "react";
import { LoginPanel } from "@/components/login-panel";
import { RegisterPanel } from "@/components/register-panel";
import { useUser } from "@/components/user-provider";

function HomeContent() {
  const { username, displayName, avatar, loading } = useUser();
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        {/* 右上角 */}
        <div className="fixed top-5 right-5 z-20">
          {loading ? null : username ? (
            <Link href="/profile" className="flex flex-col items-center gap-1.5">
              {avatar ? (
                <img src={avatar} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-white/20" />
              ) : (
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-sm ring-1 ring-white/20"
                  style={{ background: "rgba(168,216,234,0.25)", color: "rgba(255,255,255,0.8)" }}
                >
                  {username[0]?.toUpperCase()}
                </div>
              )}
              <span className="text-xs text-white/50">{displayName || username}</span>
            </Link>
          ) : (
            <button
              onClick={() => setLoginOpen(true)}
              className="glass px-4 py-2 text-sm font-light text-white/50 hover:text-white/80 transition-colors"
            >
              登录
            </button>
          )}
        </div>

        <div className="text-center space-y-6 -mt-10">
          <h1 className="text-6xl md:text-7xl font-light tracking-wider text-white/90">
            SangYu
          </h1>
          <p className="text-lg text-white/40 font-light tracking-widest">
            欢迎来到我的主页
          </p>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-3 w-full max-w-2xl">
          <Link href="/resources" className="glass px-6 py-8 text-center">
            <span className="text-2xl">📦</span>
            <h3 className="mt-3 text-lg font-light text-white/90">资源库</h3>
            <p className="mt-1 text-sm text-white/50">分类展示可下载资源</p>
          </Link>

          <Link href="/blog" className="glass px-6 py-8 text-center">
            <span className="text-2xl">✍️</span>
            <h3 className="mt-3 text-lg font-light text-white/90">文档</h3>
            <p className="mt-1 text-sm text-white/50">技术笔记与思考</p>
          </Link>

          <Link href="/about" className="glass px-6 py-8 text-center">
            <span className="text-2xl">🌸</span>
            <h3 className="mt-3 text-lg font-light text-white/90">关于我</h3>
            <p className="mt-1 text-sm text-white/50">个人介绍与联系</p>
          </Link>
        </div>
      </div>

      <LoginPanel
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onRegister={() => { setLoginOpen(false); setRegisterOpen(true); }}
      />
      <RegisterPanel
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onBackToLogin={() => { setRegisterOpen(false); setLoginOpen(true); }}
      />
    </>
  );
}

export default function Home() {
  return <HomeContent />;
}
