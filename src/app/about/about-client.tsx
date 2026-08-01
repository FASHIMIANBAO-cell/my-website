"use client";

import { useEffect, useState } from "react";
import { CommentSection } from "@/components/comment-section";

export function AboutClient() {
  const [content, setContent] = useState("");
  const [email, setEmail] = useState("");
  const [github, setGithub] = useState("");

  useEffect(() => {
    async function load() {
      const [c, e, g] = await Promise.all([
        fetch("/api/settings?key=about_content").then(r => r.json()),
        fetch("/api/settings?key=about_email").then(r => r.json()),
        fetch("/api/settings?key=about_github").then(r => r.json()),
      ]);
      setContent(c.value || "你好，我是 SangYu，一名热爱技术的全栈开发者。\n\n这个网站是我个人世界的对外窗口——写心得、分享资源、记录成长。\n\n希望这里能成为一个安静、有温度的角落。欢迎常来逛逛。");
      setEmail(e.value || "");
      setGithub(g.value || "");
    }
    load();
  }, []);

  return (
    <div className="px-4 py-24">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-light tracking-wider text-white/90 mb-12">关于我</h1>

        <div className="glass px-8 py-8 space-y-5 leading-loose text-white/85"
          style={{ background: "rgba(168,216,234,0.12)" }}>
          {content.split("\n").map((line, i) => (
            <p key={i}>{line || "\u00A0"}</p>
          ))}
          {(email || github) && (
            <div className="pt-4 border-t border-white/10">
              {email && <p className="text-sm text-white/35">联系邮箱：{email}</p>}
              {github && <p className="text-sm text-white/35">GitHub：{github}</p>}
            </div>
          )}
        </div>

        <CommentSection />
      </div>
    </div>
  );
}
