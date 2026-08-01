import type { NewsletterProvider } from "./types";
import { mockNewsletterProvider } from "./mock";

export type { NewsletterProvider } from "./types";

/**
 * Select the newsletter provider at import time.
 * Mock is the default until a real provider (e.g. Mailchimp via
 * NEWSLETTER_PROVIDER / NEWSLETTER_API_KEY) is configured.
 */
export const newsletterProvider: NewsletterProvider = mockNewsletterProvider;

console.log("[newsletter] Using mock newsletter provider");
