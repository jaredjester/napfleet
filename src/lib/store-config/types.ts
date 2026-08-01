import type { CommerceProduct } from "@/lib/commerce/types";

export type CreateProductInput = {
  handle: string;
  title: string;
  description: string;
  domain: string;
  publishReady?: boolean;
  preorderStatus?: "open" | "closed";
  preorderEstimateWeeks?: number;
  sortOrder?: number;
  variants?: CreateVariantInput[];
  metafields?: Record<string, string>;
  media?: string[];
};

export type CreateVariantInput = {
  title: string;
  sku: string;
  price: number; // cents
  available?: boolean;
  sortOrder?: number;
};

export type UpdateProductInput = Partial<CreateProductInput>;

export type StoreExport = {
  version: string;
  exportedAt: string;
  store: {
    name: string;
    legalName: string;
    currency: string;
  };
  products: CommerceProduct[];
  content: Record<string, unknown>;
  settings: Record<string, string>;
};

export type ImportPreview = {
  productsCount: number;
  contentKeys: number;
  settingsKeys: number;
  validationErrors: string[];
};

export type ImportResult = {
  productsImported: number;
  productsSkipped: number;
  contentImported: number;
  errors: string[];
};

export type ImportMode = "merge" | "replace";

export interface StoreConfigProvider {
  // Products
  getProducts(): Promise<CommerceProduct[]>;
  getProduct(handle: string): Promise<CommerceProduct | null>;
  createProduct(data: CreateProductInput): Promise<CommerceProduct>;
  updateProduct(handle: string, data: UpdateProductInput): Promise<CommerceProduct>;
  deleteProduct(handle: string): Promise<void>;

  // Content
  getContent(): Promise<Record<string, unknown>>;
  getContentValue(key: string): Promise<unknown>;
  setContentValue(key: string, value: unknown): Promise<void>;
  setContentValues(entries: Record<string, unknown>): Promise<void>;

  // Export / Import
  exportStore(): Promise<StoreExport>;
  importStore(data: StoreExport, mode: ImportMode): Promise<ImportResult>;
}
