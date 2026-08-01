import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding NapFleet database...");

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

  console.log(`Store created: ${store.slug} (${store.id})`);
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
