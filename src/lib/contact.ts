import { z } from "zod";

export const CONTACT_TOPICS = [
  "general",
  "order",
  "preorder",
  "sizing",
  "product",
  "other",
] as const;

/**
 * Server-side contact form validation. Mirrors the client-side first pass;
 * the server is authoritative.
 */
export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.email("Please enter a valid email address."),
  topic: z.enum(CONTACT_TOPICS, "Please select a valid topic."),
  message: z.string().trim().min(10, "Message must be at least 10 characters."),
  orderNumber: z.string().trim().optional(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

/**
 * Validate an unknown request body against the contact form schema.
 * Returns a Zod safeParse result — check `.success` before use.
 */
export function validateContactForm(body: unknown) {
  return contactFormSchema.safeParse(body);
}
