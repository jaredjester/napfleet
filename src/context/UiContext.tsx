"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

type UiContextValue = {
  cartOpen: boolean;
  menuOpen: boolean;
  searchOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
};

const UiContext = createContext<UiContextValue | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const value = useMemo<UiContextValue>(
    () => ({
      cartOpen,
      menuOpen,
      searchOpen,
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
      toggleCart: () => setCartOpen((v) => !v),
      openMenu: () => setMenuOpen(true),
      closeMenu: () => setMenuOpen(false),
      toggleMenu: () => setMenuOpen((v) => !v),
      openSearch: () => setSearchOpen(true),
      closeSearch: () => setSearchOpen(false),
      toggleSearch: () => setSearchOpen((v) => !v),
    }),
    [cartOpen, menuOpen, searchOpen]
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi(): UiContextValue {
  const ctx = useContext(UiContext);
  if (!ctx) {
    throw new Error("useUi must be used within a UiProvider");
  }
  return ctx;
}
