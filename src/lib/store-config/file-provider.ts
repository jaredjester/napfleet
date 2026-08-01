/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  StoreConfigProvider,
  CreateProductInput,
  UpdateProductInput,
  StoreExport,
  ImportResult,
  ImportMode,
} from "./types";
import { products as staticProducts } from "@/content/products";
import * as napfleetContent from "@/content/napfleet";

/**
 * File-based provider that reads from static content files.
 * This is the backward-compatible provider used when
 * STORE_CONFIG_PROVIDER is unset or set to "file".
 *
 * It is read-only for write operations (create/update/delete throw).
 */
export function createFileProvider(): StoreConfigProvider {
  const productsMap = new Map(staticProducts.map((p) => [p.handle, p]));

  return {
    async getProducts() {
      return staticProducts.filter((p) => p.publishReady);
    },

    async getProduct(handle: string) {
      const product = productsMap.get(handle);
      return product ?? null;
    },

    async createProduct(_data: CreateProductInput) {
      throw new Error("Cannot create products with file provider");
    },

    async updateProduct(_handle: string, _data: UpdateProductInput) {
      throw new Error("Cannot update products with file provider");
    },

    async deleteProduct(_handle: string) {
      throw new Error("Cannot delete products with file provider");
    },

    async getContent() {
      // Serialize the content module into a flat key-value structure
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(napfleetContent)) {
        if (key === "getProductContent") continue; // skip function export
        result[key] = value;
      }
      return result;
    },

    async getContentValue(key: string) {
      const content = await this.getContent();
      return content[key] ?? null;
    },

    async setContentValue(_key: string, _value: unknown) {
      throw new Error("Cannot set content with file provider");
    },

    async setContentValues(_entries: Record<string, unknown>) {
      throw new Error("Cannot set content with file provider");
    },

    async exportStore() {
      const content = await this.getContent();
      return {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        store: {
          name: "NapFleet",
          legalName: "NapFleet Pet Co.",
          currency: "USD",
        },
        products: staticProducts,
        content,
        settings: {},
      };
    },

    async importStore(_data: StoreExport, _mode: ImportMode): Promise<ImportResult> {
      throw new Error("Cannot import store with file provider");
    },
  };
}
