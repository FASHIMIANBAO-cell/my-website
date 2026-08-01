"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@/components/user-provider";

interface Comment {
  id: number;
  parentId: number | null;
  content: string;
  createdAt: string;
  username: string;
  displayName: string;
  avatar: string;
}

function Avatar({ src, name }: { src?: string; name?: string }) {
  if (src) return <img src={src} alt="" className="h-6 w-6 rounded-full object-cover flex-shrink-0" />;
  return (
    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px]"
      style={{ background: "rgba(168,216,234,0.25)", color: "rgba(255,255,255,0.8)" }}>
      {name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

export function ResourceComments({ resourceId }: { resourceId: number }) {
  const { username, displayName, avatar } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/comments?resourceId=${resourceId}`);
    if (res.ok) setComments(await res.json());
  }, [resourceId]);

  useEffect(() => { refresh(); }, [refresh]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text, resourceId }),
    });
    setText("");
    setSending(false);
    refresh();
  }

  async function handleReply(parentId: number) {
    if (!replyText.trim()) return;
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: replyText, parentId, resourceId }),
    });
    setReplyText("");
    setReplyTo(null);
    refresh();
  }

  const topLevel = comments.filter((c) => !c.parentId);
  const getReplies = (parentId: number) => comments.filter((c) => c.parentId === parentId);

  return (
    <div className="mt-14 pt-10" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
      <h2 className="text-lg font-light text-white/70 mb-6">留言</h2>

      {username ? (
        <form onSubmit={handleSubmit} className="mb-8 flex gap-3">
          <Avatar src={avatar} name={username} />
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="说点什么..."
              rows={2}
              className="w-full rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 outline-none resize-none"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
            />
            <div className="flex justify-end mt-2">
              <button type="submit" disabled={sending || !text.trim()}
                className="glass px-4 py-1.5 text-xs text-white/70 hover:text-white/90 disabled:opacity-30">
                {sending ? "..." : "发表"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 text-center py-4 rounded-xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-xs text-white/30">登录后即可留言</p>
        </div>
      )}

      <div className="space-y-4">
        {topLevel.map((c) => (
          <div key={c.id}>
            <div className="flex gap-2">
              <Avatar src={c.avatar} name={c.username} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-white/70">{c.displayName || c.username}</span>
                  <span className="text-[10px] text-white/25">{c.createdAt.slice(0, 16)}</span>
                </div>
                <p className="mt-0.5 text-xs text-white/50">{c.content}</p>
                {username && (
                  <button onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
                    className="mt-1 text-[10px] text-white/25 hover:text-[#A8D8EA]">
                    {replyTo === c.id ? "取消" : "回复"}
                  </button>
                )}
              </div>
            </div>

            {replyTo === c.id && (
              <div className="ml-8 mt-2 flex gap-2">
                <input value={replyText} onChange={(e) => setReplyText(e.target.value)}
                  placeholder="回复..." className="flex-1 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/25 outline-none"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }} />
                <button onClick={() => handleReply(c.id)} disabled={!replyText.trim()}
                  className="text-xs text-[#A8D8EA]/70 hover:text-[#A8D8EA] disabled:opacity-30">回复</button>
              </div>
            )}

            {getReplies(c.id).length > 0 && (
              <div className="ml-3 mt-1.5 pl-3" style={{ borderLeft: "1px solid rgba(255,255,255,0.08)" }}>
                {getReplies(c.id).map((r) => (
                  <div key={r.id} className="flex gap-2 mt-1.5">
                    <Avatar src={r.avatar} name={r.username} />
                    <div>
                      <span className="text-xs text-white/70">{r.displayName || r.username}</span>
                      <p className="text-xs text-white/45">{r.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {topLevel.length === 0 && <p className="text-xs text-white/20 py-8">暂无留言</p>}
      </div>
    </div>
  );
}
