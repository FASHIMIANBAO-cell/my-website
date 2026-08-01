"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ExternalLink, Copy, Check } from "lucide-react";
import { ResourceComments } from "./resource-comments";

interface Link {
  label: string;
  url: string;
  code?: string;
}

interface Props {
  id: number;
  name: string;
  description: string;
  image: string;
  category: string;
  downloads: number;
  createdAt: string;
  links: Link[];
}

export function ResourceDetailClient({
  id,
  name,
  description,
  image,
  category,
  downloads,
  createdAt,
  links,
}: Props) {
  return (
    <div className="px-4 py-24">
      <div className="mx-auto max-w-3xl">
        {/* 返回 */}
        <Link
          href="/resources"
          className="inline-flex items-center gap-1.5 text-sm text-white/35 hover:text-white/70 transition-colors mb-10"
        >
          <ArrowLeft size={15} />
          返回资源库
        </Link>

        {/* 头部：图片 + 名称 */}
        <div className="flex gap-6 items-start mb-10">
          <div
            className="flex-shrink-0 rounded-2xl overflow-hidden"
            style={{
              width: 120,
              height: 120,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            {image ? (
              <img src={image} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl">
                📦
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-2xl font-light tracking-wider text-white/90">
              {name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/35">
              {category && <span>{category}</span>}
              <span>{new Date(createdAt).toLocaleDateString("zh-CN")}</span>
              <span>{downloads} 次下载</span>
            </div>
          </div>
        </div>

        {/* 介绍 */}
        {description ? (
          <div className="text-white/85 leading-relaxed text-[15px] mb-12 max-w-xl">
            {description}
          </div>
        ) : (
          <p className="text-white/20 italic text-sm mb-12">暂无介绍</p>
        )}

        {/* 下载渠道 */}
        {links.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px"
                style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent)" }} />
              <span className="text-xs text-white/30 tracking-widest">下载渠道</span>
              <div className="flex-1 h-px"
                style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent)" }} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {links.map((link, i) => (
                <DownloadCard key={i} link={link} />
              ))}
            </div>
          </div>
        )}

        {/* 留言 */}
        <ResourceComments resourceId={id} />
      </div>
    </div>
  );
}

function DownloadCard({ link }: { link: Link }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    if (!link.code) return;
    await navigator.clipboard.writeText(link.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div
      className="rounded-xl px-5 py-4 transition-all hover:translate-x-1"
      style={{
        background: "rgba(255,255,255,0.1)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.15)",
      }}
    >
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between"
      >
        <div>
          <span className="text-sm text-white/80">{link.label}</span>
          {link.code && (
            <span className="ml-2 text-xs text-white/30">提取码：{link.code}</span>
          )}
        </div>
        <ExternalLink size={14} className="text-white/25 flex-shrink-0" />
      </a>
      {link.code && (
        <button
          onClick={(e) => { e.preventDefault(); copyCode(); }}
          className="mt-2 text-xs text-[#A8D8EA]/60 hover:text-[#A8D8EA] transition-colors"
        >
          {copied ? (
            <span className="inline-flex items-center gap-1">
              <Check size={11} /> 已复制
            </span>
          ) : (
            "复制提取码"
          )}
        </button>
      )}
    </div>
  );
}
