export type PolicyStatus = {
  slug: string;
  title: string;
  status: "draft" | "ready";
  missingItems: string[];
};

export function getPolicyStatuses(): PolicyStatus[] {
  return [
    {
      slug: "shipping-preorder",
      title: "Shipping and Preorder Policy",
      status: "draft",
      missingItems: [
        "Shipping origin",
        "Available destinations",
        "Shipping rates",
        "Carrier information",
        "Processing exceptions",
        "Address-change policy",
        "Delay policy",
        "Lost-package procedure",
        "Damaged-delivery procedure",
      ],
    },
    {
      slug: "returns",
      title: "Return Policy",
      status: "draft",
      missingItems: [
        "Preorder cancellation eligibility",
        "Personalized item returnability",
        "Return window",
        "Condition requirements",
        "Return-shipping responsibility",
        "Refund timing",
        "Damaged-item procedure",
        "Exchange availability",
        "Restocking fees",
      ],
    },
    {
      slug: "privacy",
      title: "Privacy Policy",
      status: "draft",
      missingItems: [
        "Business address",
        "Phone number",
        "Jurisdiction",
        "Legal registration",
        "Data-processor details",
      ],
    },
    {
      slug: "terms",
      title: "Terms and Conditions",
      status: "draft",
      missingItems: [
        "Business address",
        "Phone number",
        "Jurisdiction",
        "Legal registration",
        "Arbitration clauses",
        "Governing law",
      ],
    },
  ];
}

export function arePoliciesReady(): boolean {
  return getPolicyStatuses().every((p) => p.status === "ready");
}

export function canEnableCheckout(): { allowed: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const policies = getPolicyStatuses();
  const draftPolicies = policies.filter((p) => p.status === "draft");

  if (draftPolicies.length > 0) {
    reasons.push(`${draftPolicies.length} polic${draftPolicies.length === 1 ? "y" : "ies"} still in draft`);
  }

  return { allowed: reasons.length === 0, reasons };
}
