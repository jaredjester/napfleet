import type { CommerceProduct } from "@/lib/commerce/types";

export type CatalogIssue = {
  product: string;
  field: string;
  severity: "error" | "warning";
  message: string;
};

export function validateProduct(product: CommerceProduct): CatalogIssue[] {
  const issues: CatalogIssue[] = [];

  // Required commerce fields
  if (!product.title) {
    issues.push({ product: product.handle, field: "title", severity: "error", message: "Product title is missing" });
  }

  if (!product.variants || product.variants.length === 0) {
    issues.push({ product: product.handle, field: "variants", severity: "error", message: "No variants defined" });
  }

  if (product.variants.some((v) => v.price <= 0)) {
    issues.push({ product: product.handle, field: "price", severity: "error", message: "Invalid price" });
  }

  if (!product.variants.some((v) => v.available)) {
    issues.push({ product: product.handle, field: "variants", severity: "error", message: "No available variants" });
  }

  // Required metafield checks
  const requiredFields: { field: keyof CommerceProduct; label: string }[] = [
    { field: "overallLength", label: "Overall length" },
    { field: "overallWidth", label: "Overall width" },
    { field: "overallHeight", label: "Overall height" },
    { field: "interiorSleepingLength", label: "Interior sleeping length" },
    { field: "interiorSleepingWidth", label: "Interior sleeping width" },
    { field: "materials", label: "Materials" },
    { field: "filling", label: "Filling" },
    { field: "careInstructions", label: "Care instructions" },
    { field: "boxContents", label: "Box contents" },
    { field: "assemblyRequired", label: "Assembly required" },
    { field: "returnEligibility", label: "Return eligibility" },
    { field: "sleepAreaDesign", label: "Sleep area design" },
  ];

  for (const rf of requiredFields) {
    if (!product[rf.field]) {
      issues.push({
        product: product.handle,
        field: rf.field,
        severity: "error",
        message: `${rf.label} is required for publish readiness`,
      });
    }
  }

  // Image check
  if (!product.images || product.images.length === 0) {
    issues.push({
      product: product.handle,
      field: "images",
      severity: "error",
      message: "No product images available",
    });
  }

  // Domain check
  if (!["AIR", "LAND", "SEA"].includes(product.domain)) {
    issues.push({ product: product.handle, field: "domain", severity: "error", message: "Invalid domain" });
  }

  return issues;
}

export function validateAllProducts(products: CommerceProduct[]): { product: string; publishReady: boolean; issues: CatalogIssue[] }[] {
  return products.map((p) => ({
    product: p.handle,
    publishReady: p.publishReady,
    issues: validateProduct(p),
  }));
}

export function canPublish(product: CommerceProduct): boolean {
  const isProduction = process.env.COINFLOW_ENV === "prod";

  // In sandbox/development, only block on the most fundamental issues
  // (no images, no variants, invalid domain). Metafield requirements
  // are enforced only in production where real orders are taken.
  if (!isProduction) {
    const issues = validateProduct(product);
    const fundamentalErrors = issues.filter(
      (i) => i.severity === "error" && ["images", "variants", "domain", "price", "title"].includes(i.field)
    );
    return fundamentalErrors.length === 0;
  }

  const issues = validateProduct(product);
  return issues.filter((i) => i.severity === "error").length === 0;
}

export function catalogReadinessReport(): string {
  // Dynamic import not needed — products are imported at call time
  return "Run validateAllProducts with commerce provider data to generate report.";
}
