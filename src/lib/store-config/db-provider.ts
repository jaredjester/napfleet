import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import type { CommerceProduct, CommerceVariant } from "@/lib/commerce/types";
import type {
  StoreConfigProvider,
  CreateProductInput,
  UpdateProductInput,
  StoreExport,
  ImportResult,
  ImportMode,
} from "./types";

// ─── Helpers ────────────────────────────────────────────────

const productInclude = {
  variants: { orderBy: { sortOrder: "asc" as const } },
  metafields: true,
  media: { orderBy: { sortOrder: "asc" as const } },
} satisfies Prisma.ProductInclude;

type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

/** Map a Prisma product row to a CommerceProduct */
function toCommerceProduct(row: ProductWithRelations): CommerceProduct {
  const metafields = Object.fromEntries(row.metafields.map((m) => [m.key, m.value]));

  return {
    handle: row.handle,
    title: row.title,
    description: row.description,
    domain: row.domain as CommerceProduct["domain"],
    images: row.media.map((m) => m.url),
    variants: row.variants.map(
      (v): CommerceVariant => ({
        id: v.id,
        title: v.title,
        sku: v.sku,
        price: v.price,
        available: v.available,
      })
    ),
    publishReady: row.publishReady,
    preorderStatus: row.preorderStatus as "open" | "closed",
    preorderEstimateWeeks: row.preorderEstimateWeeks,
    overallLength: metafields.overallLength,
    overallWidth: metafields.overallWidth,
    overallHeight: metafields.overallHeight,
    interiorSleepingLength: metafields.interiorSleepingLength,
    interiorSleepingWidth: metafields.interiorSleepingWidth,
    recommendedPetLength: metafields.recommendedPetLength,
    recommendedPetWeight: metafields.recommendedPetWeight,
    entryHeight: metafields.entryHeight,
    productWeight: metafields.productWeight,
    materials: metafields.materials,
    filling: metafields.filling,
    careInstructions: metafields.careInstructions,
    boxContents: metafields.boxContents,
    assemblyRequired: metafields.assemblyRequired,
    returnEligibility: metafields.returnEligibility,
    sleepAreaDesign: metafields.sleepAreaDesign,
  };
}

const METAFIELD_KEYS = [
  "overallLength", "overallWidth", "overallHeight",
  "interiorSleepingLength", "interiorSleepingWidth",
  "recommendedPetLength", "recommendedPetWeight",
  "entryHeight", "productWeight", "materials", "filling",
  "careInstructions", "boxContents", "assemblyRequired",
  "returnEligibility", "sleepAreaDesign",
];

