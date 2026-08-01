export interface ShippingProvider {
  calculateRate(params: {
    items: Array<{ weight?: string; quantity: number }>;
    shippingAddress: { country: string; state: string; postalCode: string };
  }): Promise<{ rateCents: number; carrier: string; estimatedDays: number }>;
}
