"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { label: "Command Center", href: "/admin", icon: "◈" },
  { label: "Products", href: "/admin/products", icon: "◆" },
  { label: "Content", href: "/admin/content", icon: "◇" },
  { label: "Media", href: "/admin/media", icon: "◉" },
  { label: "Settings", href: "/admin/settings", icon: "⚙" },
  { label: "Export", href: "/admin/export", icon: "↑" },
  { label: "Import", href: "/admin/import", icon: "↓" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  // Don't show sidebar on login page
  if (pathname === "/admin/login") return null;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-56 border-r border-charcoal/10 bg-charcoal text-warm-white">
      <div className="flex h-full flex-col">
        {/* Brand */}
        <div className="border-b border-warm-white/10 px-5 py-5">
          <Link href="/admin" className="block">
            <span className="font-display text-lg font-black uppercase tracking-[0.05em]">
              NapFleet
            </span>
            <span className="mt-0.5 block font-display text-[10px] font-bold uppercase tracking-[0.3em] text-khaki">
              Command Console
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded px-3 py-2.5 text-sm font-display font-semibold uppercase tracking-[0.08em] transition-colors",
                  isActive
                    ? "bg-warm-white/10 text-warm-white"
                    : "text-warm-white/50 hover:bg-warm-white/5 hover:text-warm-white/80"
                )}
              >
                <span className="text-xs" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-warm-white/10 px-5 py-4">
          <Link
            href="/"
            className="text-[10px] font-display font-bold uppercase tracking-[0.15em] text-warm-white/30 hover:text-warm-white/60 transition-colors"
          >
            View Store
          </Link>
        </div>
      </div>
    </aside>
  );
}
