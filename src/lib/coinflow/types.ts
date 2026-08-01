import type { Subtotal } from "@coinflowlabs/react";

// Re-export Subtotal for internal use
export type { Subtotal };

export type CoinflowEnv = "sandbox" | "prod";

export interface CoinflowSessionResult {
  sessionKey: string;
  expiresAt?: Date;
}

export interface CheckoutJwtPayload {
  subtotal: Subtotal;
  customerInfo?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  webhookInfo?: Record<string, unknown>;
  chargebackProtectionData?: Array<Record<string, unknown>>;
  settlementType?: string;
  sessionKey?: string;
}

export interface PrepareCheckoutInput {
  items: Array<{
    productId: string;
    variantId: string;
    quantity: number;
  }>;
  customer: {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  discountCode?: string;
  /**
   * Client-generated idempotency key (e.g. a UUID). When provided, a
   * repeated prepare request with the same key returns the existing
   * checkout attempt instead of creating a duplicate order.
   */
  clientIdempotencyKey?: string;
}

export interface PrepareCheckoutResponse {
  orderNumber: string;
  checkoutAttemptId: string;
  merchantId: string;
  environment: CoinflowEnv;
  sessionKey: string;
  jwtToken?: string;
  subtotal: Subtotal;
  displayOrder: {
    items: Array<{
      title: string;
      variant: string;
      quantity: number;
      unitPriceCents: number;
      image?: string;
    }>;
    subtotalCents: number;
    discountCents: number;
    shippingCents: number;
    taxCents: number;
    totalCents: number;
  };
}

export type WebhookEventType =
  | "payment.authorized"
  | "payment.declined"
  | "payment.disbursed"
  | "payment.settled"
  | "refund.initiated"
  | "refund.completed"
  | "chargeback.opened"
  | "chargeback.updated"
  | "chargeback.closed";

export enum FraudProtectionStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  NOT_REVIEWED = "NOT_REVIEWED",
}

export enum OrderPaymentStatus {
  PENDING_PAYMENT = "PENDING_PAYMENT",
  PAYMENT_PROCESSING = "PAYMENT_PROCESSING",
  PAYMENT_REVIEW_REQUIRED = "PAYMENT_REVIEW_REQUIRED",
  PAID = "PAID",
  PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED",
  REFUNDED = "REFUNDED",
  FAILED = "FAILED",
  CANCELED = "CANCELED",
}
