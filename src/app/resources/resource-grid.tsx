"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface Res {
  id: number;
  name: string;
  category: string;
  image: string;
  downloads: number;
}

export function ResourceGrid({ resources }: { resources: Res[] }) {
  return (
    <div className="px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-light tracking-wider text-white/90 mb-12 flex items-center gap-3">
          <span>📦</span> 资源库
        </h1>

        {resources.length === 0 ? (
          <div className="glass flex flex-col items-center justify-center rounded-2xl py-24 text-center">
            <span className="text-4xl">📭</span>
            <p className="mt-4 text-sm text-white/40">还没有资源，敬请期待</p>
          </div>
        ) : (
          <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {resources.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.06,
                  duration: 0.4,
                  ease: [0.22, 0.61, 0.36, 1],
                }}
              >
                <Link
                  href={`/resources/${r.id}`}
                  className="group block transition-all duration-300 hover:-translate-y-1"
                >
                  {/* 图片 — 独立的圆角正方形 */}
                  <div
                    className="aspect-square rounded-2xl overflow-hidden transition-all duration-300"
                    style={{
                      border: "1px solid rgba(255,255,255,0.15)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                    }}
                  >
                    {r.image ? (
                      <img
                        src={r.image}
                        alt={r.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center text-4xl"
                        style={{ background: "rgba(255,255,255,0.04)" }}
                      >
                        📦
                      </div>
                    )}
                  </div>

                  {/* 名称 — 图片下方，独立 */}
                  <div className="mt-2.5 text-center">
                    <p className="text-sm text-white/70 group-hover:text-white/90 truncate transition-colors">
                      {r.name}
                    </p>
                    {r.category && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] text-white/80 rounded-md bg-red-500/60">
                        {r.category}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
