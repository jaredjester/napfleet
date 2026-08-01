import type { EmailProvider } from "./types";
import { ResendEmailProvider } from "./resend";
import { MockEmailProvider } from "./mock";

export type { EmailProvider } from "./types";

/**
 * Select the email provider at import time:
 * - RESEND_API_KEY set → ResendEmailProvider
 * - otherwise → MockEmailProvider (development)
 */
const apiKey = process.env.RESEND_API_KEY;

export const emailProvider: EmailProvider = apiKey
  ? new ResendEmailProvider(apiKey)
  : new MockEmailProvider();

console.log(
  `[email] Using ${apiKey ? "Resend" : "mock"} email provider (RESEND_API_KEY ${apiKey ? "set" : "not set"})`
);
