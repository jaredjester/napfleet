import type { EmailProvider } from "./types";

/**
 * Mock email provider for development.
 * Logs the full content of every email to the console with an
 * [EMAIL MOCK] prefix and always reports success.
 */
export class MockEmailProvider implements EmailProvider {
  private log(kind: string, params: unknown) {
    console.log(`[EMAIL MOCK] ${kind}`);
    console.log(JSON.stringify(params, null, 2));
  }

  async sendOrderConfirmation(params: {
    to: string;
    orderNumber: string;
    items: Array<{ title: string; variant: string; quantity: number; price: number }>;
    totalCents: number;
    shippingAddress: string;
    preorderEstimate: string;
  }): Promise<{ success: boolean; error?: string }> {
    this.log("Order confirmation", {
      subject: `Order Confirmed — ${params.orderNumber}`,
      ...params,
    });
    return { success: true };
  }

  async sendRefundConfirmation(params: {
    to: string;
    orderNumber: string;
    amountCents: number;
  }): Promise<{ success: boolean; error?: string }> {
    this.log("Refund confirmation", {
      subject: `Refund Processed — ${params.orderNumber}`,
      ...params,
    });
    return { success: true };
  }

  async sendContactNotification(params: {
    fromEmail: string;
    fromName: string;
    topic: string;
    message: string;
    orderNumber?: string;
  }): Promise<{ success: boolean; error?: string }> {
    this.log("Contact notification", {
      subject: `[NapFleet Contact] ${params.topic} — from ${params.fromName}`,
      ...params,
    });
    return { success: true };
  }
}
