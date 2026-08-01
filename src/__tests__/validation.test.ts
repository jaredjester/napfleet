import { describe, it, expect } from "vitest";
import { validateProduct, canPublish } from "@/lib/validation/catalog";
import { lintContent } from "@/lib/validation/content";
import { canEnableCheckout, getPolicyStatuses } from "@/lib/validation/policies";
import type { CommerceProduct } from "@/lib/commerce/types";

function makeMockProduct(overrides: Partial<CommerceProduct> = {}): CommerceProduct {
  return {
    handle: "test-product",
    title: "Test Product",
    description: "A test product",
    domain: "AIR",
    images: ["/test.jpg"],
    variants: [{ id: "v1", title: "Default", sku: "SKU-1", price: 6999, available: true }],
    publishReady: false,
    preorderStatus: "open",
    preorderEstimateWeeks: 8,
    overallLength: "30 in",
    overallWidth: "24 in",
    overallHeight: "14 in",
    interiorSleepingLength: "24 in",
    interiorSleepingWidth: "18 in",
    materials: "Polyester, foam",
    filling: "Polyester fiberfill",
    careInstructions: "Spot clean",
    boxContents: "One dog bed",
    assemblyRequired: "No assembly required",
    returnEligibility: "Eligible for return within 30 days",
    sleepAreaDesign: "Tufted center with padded sides",
    ...overrides,
  };
}

describe("validateProduct", () => {
  it("passes a fully configured product", () => {
    const product = makeMockProduct();
    const issues = validateProduct(product);
    const errors = issues.filter((i) => i.severity === "error");
    expect(errors).toHaveLength(0);
  });

  it("fails when required metafields are missing", () => {
    const product = makeMockProduct({
      materials: undefined,
      filling: undefined,
      careInstructions: undefined,
    });
    const issues = validateProduct(product);
    const errors = issues.filter((i) => i.severity === "error");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("fails when no images are available", () => {
    const product = makeMockProduct({ images: [] });
    const issues = validateProduct(product);
    const imageIssue = issues.find((i) => i.field === "images");
    expect(imageIssue?.severity).toBe("error");
  });

  it("fails when domain is invalid", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const product = makeMockProduct({ domain: "SPACE" as any });
    const issues = validateProduct(product);
    const domainIssue = issues.find((i) => i.field === "domain");
    expect(domainIssue?.severity).toBe("error");
  });

  it("fails when no variants are available", () => {
    const product = makeMockProduct({
      variants: [{ id: "v1", title: "X", sku: "X", price: 6999, available: false }],
    });
    const issues = validateProduct(product);
    const variantIssue = issues.find((i) => i.field === "variants" && i.message.includes("available"));
    expect(variantIssue).toBeDefined();
  });

  it("canPublish returns false for incomplete products", () => {
    const incomplete = makeMockProduct({ materials: undefined });
    expect(canPublish(incomplete)).toBe(false);
  });

  it("canPublish returns true for complete products", () => {
    const complete = makeMockProduct();
    expect(canPublish(complete)).toBe(true);
  });
});

describe("content lint", () => {
  it("detects prohibited source branding", () => {
    const issues = lintContent("This HeliFan product is great with the airframe design");
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.some((i) => i.reason === "Source branding")).toBe(true);
  });

  it("detects unsupported claims", () => {
    const issues = lintContent("Our orthopedic, waterproof, chew-proof dog bed");
    expect(issues.length).toBeGreaterThan(0);
  });

  it("detects trademark symbols next to NapFleet", () => {
    const issues = lintContent("NapFleet\u2122 is the best brand");
    expect(issues.some((i) => i.term.includes("\u2122"))).toBe(true);
  });

  it("passes clean content", () => {
    const issues = lintContent("NapFleet makes vehicle-shaped dog beds for big dreamers");
    expect(issues).toHaveLength(0);
  });
});

describe("policies", () => {
  it("all policies are currently in draft", () => {
    const policies = getPolicyStatuses();
    expect(policies.length).toBe(4);
    expect(policies.every((p) => p.status === "draft")).toBe(true);
  });

  it("checkout is disabled when policies are draft", () => {
    const { allowed } = canEnableCheckout();
    expect(allowed).toBe(false);
  });
});
