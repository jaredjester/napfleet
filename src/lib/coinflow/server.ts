/**
 * Server-side Coinflow client.
 * API keys never reach the browser. All mutations are server-authoritative.
 */
import { Currency } from "@coinflowlabs/react";
import { validateEnv } from "../env";
import type { CoinflowEnv, CoinflowSessionResult, CheckoutJwtPayload } from "./types";

// Runtime environment validation — called at module load so that a
// prohibited secret in the environment crashes on import (fail closed).
// Skipped in tests so unit tests can control their own environment.
if (process.env.NODE_ENV !== "test") {
  const env = validateEnv();
  if (!env.valid) {
    console.warn(`[env] Runtime environment issues: ${env.issues.join("; ")}`);
  }
}

const API_BASE: Record<CoinflowEnv, string> = {
  sandbox: "https://api-sandbox.coinflow.cash",
  prod: "https://api.coinflow.cash",
};

function getApiKey(): string {
  const key = process.env.COINFLOW_API_KEY;
  if (!key) throw new Error("COINFLOW_API_KEY is required");
  return key;
}

function getEnv(): CoinflowEnv {
  const env = process.env.COINFLOW_ENV || "sandbox";
  if (env !== "sandbox" && env !== "prod") {
    throw new Error(`COINFLOW_ENV must be "sandbox" or "prod", got "${env}"`);
  }
  return env;
}

function getBaseUrl(): string {
  return API_BASE[getEnv()];
}

type CoinflowApiResponse<T> = { data?: T; error?: string };

async function coinflowFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<CoinflowApiResponse<T>> {
  const apiKey = getApiKey();
  const url = `${getBaseUrl()}${path}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
        ...options.headers,
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { error: `Coinflow API error ${res.status}: ${text.slice(0, 500)}` };
    }

    const data = (await res.json()) as T;
    return { data };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown Coinflow API error" };
  }
}

/**
 * Generate or retrieve a session key for a given payer.
 * Session keys authorize the payer and are valid for 24 hours.
 */
export async function createSessionKey(
  userId: string
): Promise<CoinflowSessionResult> {
  const result = await coinflowFetch<{
    sessionKey: string;
    expiresAt?: string;
    userId: string;
  }>("/api/session-key", {
    method: "POST",
    body: JSON.stringify({ userId }),
  });

  if (result.error || !result.data) {
    throw new Error(`Failed to create session key: ${result.error || "No data returned"}`);
  }

  return {
    sessionKey: result.data.sessionKey,
    expiresAt: result.data.expiresAt ? new Date(result.data.expiresAt) : undefined,
  };
}

/**
 * Generate a checkout JWT token server-side.
 * Signs the exact server-calculated purchase data so the frontend cannot tamper.
 */
export async function createCheckoutJwt(
  payload: CheckoutJwtPayload
): Promise<string> {
  const result = await coinflowFetch<{ checkoutJwtToken: string }>(
    "/api/checkout/jwt-token",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  if (result.error || !result.data) {
    throw new Error(`Failed to create checkout JWT: ${result.error || "No data returned"}`);
  }

  return result.data.checkoutJwtToken;
}

/**
 * Retrieve current payment status from Coinflow.
 * Used for reconciliation and status polling.
 */
export async function getPaymentStatus(
  paymentId: string
): Promise<Record<string, unknown> | null> {
  const result = await coinflowFetch<Record<string, unknown>>(
    `/api/payment/${paymentId}`
  );

  if (result.error || !result.data) {
    return null;
  }

  return result.data;
}

/**
 * Process a refund through Coinflow.
 */
export async function createRefund(params: {
  paymentId: string;
  amountCents: number;
  currency?: Currency;
  reason?: string;
  idempotencyKey: string;
}): Promise<{ providerRefundId?: string; error?: string }> {
  const result = await coinflowFetch<{ refundId: string }>(
    "/api/refund",
    {
      method: "POST",
      body: JSON.stringify({
        paymentId: params.paymentId,
        amount: { cents: params.amountCents, currency: params.currency || Currency.USD },
        reason: params.reason || "customer_request",
        idempotencyKey: params.idempotencyKey,
      }),
    }
  );

  if (result.error || !result.data) {
    return { error: result.error || "Refund failed" };
  }

  return { providerRefundId: result.data.refundId };
}

/**
 * Verify a Coinflow webhook signature.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string
): boolean {
  if (!signatureHeader || !secret) return false;

  try {
    // Coinflow uses HMAC-SHA256 for webhook signatures
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crypto = require("crypto");
    const computed = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(computed),
      Buffer.from(signatureHeader)
    );
  } catch {
    return false;
  }
}

/**
 * Validate production configuration.
 * Returns array of issues, empty if configuration is valid.
 */
export function validateCoinflowConfig(): string[] {
  const issues: string[] = [];
  const env = process.env.COINFLOW_ENV || "sandbox";

  if (!process.env.COINFLOW_API_KEY) {
    issues.push("COINFLOW_API_KEY is missing");
  }

  if (!process.env.COINFLOW_WEBHOOK_SIGNING_SECRET) {
    issues.push("COINFLOW_WEBHOOK_SIGNING_SECRET is missing");
  }

  if (!process.env.NEXT_PUBLIC_COINFLOW_MERCHANT_ID) {
    issues.push("NEXT_PUBLIC_COINFLOW_MERCHANT_ID is missing");
  }

  if (env === "prod") {
    if (!process.env.COINFLOW_EXPECTED_SETTLEMENT_ADDRESS) {
      issues.push("COINFLOW_EXPECTED_SETTLEMENT_ADDRESS is required in production");
    }
    if (process.env.COINFLOW_EXPECTED_SETTLEMENT_ASSET !== "USDC") {
      issues.push("COINFLOW_EXPECTED_SETTLEMENT_ASSET must be USDC");
    }
  }

  // Security: reject if private keys are found in env
  const prohibited = [
    "WALLET_PRIVATE_KEY",
    "MERCHANT_PRIVATE_KEY",
    "SOLANA_PRIVATE_KEY",
    "WALLET_SEED_PHRASE",
  ];
  for (const key of prohibited) {
    if (process.env[key]) {
      issues.push(`PROHIBITED: ${key} is set. This must not be present.`);
    }
  }

  return issues;
}

/** Getter for Coinflow merchant ID (safe for server use) */
export function getMerchantId(): string {
  return process.env.COINFLOW_MERCHANT_ID || process.env.NEXT_PUBLIC_COINFLOW_MERCHANT_ID || "";
}

export { getEnv as getCoinflowEnv };
