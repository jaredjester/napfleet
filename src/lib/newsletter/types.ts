export interface NewsletterProvider {
  subscribe(email: string): Promise<{ success: boolean; error?: string }>;
}
