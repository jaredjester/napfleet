/* eslint-disable @typescript-eslint/no-unused-vars, prefer-const */
import type { CommerceProvider, CommerceProduct, CommerceCart, ReviewProvider, NewsletterProvider } from "./types";
import { getStoreConfig } from "@/lib/store-config";
import { mockNewsletterProvider } from "@/lib/newsletter/mock";

const cartId = "mock-cart-1";
let cart: CommerceCart = { id: cartId, lines: [], subtotal: 0 };

export const mockCommerce: CommerceProvider = {
  async getCollection(_handle: string) {
    const config = getStoreConfig();
    const products = await config.getProducts();
    return products.filter((p) => p.publishReady && p.variants.some((v) => v.available));
  },

  async getProduct(handle: string) {
    const config = getStoreConfig();
    const product = await config.getProduct(handle);
    if (!product || !product.publishReady) return null;
    return product;
  },

  async searchProducts(query: string) {
    const config = getStoreConfig();
    const products = await config.getProducts();
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.publishReady &&
        (p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    );
  },

  async getCart(_cartId: string) {
    return { ...cart, lines: [...cart.lines] };
  },

  async createCart() {
    cart = { id: cartId, lines: [], subtotal: 0 };
    return { ...cart, lines: [] };
  },

  async addCartLines(_cartId: string, lines: { productHandle: string; variantId: string; quantity: number }[]) {
    const config = getStoreConfig();
    for (const line of lines) {
      const product = await config.getProduct(line.productHandle);
      if (!product) continue;
      const variant = product.variants.find((v) => v.id === line.variantId);
      if (!variant || !variant.available) continue;
      const existing = cart.lines.find(
        (l) => l.productHandle === line.productHandle && l.variantId === line.variantId
      );
      if (existing) {
        existing.quantity += line.quantity;
      } else {
        cart.lines.push({
          id: `line-${Date.now()}-${Math.random()}`,
          productHandle: line.productHandle,
          variantId: line.variantId,
          title: product.title,
          variantTitle: variant.title,
          price: variant.price,
          quantity: line.quantity,
          image: product.images[0],
        });
      }
    }
    cart.subtotal = cart.lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
    cart.checkoutUrl = "/checkout-disabled";
    return { ...cart, lines: [...cart.lines] };
  },

  async updateCartLines(_cartId: string, lines: { id: string; quantity: number }[]) {
    for (const update of lines) {
      const line = cart.lines.find((l) => l.id === update.id);
      if (line) line.quantity = update.quantity;
    }
    cart.lines = cart.lines.filter((l) => l.quantity > 0);
    cart.subtotal = cart.lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
    return { ...cart, lines: [...cart.lines] };
  },

  async removeCartLines(_cartId: string, lineIds: string[]) {
    cart.lines = cart.lines.filter((l) => !lineIds.includes(l.id));
    cart.subtotal = cart.lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
    return { ...cart, lines: [...cart.lines] };
  },

  async getCheckoutUrl(_cartId: string) {
    return cart.checkoutUrl || null;
  },

  async getCustomerAccountUrl() {
    return null; // No customer accounts configured
  },
};

export const mockReviews: ReviewProvider = {
  async getProductReviews(_handle: string) {
    return []; // No reviews until authentic reviews exist
  },
};

// Delegate to the working newsletter mock (see @/lib/newsletter).
// Kept as a re-export for any consumers still importing from commerce.
export const mockNewsletter: NewsletterProvider = mockNewsletterProvider;
