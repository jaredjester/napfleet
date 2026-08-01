import { PrismaClient } from "@prisma/client";
import { products as staticProducts } from "../src/content/products";
import * as napfleetContent from "../src/content/napfleet";

const prisma = new PrismaClient();

const METAFIELD_KEYS = [
  "overallLength", "overallWidth", "overallHeight",
  "interiorSleepingLength", "interiorSleepingWidth",
  "recommendedPetLength", "recommendedPetWeight",
  "entryHeight", "productWeight", "materials", "filling",
  "careInstructions", "boxContents", "assemblyRequired",
  "returnEligibility", "sleepAreaDesign",
];

async function main() {
  console.log("Seeding NapFleet database...");

  // Upsert store
  const store = await prisma.store.upsert({
    where: { slug: "napfleet" },
    update: {},
    create: {
      slug: "napfleet",
      name: "NapFleet",
      legalName: "NapFleet Pet Co.",
      currency: "USD",
    },
  });
  console.log(`Store: ${store.slug} (${store.id})`);

  // Seed products
  for (const product of staticProducts) {
    const existing = await prisma.product.findUnique({
      where: { handle: product.handle },
    });

    if (existing) {
      console.log(`  Product exists: ${product.handle} — skipping`);
      continue;
    }

    const created = await prisma.product.create({
      data: {
        handle: product.handle,
        title: product.title,
        description: product.description,
        domain: product.domain,
        publishReady: product.publishReady,
        preorderStatus: product.preorderStatus,
        preorderEstimateWeeks: product.preorderEstimateWeeks,
        sortOrder: staticProducts.indexOf(product),
        variants: {
          create: product.variants.map((v, i) => ({
            title: v.title,
            sku: v.sku,
            price: v.price,
            available: v.available,
            sortOrder: i,
          })),
        },
        media: {
          create: product.images.map((url, i) => ({
            url,
            sortOrder: i,
          })),
        },
      },
    });

    // Seed metafields from CommerceProduct optional fields
    for (const key of METAFIELD_KEYS) {
      const val = (product as Record<string, unknown>)[key];
      if (val !== undefined && val !== null && val !== "") {
        await prisma.productMetafield.create({
          data: {
            productId: created.id,
            key,
            value: String(val),
          },
        });
      }
    }

    console.log(`  Created product: ${product.handle}`);
  }

  // Seed content from napfleet.ts
  for (const [key, value] of Object.entries(napfleetContent)) {
    if (key === "getProductContent") continue;
    if (key === "ProductContent") continue; // skip type export

    const serialized = typeof value === "string" ? value : JSON.stringify(value);

    await prisma.storeContent.upsert({
      where: { storeId_key: { storeId: store.id, key } },
      create: { storeId: store.id, key, value: serialized },
      update: { value: serialized },
    });
  }
  console.log(`  Seeded ${Object.keys(napfleetContent).length - 1} content keys`);

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
