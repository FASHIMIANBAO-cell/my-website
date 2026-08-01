"use client";

import { useEffect, useState } from "react";

export default function AboutEditPage() {
  const [content, setContent] = useState("");
  const [email, setEmail] = useState("");
  const [github, setGithub] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const [aboutRes, emailRes, githubRes] = await Promise.all([
        fetch("/api/settings?key=about_content"),
        fetch("/api/settings?key=about_email"),
        fetch("/api/settings?key=about_github"),
      ]);
      if (aboutRes.ok) setContent((await aboutRes.json()).value);
      if (emailRes.ok) setEmail((await emailRes.json()).value);
      if (githubRes.ok) setGithub((await githubRes.json()).value);
    }
    load();
  }, []);

  async function save() {
    setSaving(true);
    await Promise.all([
      fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "about_content", value: content }),
      }),
      fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "about_email", value: email }),
      }),
      fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "about_github", value: github }),
      }),
    ]);
    setSaving(false);
    setMessage("已保存");
    setTimeout(() => setMessage(""), 2000);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-light tracking-wider text-white/85">关于我编辑</h1>
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg px-5 py-2 text-sm text-white transition-all"
          style={{ background: "rgba(212,165,116,0.2)", border: "1px solid rgba(212,165,116,0.3)" }}
        >
          {saving ? "保存中..." : "保存"}
        </button>
      </div>

      {message && <p className="text-sm text-green-400/80 mb-4">{message}</p>}

      <div className="space-y-5">
        <div>
          <label className="text-xs text-white/35 mb-2 block">个人介绍（支持换行）</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder="写一些关于自己的介绍..."
            className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 outline-none resize-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs text-white/35 mb-2 block">联系邮箱</label>
            <input
              type="text" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
          </div>
          <div>
            <label className="text-xs text-white/35 mb-2 block">GitHub</label>
            <input
              type="text" value={github} onChange={(e) => setGithub(e.target.value)}
              placeholder="github.com/..."
              className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
