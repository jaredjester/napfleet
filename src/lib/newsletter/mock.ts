import type { NewsletterProvider } from "./types";

export const mockNewsletterProvider: NewsletterProvider = {
  async subscribe(email: string) {
    console.log(`[NEWSLETTER MOCK] Subscribed: ${email}`);
    return { success: true };
  },
};
