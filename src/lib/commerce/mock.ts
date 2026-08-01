/* eslint-disable @typescript-eslint/no-unused-vars, prefer-const */
import type { CommerceProvider, CommerceProduct, CommerceCart, ReviewProvider, NewsletterProvider } from "./types";
import { products as mockProducts } from "@/content/products";

const products: CommerceProduct[] = mockProducts;

const cartId = "mock-cart-1";
let cart: CommerceCart = { id: cartId, lines: [], subtotal: 0 };

export const mockCommerce: CommerceProvider = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getCollection(_handle: string) {
    return products.filter((p) => p.publishReady && p.variants.some((v) => v.available));
  },

  async getProduct(handle: string) {
    const product = products.find((p) => p.handle === handle);
    if (!product || !product.publishReady) return null;
    return product;
  },

  async searchProducts(query: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    for (const line of lines) {
      const product = products.find((p) => p.handle === line.productHandle);
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

export const mockNewsletter: NewsletterProvider = {
  async subscribe(_email: string) {
    return { success: false, error: "Newsletter provider not configured" };
  },
};
