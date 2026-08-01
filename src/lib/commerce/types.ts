import type { Domain } from "@/lib/constants";

export type CommerceVariant = {
  id: string;
  title: string;
  sku: string;
  price: number; // cents
  available: boolean;
};

export type CommerceProduct = {
  handle: string;
  title: string;
  description: string;
  domain: Domain;
  images: string[];
  videoUrl?: string;
  variants: CommerceVariant[];
  // Extended metafield data
  publishReady: boolean;
  preorderStatus: "open" | "closed";
  preorderEstimateWeeks: number;
  overallLength?: string;
  overallWidth?: string;
  overallHeight?: string;
  interiorSleepingLength?: string;
  interiorSleepingWidth?: string;
  recommendedPetLength?: string;
  recommendedPetWeight?: string;
  entryHeight?: string;
  productWeight?: string;
  materials?: string;
  filling?: string;
  careInstructions?: string;
  boxContents?: string;
  assemblyRequired?: string;
  returnEligibility?: string;
  sleepAreaDesign?: string;
};

export type CommerceCartLine = {
  id: string;
  productHandle: string;
  variantId: string;
  title: string;
  variantTitle: string;
  price: number; // cents
  quantity: number;
  image?: string;
};

export type CommerceCart = {
  id: string;
  lines: CommerceCartLine[];
  subtotal: number;
  checkoutUrl?: string;
};

export type CommerceProvider = {
  getCollection: (handle: string) => Promise<CommerceProduct[]>;
  getProduct: (handle: string) => Promise<CommerceProduct | null>;
  searchProducts: (query: string) => Promise<CommerceProduct[]>;
  getCart: (cartId: string) => Promise<CommerceCart>;
  createCart: () => Promise<CommerceCart>;
  addCartLines: (cartId: string, lines: { productHandle: string; variantId: string; quantity: number }[]) => Promise<CommerceCart>;
  updateCartLines: (cartId: string, lines: { id: string; quantity: number }[]) => Promise<CommerceCart>;
  removeCartLines: (cartId: string, lineIds: string[]) => Promise<CommerceCart>;
  getCheckoutUrl: (cartId: string) => Promise<string | null>;
  getCustomerAccountUrl: () => Promise<string | null>;
};

export type Review = {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  image?: string;
  productHandle: string;
  verified: boolean;
};

export type ReviewProvider = {
  getProductReviews: (handle: string) => Promise<Review[]>;
};

export type NewsletterProvider = {
  subscribe: (email: string) => Promise<{ success: boolean; error?: string }>;
};
