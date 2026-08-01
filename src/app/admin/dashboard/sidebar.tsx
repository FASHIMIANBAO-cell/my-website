"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Package, LayoutDashboard, Users, MessageCircle, User, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/admin/dashboard", label: "仪表盘", icon: LayoutDashboard },
  { href: "/admin/dashboard/posts", label: "文章管理", icon: FileText },
  { href: "/admin/dashboard/resources", label: "资源管理", icon: Package },
  { href: "/admin/dashboard/users", label: "用户管理", icon: Users },
  { href: "/admin/dashboard/comments", label: "留言管理", icon: MessageCircle },
  { href: "/admin/dashboard/about", label: "关于我", icon: User },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <Link
        href="/admin/dashboard"
        className="block px-5 pt-6 pb-8 text-sm font-light tracking-widest text-white/60 hover:text-white/80 transition-colors"
      >
        ⚡ 管理面板
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all"
              style={{
                background: active
                  ? "rgba(255,255,255,0.15)"
                  : "transparent",
                color: active
                  ? "rgba(255,255,255,0.9)"
                  : "rgba(255,255,255,0.5)",
                borderLeft: active
                  ? "3px solid #D4A574"
                  : "3px solid transparent",
              }}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 rounded-lg p-2 md:hidden"
        style={{
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <Menu size={20} className="text-white/70" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="h-full w-56"
            style={{
              background: "rgba(20,20,20,0.95)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderRight: "1px solid rgba(255,255,255,0.08)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end px-4 pt-4">
              <button onClick={() => setMobileOpen(false)}>
                <X size={18} className="text-white/50" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex w-[220px] flex-shrink-0 flex-col"
        style={{
          background: "rgba(0,0,0,0.25)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRight: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