/** Serialize a content value for storage */
function serializeContentValue(value: unknown): string {
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

/** Deserialize a content value from storage */
function deserializeContentValue(raw: string): unknown {
  // Try JSON parse first, fall back to raw string
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

// ─── Provider Implementation ────────────────────────────────

export function createDbProvider(): StoreConfigProvider {
  async function ensureStore() {
    let store = await prisma.store.findUnique({ where: { slug: "napfleet" } });
    if (!store) {
      store = await prisma.store.create({
        data: {
          slug: "napfleet",
          name: "NapFleet",
          legalName: "NapFleet Pet Co.",
          currency: "USD",
        },
      });
    }
    return store;
  }

  async function upsertMetafields(productId: string, metafields: Record<string, string>) {
    for (const [key, value] of Object.entries(metafields)) {
      if (!value && value !== "0") continue;
      await prisma.productMetafield.upsert({
        where: { productId_key: { productId, key } },
        create: { productId, key, value },
        update: { value },
      });
    }
  }

  async function upsertMedia(productId: string, urls: string[]) {
    // Delete existing media not in the new list
    await prisma.productMedia.deleteMany({ where: { productId } });
    // Create new media entries
    for (let i = 0; i < urls.length; i++) {
      await prisma.productMedia.create({
        data: { productId, url: urls[i], sortOrder: i },
      });
    }
  }

  return {
    // ── Products ──────────────────────────────────────────

    async getProducts() {
      const rows = await prisma.product.findMany({
        where: { publishReady: true },
        include: productInclude,
        orderBy: { sortOrder: "asc" },
      });
      return rows.map(toCommerceProduct);
    },

    async getProduct(handle: string) {
      const row = await prisma.product.findUnique({
        where: { handle },
        include: productInclude,
      });
      if (!row) return null;
      return toCommerceProduct(row);
    },

    async createProduct(data: CreateProductInput) {
      const row = await prisma.product.create({
        data: {
          handle: data.handle,
          title: data.title,
          description: data.description,
          domain: data.domain,
          publishReady: data.publishReady ?? false,
          preorderStatus: data.preorderStatus ?? "closed",
          preorderEstimateWeeks: data.preorderEstimateWeeks ?? 8,
          sortOrder: data.sortOrder ?? 0,
          variants: {
            create: (data.variants ?? []).map((v, i) => ({
              title: v.title,
              sku: v.sku,
              price: v.price,
              available: v.available ?? true,
              sortOrder: v.sortOrder ?? i,
            })),
          },
        },
        include: productInclude,
      });

      if (data.metafields) {
        await upsertMetafields(row.id, data.metafields);
      }
      if (data.media?.length) {
        await upsertMedia(row.id, data.media);
      }

      return toCommerceProduct(
        await prisma.product.findUniqueOrThrow({
          where: { id: row.id },
          include: productInclude,
        })
      );
    },

    async updateProduct(handle: string, data: UpdateProductInput) {
      const existing = await prisma.product.findUnique({ where: { handle } });
      if (!existing) throw new Error(`Product not found: ${handle}`);

      const updateData: Prisma.ProductUpdateInput = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.domain !== undefined) updateData.domain = data.domain;
      if (data.publishReady !== undefined) updateData.publishReady = data.publishReady;
      if (data.preorderStatus !== undefined) updateData.preorderStatus = data.preorderStatus;
      if (data.preorderEstimateWeeks !== undefined) updateData.preorderEstimateWeeks = data.preorderEstimateWeeks;
      if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

      await prisma.product.update({ where: { id: existing.id }, data: updateData });

      // Handle variants: delete all and recreate if provided
      if (data.variants) {
        await prisma.productVariant.deleteMany({ where: { productId: existing.id } });
        for (let i = 0; i < data.variants.length; i++) {
          const v = data.variants[i];
          await prisma.productVariant.create({
            data: {
              productId: existing.id,
              title: v.title,
              sku: v.sku,
              price: v.price,
              available: v.available ?? true,
              sortOrder: v.sortOrder ?? i,
            },
          });
        }
      }

      if (data.metafields) {
        await upsertMetafields(existing.id, data.metafields);
      }

      if (data.media) {
        await upsertMedia(existing.id, data.media);
      }

      return toCommerceProduct(
        await prisma.product.findUniqueOrThrow({
          where: { id: existing.id },
          include: productInclude,
        })
      );
    },

    async deleteProduct(handle: string) {
      await prisma.product.delete({ where: { handle } });
    },

    // ── Content ────────────────────────────────────────────

    async getContent() {
      const store = await ensureStore();
      const rows = await prisma.storeContent.findMany({
        where: { storeId: store.id },
      });
      const result: Record<string, unknown> = {};
      for (const row of rows) {
        result[row.key] = deserializeContentValue(row.value);
      }
      return result;
    },

    async getContentValue(key: string) {
      const store = await ensureStore();
      const row = await prisma.storeContent.findUnique({
        where: { storeId_key: { storeId: store.id, key } },
      });
      if (!row) return null;
      return deserializeContentValue(row.value);
    },

    async setContentValue(key: string, value: unknown) {
      const store = await ensureStore();
      const serialized = serializeContentValue(value);
      await prisma.storeContent.upsert({
        where: { storeId_key: { storeId: store.id, key } },
        create: { storeId: store.id, key, value: serialized },
        update: { value: serialized },
      });
    },

    async setContentValues(entries: Record<string, unknown>) {
      const store = await ensureStore();
      for (const [key, value] of Object.entries(entries)) {
        const serialized = serializeContentValue(value);
        await prisma.storeContent.upsert({
          where: { storeId_key: { storeId: store.id, key } },
          create: { storeId: store.id, key, value: serialized },
          update: { value: serialized },
        });
      }
    },

    // ── Export / Import ────────────────────────────────────

    async exportStore() {
      const store = await ensureStore();

      // Get all products (including unpublished)
      const allProducts = await prisma.product.findMany({
        include: productInclude,
        orderBy: { sortOrder: "asc" },
      });

      const content = await this.getContent();

      // Get store settings (all StoreContent rows)
      const settingsRows = await prisma.storeContent.findMany({
        where: { storeId: store.id },
      });
      const settings: Record<string, string> = {};
      for (const row of settingsRows) {
        settings[row.key] = row.value;
      }

      return {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        store: {
          name: store.name,
          legalName: store.legalName,
          currency: store.currency,
        },
        products: allProducts.map(toCommerceProduct),
        content,
        settings,
      };
    },

    async importStore(data: StoreExport, mode: ImportMode) {
      const result: ImportResult = {
        productsImported: 0,
        productsSkipped: 0,
        contentImported: 0,
        errors: [],
      };

      // Update store info
      const store = await ensureStore();
      if (data.store) {
        await prisma.store.update({
          where: { id: store.id },
          data: {
            name: data.store.name || store.name,
            legalName: data.store.legalName || store.legalName,
            currency: data.store.currency || store.currency,
          },
        });
      }

      // Import products
      if (mode === "replace") {
        await prisma.productMetafield.deleteMany();
        await prisma.productMedia.deleteMany();
        await prisma.productVariant.deleteMany();
        await prisma.product.deleteMany();
      }

      for (const product of data.products) {
        try {
          const existing = await prisma.product.findUnique({
            where: { handle: product.handle },
          });

          if (existing && mode === "merge") {
            result.productsSkipped++;
            continue;
          }

          if (existing) {
            // Replace mode: delete and recreate
            await prisma.product.delete({ where: { handle: product.handle } });
          }

          await prisma.product.create({
            data: {
              handle: product.handle,
              title: product.title,
              description: product.description,
              domain: product.domain,
              publishReady: product.publishReady,
              preorderStatus: product.preorderStatus,
              preorderEstimateWeeks: product.preorderEstimateWeeks,
              sortOrder: (product as Record<string, unknown>).sortOrder as number ?? 0,
              variants: {
                create: product.variants.map((v, i) => ({
                  title: v.title,
                  sku: v.sku,
                  price: v.price,
                  available: v.available,
                  sortOrder: (v as Record<string, unknown>).sortOrder as number ?? i,
                })),
              },
            },
          });

          // We need the created product's ID for relations
          const created = await prisma.product.findUniqueOrThrow({
            where: { handle: product.handle },
          });

          // Import metafields
          const metafieldEntries: Record<string, string> = {};
          for (const key of METAFIELD_KEYS) {
            const val = (product as Record<string, unknown>)[key];
            if (val !== undefined && val !== null && val !== "") {
              metafieldEntries[key] = String(val);
            }
          }
          if (Object.keys(metafieldEntries).length > 0) {
            await upsertMetafields(created.id, metafieldEntries);
          }

          // Import media
          if (product.images.length > 0) {
            await upsertMedia(created.id, product.images);
          }

          result.productsImported++;
        } catch (err) {
          result.errors.push(
            `Product ${product.handle}: ${err instanceof Error ? err.message : "Unknown error"}`
          );
        }
      }

      // Import content
      if (data.content) {
        await this.setContentValues(data.content);
        result.contentImported = Object.keys(data.content).length;
      }

      // Import settings
      if (data.settings) {
        for (const [key, value] of Object.entries(data.settings)) {
          await prisma.storeContent.upsert({
            where: { storeId_key: { storeId: store.id, key } },
            create: { storeId: store.id, key, value },
            update: { value },
          });
        }
      }

      return result;
    },
  };
}
