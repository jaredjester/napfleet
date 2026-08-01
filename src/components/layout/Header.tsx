"use client";

import Link from "next/link";
import { BRAND, NAV_LINKS } from "@/content/napfleet";
import { useCart } from "@/context/CartContext";
import { useUi } from "@/context/UiContext";
import { Icon } from "@/components/ui/Icon";
import { MobileMenu } from "@/components/layout/MobileMenu";

export function Header() {
  const { itemCount } = useCart();
  const { menuOpen, closeMenu, openMenu, openCart, openSearch } = useUi();

  return (
    <header className="sticky top-0 z-40 border-b border-charcoal/15 bg-warm-white">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-1 md:gap-8">
          <button
            type="button"
            onClick={openMenu}
            aria-label="Open menu"
            className="-ml-2 inline-flex h-11 w-11 items-center justify-center md:hidden"
          >
            <Icon name="menu" className="h-6 w-6" />
          </button>
          <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-display text-sm font-semibold uppercase tracking-[0.15em] text-charcoal/85 transition-colors hover:text-signal-orange"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <Link
          href="/"
          className="font-display text-xl font-bold uppercase tracking-[0.3em] text-charcoal sm:text-2xl"
        >
          {BRAND.name}
        </Link>

        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={openSearch}
            aria-label="Open search"
            className="inline-flex h-11 w-11 items-center justify-center"
          >
            <Icon name="search" className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={openCart}
            aria-label={`Open cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
            className="relative inline-flex h-11 w-11 items-center justify-center"
          >
            <Icon name="cart" className="h-5 w-5" />
            {itemCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-charcoal px-1 text-[10px] font-bold text-warm-white"
              >
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <MobileMenu open={menuOpen} onClose={closeMenu} />
    </header>
  );
}
