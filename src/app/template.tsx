"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { useUser } from "@/components/user-provider";

function TemplateInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isAdmin } = useUser();
  const isHome = pathname === "/";
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <>
      {!isHome && !isAdminPage && (
        <Link
          href="/"
          className="fixed top-6 left-4 md:left-6 z-30 glass px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-light text-white/50 hover:text-white/80 transition-colors"
        >
          ← 首页
        </Link>
      )}
      {isAdmin && !isAdminPage && (
        <Link
          href="/admin/dashboard"
          className="fixed bottom-5 right-5 z-30 glass px-3 py-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          后台
        </Link>
      )}
      {children}
    </>
  );
}

export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ filter: "blur(6px)", opacity: 0 }}
      animate={{ filter: "blur(0px)", opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="min-h-screen"
    >
      <TemplateInner>{children}</TemplateInner>
    </motion.div>
  );
}
