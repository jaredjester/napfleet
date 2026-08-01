import { PrismaClient } from "@prisma/client";
import { validateEnv } from "./env";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Runtime environment validation — called at module load so that a
// prohibited secret in the environment crashes on import (fail closed).
// Skipped in tests so unit tests can control their own environment.
if (process.env.NODE_ENV !== "test") {
  const env = validateEnv();
  if (!env.valid) {
    console.warn(`[env] Runtime environment issues: ${env.issues.join("; ")}`);
  }
}
