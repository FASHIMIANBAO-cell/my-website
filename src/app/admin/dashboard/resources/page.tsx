"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Upload } from "lucide-react";

interface Resource {
  id: number;
  name: string;
  description: string;
  category: string;
  image: string;
  downloadLinks: string;
  downloads: number;
}

interface DownloadLink {
  label: string;
  url: string;
  code?: string;
}

export default function ResourcesManagePage() {
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [form, setForm] = useState({ name: "", description: "", category: "", image: "" });
  const [links, setLinks] = useState<DownloadLink[]>([{ label: "", url: "", code: "" }]);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/resources").then(async (r) => {
      if (r.ok) setResources(await r.json());
      else if (r.status === 401) router.push("/admin");
    });
  }, [router]);

  function resetForm() {
    setForm({ name: "", description: "", category: "", image: "" });
    setLinks([{ label: "", url: "", code: "" }]);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch("/api/resources/upload", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      setForm({ ...form, image: data.url });
    }
    setUploading(false);
  }

  function updateLink(i: number, field: keyof DownloadLink, value: string) {
    setLinks(links.map((l, idx) => idx === i ? { ...l, [field]: value } : l));
  }

  async function addResource(e: React.FormEvent) {
    e.preventDefault();
    const validLinks = links.filter((l) => l.label && l.url);
    const res = await fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        category: form.category,
        image: form.image,
        downloadLinks: JSON.stringify(validLinks),
      }),
    });
    if (res.ok) {
      const saved = await res.json();
      setResources([saved, ...resources]);
      resetForm();
      setShowForm(false);
      setMessage("已添加");
    }
  }

  async function deleteResource(id: number) {
    if (!confirm("确定删除？")) return;
    await fetch(`/api/resources/${id}`, { method: "DELETE" });
    setResources(resources.filter((r) => r.id !== id));
  }

  const cardStyle = {
    background: "rgba(255,255,255,0.07)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.08)",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-light tracking-wider text-white/85">资源管理</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm text-white"
          style={{ background: "rgba(212,165,116,0.2)", border: "1px solid rgba(212,165,116,0.3)" }}
        >
          <Plus size={15} />{showForm ? "收起表单" : "新建资源"}
        </button>
      </div>

      {message && <p className="text-sm text-green-400/80 mb-4">{message}</p>}

      {showForm && (
        <form onSubmit={addResource} className="mb-8 rounded-xl p-6 space-y-4" style={cardStyle}>
          <h2 className="text-base font-light text-white/80">添加资源</h2>
          <input
            type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="资源名称 *" required
            className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="分类（可选）"
              className="rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
            <div>
              {form.image ? (
                <div className="relative inline-block">
                  <img src={form.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  <button type="button" onClick={() => setForm({ ...form, image: "" })}
                    className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white/70 hover:text-white">
                    <X size={11} />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm text-white/35 hover:text-white/60 transition-colors"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px dashed rgba(255,255,255,0.15)" }}>
                  <Upload size={15} />
                  {uploading ? "上传中..." : "上传封面图片（可选）"}
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>
          </div>
          <textarea
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="资源介绍（可选）" rows={3}
            className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none resize-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          />
          <div>
            <label className="text-xs text-white/35 mb-2 block">下载渠道（可选）</label>
            {links.map((link, i) => (
              <div key={i} className="flex gap-2 mb-2 items-start">
                <div className="flex-1 grid gap-2 sm:grid-cols-3">
                  <input type="text" value={link.label} onChange={(e) => updateLink(i, "label", e.target.value)}
                    placeholder="渠道名称"
                    className="rounded-lg px-3 py-2 text-xs text-white placeholder-white/25 outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  <input type="text" value={link.url} onChange={(e) => updateLink(i, "url", e.target.value)}
                    placeholder="下载链接"
                    className="rounded-lg px-3 py-2 text-xs text-white placeholder-white/25 outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  <input type="text" value={link.code || ""} onChange={(e) => updateLink(i, "code", e.target.value)}
                    placeholder="提取码（可选）"
                    className="rounded-lg px-3 py-2 text-xs text-white placeholder-white/25 outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
                </div>
                {links.length > 1 && (
                  <button type="button" onClick={() => setLinks(links.filter((_, idx) => idx !== i))}
                    className="text-white/20 hover:text-red-300/70 mt-1.5"><X size={14} /></button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setLinks([...links, { label: "", url: "", code: "" }])}
              className="text-xs text-[#D4A574]/60 hover:text-[#D4A574]">+ 添加更多渠道</button>
          </div>
          <button type="submit" className="rounded-lg px-5 py-2 text-sm text-white"
            style={{ background: "rgba(212,165,116,0.2)", border: "1px solid rgba(212,165,116,0.3)" }}>保存</button>
        </form>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((r) => (
          <div key={r.id} className="rounded-xl p-5 group transition-all hover:bg-white/[0.11]" style={cardStyle}>
            <div className="flex items-start justify-between">
              {r.image ? <img src={r.image} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <span className="text-2xl">📦</span>}
              <button onClick={() => deleteResource(r.id)}
                className="text-xs text-white/20 hover:text-red-300/80 opacity-0 group-hover:opacity-100">删除</button>
            </div>
            <h3 className="mt-3 text-sm text-white/75">{r.name}</h3>
            <span className="text-xs text-[#D4A574]/70">{r.category}</span>
            <p className="mt-1 text-xs text-white/35">下载 {r.downloads} 次</p>
          </div>
        ))}
        {resources.length === 0 && <p className="text-sm text-white/20 text-center py-16 sm:col-span-3">还没有资源</p>}
      </div>
    </div>
  );
}
