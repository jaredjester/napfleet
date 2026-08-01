export interface TaxProvider {
  calculateTax(params: {
    subtotalCents: number;
    shippingAddress: { country: string; state: string; postalCode: string };
  }): Promise<{ taxCents: number; rate: number }>;
}
