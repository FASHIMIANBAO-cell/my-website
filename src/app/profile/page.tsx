"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/user-provider";

interface FavPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const { refresh } = useUser();
  const [user, setUser] = useState<{ username: string; avatar: string } | null>(null);
  const [favorites, setFavorites] = useState<FavPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/user");
      const data = await res.json();
      if (!data.loggedIn) { router.push("/"); return; }
      setUser(data);
      if (data.favorites) setFavorites(data.favorites);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    const res = await fetch("/api/user/avatar", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      setUser((prev) => prev ? { ...prev, avatar: data.avatar } : null);
      refresh();
    }
  }

  if (loading) return null;

  return (
    <div className="min-h-screen px-4 py-24">
      <div className="mx-auto max-w-2xl">
        {/* 头像 + 用户名 */}
        <div className="flex flex-col items-center mb-12">
          <button
            onClick={() => fileRef.current?.click()}
            className="group relative overflow-hidden rounded-full"
            style={{ width: 72, height: 72 }}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-2xl"
                style={{ background: "rgba(168,216,234,0.25)", color: "rgba(255,255,255,0.85)" }}
              >
                {user?.username?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-white/80">更换头像</span>
            </div>
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          <h1 className="mt-4 text-xl font-light text-white/85">{user?.username}</h1>
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/");
              window.location.reload();
            }}
            className="mt-1 text-xs text-white/25 hover:text-red-300/70 transition-colors"
          >
            退出登录
          </button>
        </div>

        {/* 收藏 */}
        <h2 className="text-lg font-light text-white/70 mb-6">我的收藏</h2>
        <div className="grid gap-3">
          {favorites.map((fav) => (
            <Link
              key={fav.id}
              href={`/blog/${fav.slug}`}
              className="glass flex items-center justify-between px-5 py-4"
            >
              <div>
                <h3 className="text-sm text-white/80">{fav.title}</h3>
                <p className="mt-0.5 text-xs text-white/35 line-clamp-1">{fav.excerpt}</p>
              </div>
              <span className="text-xs text-white/25">
                {new Date(fav.createdAt).toLocaleDateString("zh-CN")}
              </span>
            </Link>
          ))}
          {favorites.length === 0 && (
            <p className="text-sm text-white/25 text-center py-12">还没有收藏文章</p>
          )}
        </div>

        <Link href="/" className="mt-10 inline-block text-xs text-white/30 hover:text-white/60 transition-colors">
          ← 回到首页
        </Link>
      </div>
    </div>
  );
}
