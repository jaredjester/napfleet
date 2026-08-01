import type { TaxProvider } from "./types";

export const mockTaxProvider: TaxProvider = {
  async calculateTax({ subtotalCents }) {
    return { taxCents: Math.round(subtotalCents * 0.08), rate: 0.08 };
  },
};
