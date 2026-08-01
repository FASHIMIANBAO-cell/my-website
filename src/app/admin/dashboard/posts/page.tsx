"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  published: boolean;
  createdAt: string;
}

export default function PostsManagePage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    published: false,
  });
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/posts").then(async (r) => {
      if (r.ok) setPosts(await r.json());
      else if (r.status === 401) router.push("/admin");
    });
  }, [router]);

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "untitled";
  }

  function resetForm() {
    setForm({ title: "", slug: "", content: "", excerpt: "", published: false });
    setEditing(null);
    setShowForm(false);
  }

  function editPost(post: Post) {
    setEditing(post);
    setForm({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      published: post.published,
    });
  }

  async function savePost(e: React.FormEvent) {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/posts/${editing.id}` : "/api/posts";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const saved = await res.json();
      setMessage(editing ? "已更新" : "已创建");
      resetForm();
      setShowForm(false);
      if (editing) setPosts(posts.map((p) => (p.id === editing.id ? saved : p)));
      else setPosts([saved, ...posts]);
    } else if (res.status === 401) router.push("/admin");
  }

  async function deletePost(id: number) {
    if (!confirm("确定删除？")) return;
    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPosts(posts.filter((p) => p.id !== id));
      if (editing?.id === id) resetForm();
    }
  }

  async function togglePublish(post: Post) {
    const res = await fetch(`/api/posts/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !post.published }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPosts(posts.map((p) => (p.id === post.id ? updated : p)));
    }
  }

  const cardStyle = {
    background: "rgba(255,255,255,0.07)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.08)",
  };

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-light tracking-wider text-white/85">
          文章管理
        </h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm text-white transition-all"
          style={{
            background: "rgba(212,165,116,0.2)",
            border: "1px solid rgba(212,165,116,0.3)",
          }}
        >
          <Plus size={15} />
          新建文章
        </button>
      </div>

      {message && (
        <p className="text-sm text-green-400/80 mb-4">{message}</p>
      )}

      {/* Editor */}
      {(showForm || editing) && (
      <form
        onSubmit={savePost}
        className="mb-8 rounded-xl p-6 space-y-4"
        style={cardStyle}
      >
        <h2 className="text-base font-light text-white/80">
          {editing ? "编辑文章" : "写新文章"}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="text"
            value={form.title}
            onChange={(e) => {
              const title = e.target.value;
              setForm({ ...form, title, slug: editing ? form.slug : generateSlug(title) });
            }}
            placeholder="标题"
            required
            className="rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          />
          <input
            type="text"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="自动生成..."
            className="rounded-lg px-4 py-2.5 text-sm text-white/40 placeholder-white/25 outline-none"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          />
        </div>

        <input
          type="text"
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          placeholder="摘要"
          className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        />

        <textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          rows={12}
          placeholder="Markdown 内容"
          required
          className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none font-mono"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        />

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-white/45 cursor-pointer">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="rounded accent-[#D4A574]"
            />
            发布
          </label>
          <button
            type="submit"
            className="rounded-lg px-4 py-2 text-sm text-white transition-all"
            style={{
              background: "rgba(212,165,116,0.2)",
              border: "1px solid rgba(212,165,116,0.3)",
            }}
          >
            {editing ? "更新" : "创建"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-white/35 hover:text-white/60"
            >
              取消
            </button>
          )}
        </div>
      </form>
      )}

      {/* Post list — card style */}
      <div className="space-y-2">
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex items-center justify-between rounded-xl px-5 py-3.5 transition-all hover:bg-white/[0.11]"
            style={cardStyle}
          >
            <div className="flex items-center gap-4">
              <span className="text-lg">{post.published ? "📄" : "📝"}</span>
              <div>
                <span className="text-sm text-white/80">{post.title}</span>
                <span className="ml-2 text-xs text-white/25">
                  /blog/{post.slug}
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-xs">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{
                    background: post.published ? "#8EC5A0" : "#D4A574",
                    boxShadow: post.published
                      ? "0 0 6px rgba(142,197,160,0.5)"
                      : "0 0 6px rgba(212,165,116,0.5)",
                  }}
                />
                <span className="text-white/35">
                  {post.published ? "已发布" : "草稿"}
                </span>
              </span>
            </div>
            <div className="flex gap-3 text-xs">
              <button
                onClick={() => togglePublish(post)}
                className="text-white/35 hover:text-white/70 transition-colors"
              >
                {post.published ? "下架" : "发布"}
              </button>
              <button
                onClick={() => editPost(post)}
                className="text-[#D4A574]/70 hover:text-[#D4A574] transition-colors"
              >
                编辑
              </button>
              <button
                onClick={() => deletePost(post.id)}
                className="text-white/30 hover:text-red-300/80 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <p className="text-sm text-white/20 text-center py-16">
            还没有文章，点击「新建文章」开始
          </p>
        )}
      </div>
    </div>
  );
}
