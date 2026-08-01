export interface EmailProvider {
  sendOrderConfirmation(params: {
    to: string;
    orderNumber: string;
    items: Array<{ title: string; variant: string; quantity: number; price: number }>;
    totalCents: number;
    shippingAddress: string;
    preorderEstimate: string;
  }): Promise<{ success: boolean; error?: string }>;

  sendRefundConfirmation(params: {
    to: string;
    orderNumber: string;
    amountCents: number;
  }): Promise<{ success: boolean; error?: string }>;

  sendContactNotification(params: {
    fromEmail: string;
    fromName: string;
    topic: string;
    message: string;
    orderNumber?: string;
  }): Promise<{ success: boolean; error?: string }>;
}
