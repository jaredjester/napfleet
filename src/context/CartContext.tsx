"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { mockCommerce } from "@/lib/commerce/mock";
import type { CommerceCartLine } from "@/lib/commerce/types";
import { useUi } from "@/context/UiContext";

const STORAGE_KEY = "napfleet_cart_v1";

type CartContextValue = {
  cartId: string | null;
  items: CommerceCartLine[];
  subtotal: number;
  itemCount: number;
  isUpdating: boolean;
  isInitialized: boolean;
  addItem: (productHandle: string, variantId: string, quantity?: number) => Promise<void>;
  setQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  clearCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Cart state, persisted to localStorage under "napfleet_cart_v1".
 *
 * Must be rendered inside a UiProvider (addItem opens the cart drawer).
 * Use the mockCommerce provider until a real commerce backend is configured.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const { openCart } = useUi();
  const [cartId, setCartId] = useState<string | null>(null);
  const [items, setItems] = useState<CommerceCartLine[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize: restore a persisted cart or create a fresh one.
  useEffect(() => {
    let cancelled = false;

    async function init() {
      let storedCartId: string | null = null;
      let storedItems: CommerceCartLine[] = [];

      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { cartId?: string; items?: CommerceCartLine[] };
          storedCartId = parsed.cartId ?? null;
          storedItems = (parsed.items ?? []).filter((l) => l.quantity > 0);
        }
      } catch {
        // Corrupt or unavailable storage — start with a fresh cart.
      }

      let id = storedCartId;
      if (!id) {
        try {
          const created = await mockCommerce.createCart();
          id = created.id;
        } catch {
          id = "mock-cart-1";
        }
      }
      if (cancelled) return;
      setCartId(id);

      // Rebuild the provider cart so persisted line ids stay in sync.
      // If the provider call fails (e.g. provider mismatch), fall back to
      // the localStorage data directly so the cart is never empty.
      if (storedItems.length > 0) {
        try {
          const rebuilt = await mockCommerce.addCartLines(
            id,
            storedItems.map((l) => ({
              productHandle: l.productHandle,
              variantId: l.variantId,
              quantity: l.quantity,
            }))
          );
          if (!cancelled && rebuilt.lines.length > 0) {
            setItems(rebuilt.lines);
            setSubtotal(rebuilt.subtotal);
            return;
          }
        } catch {
          // Provider rebuild failed — fall through to localStorage fallback
        }

        // Fallback: use localStorage items directly
        if (!cancelled) {
          const validItems = storedItems.filter((l) => l.quantity > 0 && l.price > 0);
          setItems(validItems);
          setSubtotal(validItems.reduce((sum, l) => sum + l.price * l.quantity, 0));
        }
      }

      if (!cancelled) setIsInitialized(true);
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist cart changes.
  useEffect(() => {
    if (cartId === null) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ cartId, items }));
    } catch {
      // Storage unavailable — the cart simply won't persist across sessions.
    }
  }, [cartId, items]);

  // Cross-tab sync: listen for cart changes from other tabs.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        const parsed = JSON.parse(event.newValue) as {
          cartId?: string;
          items?: CommerceCartLine[];
        };
        if (parsed.items) {
          // Validate quantities and filter stale items
          const validated = parsed.items
            .filter((l) => l.quantity > 0)
            .map((l) => ({ ...l, quantity: Math.min(99, Math.max(1, l.quantity)) }));
          setItems(validated);
          setSubtotal(validated.reduce((sum, l) => sum + l.price * l.quantity, 0));
        }
        if (parsed.cartId) setCartId(parsed.cartId);
      } catch {
        // Corrupt storage from another tab — ignore
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const addItem = useCallback(
    async (productHandle: string, variantId: string, quantity = 1) => {
      if (!cartId) return;
      setIsUpdating(true);
      try {
        const updated = await mockCommerce.addCartLines(cartId, [
          { productHandle, variantId, quantity },
        ]);
        setItems(updated.lines);
        setSubtotal(updated.subtotal);
        openCart();
      } finally {
        setIsUpdating(false);
      }
    },
    [cartId, openCart]
  );

  const setQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cartId) return;
      setIsUpdating(true);
      try {
        const safeQuantity = Math.max(0, Math.min(99, Math.floor(quantity)));
        const updated = await mockCommerce.updateCartLines(cartId, [
          { id: lineId, quantity: safeQuantity },
        ]);
        setItems(updated.lines);
        setSubtotal(updated.subtotal);
      } finally {
        setIsUpdating(false);
      }
    },
    [cartId]
  );

  const removeItem = useCallback(
    async (lineId: string) => {
      if (!cartId) return;
      setIsUpdating(true);
      try {
        const updated = await mockCommerce.removeCartLines(cartId, [lineId]);
        setItems(updated.lines);
        setSubtotal(updated.subtotal);
      } finally {
        setIsUpdating(false);
      }
    },
    [cartId]
  );

  const clearCart = useCallback(async () => {
    if (!cartId) return;
    setIsUpdating(true);
    try {
      const updated = await mockCommerce.removeCartLines(
        cartId,
        items.map((l) => l.id)
      );
      setItems(updated.lines);
      setSubtotal(updated.subtotal);
    } finally {
      setIsUpdating(false);
    }
  }, [cartId, items]);

  const itemCount = useMemo(
    () => items.reduce((sum, line) => sum + line.quantity, 0),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cartId,
      items,
      subtotal,
      itemCount,
      isUpdating,
      isInitialized,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    }),
    [cartId, items, subtotal, itemCount, isUpdating, isInitialized, addItem, setQuantity, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
