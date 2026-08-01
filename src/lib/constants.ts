export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const PREORDER_ESTIMATE_WEEKS = 8;
export const PREORDER_ESTIMATE_TEXT = "Approximately 8 weeks";

export const DOMAINS = ["AIR", "LAND", "SEA"] as const;
export type Domain = (typeof DOMAINS)[number];
