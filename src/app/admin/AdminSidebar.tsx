"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { label: "Command Center", href: "/admin", icon: "◈" },
  { label: "Finance", href: "/admin/finance", icon: "$" },
  { label: "Products", href: "/admin/products", icon: "◆" },
  { label: "Content", href: "/admin/content", icon: "◇" },
  { label: "Media", href: "/admin/media", icon: "◉" },
  { label: "Settings", href: "/admin/settings", icon: "⚙" },
  { label: "Export", href: "/admin/export", icon: "↑" },
  { label: "Import", href: "/admin/import", icon: "↓" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  if (pathname === "/admin/login") return null;

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center justify-between border-b border-warm-white/10 px-5 py-5">
        <Link href="/admin" className="block" onClick={closeMobile}>
          <span className="font-display text-lg font-black uppercase tracking-[0.05em]">
            NapFleet
          </span>
          <span className="mt-0.5 block font-display text-[10px] font-bold uppercase tracking-[0.3em] text-khaki">
            Command Console
          </span>
        </Link>
        {/* Close button — mobile only */}
        <button
          onClick={closeMobile}
          className="lg:hidden inline-flex h-8 w-8 items-center justify-center text-warm-white/50 hover:text-warm-white"
          aria-label="Close menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 5l10 10M15 5L5 15" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobile}
              className={cn(
                "flex items-center gap-3 rounded px-3 py-2.5 text-sm font-display font-semibold uppercase tracking-[0.08em] transition-colors",
                isActive
                  ? "bg-warm-white/10 text-warm-white"
                  : "text-warm-white/50 hover:bg-warm-white/5 hover:text-warm-white/80"
              )}
            >
              <span className="text-xs w-5 text-center" aria-hidden="true">
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
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 inline-flex h-10 w-10 items-center justify-center rounded bg-charcoal text-warm-white shadow-lg"
        aria-label="Open menu"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 5h14M3 10h14M3 15h14" />
        </svg>
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-charcoal/70 animate-fade-in"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — mobile: slide in, desktop: always visible */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-56 border-r border-charcoal/10 bg-charcoal text-warm-white transition-transform duration-200",
          // Desktop: always visible
          "lg:translate-x-0",
          // Mobile: slide in/out
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
