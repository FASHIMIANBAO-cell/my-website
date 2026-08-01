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

function ReplyForm({ parentId, onSubmit, onCancel }: {
  parentId: number;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text, parentId }),
    });
    setText("");
    setSending(false);
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 ml-8 flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="回复..."
        autoFocus
        className="flex-1 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/25 outline-none"
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      />
      <button type="submit" disabled={sending || !text.trim()}
        className="text-xs text-[#A8D8EA]/70 hover:text-[#A8D8EA] disabled:opacity-30">
        {sending ? "..." : "回复"}
      </button>
      <button type="button" onClick={onCancel} className="text-xs text-white/25 hover:text-white/50">
        取消
      </button>
    </form>
  );
}

function CommentItem({ c, replies, refresh }: {
  c: Comment;
  replies: Comment[];
  refresh: () => void;
}) {
  const { username } = useUser();
  const [showReply, setShowReply] = useState(false);

  return (
    <div>
      <div className="flex gap-2">
        <Avatar src={c.avatar} name={c.username} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-white/70">{c.displayName || c.username}</span>
            <span className="text-[10px] text-white/25">
              {new Date(c.createdAt).toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-white/50 leading-relaxed break-words">{c.content}</p>
          {username && (
            <button
              onClick={() => setShowReply(!showReply)}
              className="mt-1 text-[10px] text-white/25 hover:text-[#A8D8EA] transition-colors"
            >
              {showReply ? "取消回复" : "回复"}
            </button>
          )}
        </div>
      </div>

      {showReply && (
        <ReplyForm
          parentId={c.id}
          onSubmit={() => { setShowReply(false); refresh(); }}
          onCancel={() => setShowReply(false)}
        />
      )}

      {/* 嵌套回复 — 左侧竖线缩进，像代码层级 */}
      {replies.length > 0 && (
        <div className="ml-3 mt-1.5 pl-3" style={{ borderLeft: "1px solid rgba(255,255,255,0.08)" }}>
          {replies.map((r) => (
            <div key={r.id} className="mt-1.5">
              <div className="flex gap-2">
                <Avatar src={r.avatar} name={r.username} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-white/70">{r.displayName || r.username}</span>
                    <span className="text-[10px] text-white/25">
                      {new Date(r.createdAt).toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-white/45 leading-relaxed break-words">{r.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentSection() {
  const { username, displayName, avatar } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/comments?about=1");
    if (res.ok) setComments(await res.json());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
    setText("");
    setSending(false);
    refresh();
  }

  // 按层级分组：顶层评论 + 各自回复
  const topLevel = comments.filter((c) => !c.parentId);
  const getReplies = (parentId: number) => comments.filter((c) => c.parentId === parentId);

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-light text-white/80 mb-8">留言板</h2>

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
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            />
            <div className="flex justify-end mt-2">
              <span className="text-xs text-white/25 mr-3 self-center">{displayName || username}</span>
              <button type="submit" disabled={sending || !text.trim()}
                className="glass px-4 py-1.5 text-xs text-white/70 hover:text-white/90 disabled:opacity-30 transition-all">
                {sending ? "发送中..." : "发表"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 text-center py-6 rounded-xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-sm text-white/30">登录后即可留言</p>
        </div>
      )}

      <div className="space-y-4">
        {topLevel.map((c) => (
          <CommentItem key={c.id} c={c} replies={getReplies(c.id)} refresh={refresh} />
        ))}
        {topLevel.length === 0 && (
          <p className="text-sm text-white/20 text-center py-10">暂无留言，来说说你的看法吧</p>
        )}
      </div>
    </div>
  );
}
