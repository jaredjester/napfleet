/**
 * Runtime environment validation.
 *
 * Called at import time from server modules (see src/lib/db.ts and
 * src/lib/coinflow/server.ts) so that misconfigured deployments fail
 * closed instead of failing open at checkout time.
 *
 * validateEnv() itself never throws for missing or invalid values — it
 * returns them as issues so callers decide how to respond (for example,
 * the checkout prepare route returns 503 when production configuration
 * is invalid). The one exception is the prohibited-variable check: if a
 * private key or seed phrase is present we throw immediately. That is a
 * security breach, not a configuration gap, and it must crash the
 * process on import.
 */

export type EnvValidationResult = {
  valid: boolean;
  issues: string[];
};

const REQUIRED_COINFLOW_VARS = [
  "COINFLOW_API_KEY",
  "COINFLOW_WEBHOOK_SIGNING_SECRET",
  "NEXT_PUBLIC_COINFLOW_MERCHANT_ID",
] as const;

const PROHIBITED_VARS = [
  "WALLET_PRIVATE_KEY",
  "MERCHANT_PRIVATE_KEY",
  "SOLANA_PRIVATE_KEY",
  "WALLET_SEED_PHRASE",
] as const;

/**
 * Validate the runtime environment.
 *
 * Returns `{ valid, issues }` where `issues` lists every detected problem.
 * Throws if a prohibited secret variable (private key / seed phrase) is
 * set — those must never exist in the environment, in any environment.
 */
export function validateEnv(): EnvValidationResult {
  const issues: string[] = [];

  // Required Coinflow configuration
  for (const key of REQUIRED_COINFLOW_VARS) {
    if (!process.env[key]) {
      issues.push(`${key} is missing`);
    }
  }

  // Database
  if (!process.env.DATABASE_URL) {
    issues.push("DATABASE_URL is missing");
  }

  // Coinflow environment must be explicitly sandbox or prod
  const coinflowEnv = process.env.COINFLOW_ENV;
  if (!coinflowEnv) {
    issues.push('COINFLOW_ENV is missing (expected "sandbox" or "prod")');
  } else if (coinflowEnv !== "sandbox" && coinflowEnv !== "prod") {
    issues.push(`COINFLOW_ENV must be "sandbox" or "prod", got "${coinflowEnv}"`);
  }

  // Production settlement guarantees — checkout is gated on these in prod
  if (coinflowEnv === "prod") {
    if (!process.env.COINFLOW_EXPECTED_SETTLEMENT_ADDRESS) {
      issues.push("COINFLOW_EXPECTED_SETTLEMENT_ADDRESS is required when COINFLOW_ENV is prod");
    }
    if (process.env.COINFLOW_EXPECTED_SETTLEMENT_ASSET !== "USDC") {
      issues.push('COINFLOW_EXPECTED_SETTLEMENT_ASSET must be "USDC" when COINFLOW_ENV is prod');
    }
  }

  // Prohibited secrets — throw immediately. These must never be present.
  for (const key of PROHIBITED_VARS) {
    if (process.env[key]) {
      throw new Error(
        `Environment validation failed: prohibited variable ${key} is set. ` +
          "Private keys and seed phrases must never be stored in the application environment. Remove it now."
      );
    }
  }

  return { valid: issues.length === 0, issues };
}
