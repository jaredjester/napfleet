import type { ShippingProvider } from "./types";

export const mockShippingProvider: ShippingProvider = {
  async calculateRate() {
    return { rateCents: 999, carrier: "Standard", estimatedDays: 56 };
  },
};
