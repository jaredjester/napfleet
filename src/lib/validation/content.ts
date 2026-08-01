/**
 * Content lint script — scans for prohibited terms and unsupported claims.
 */

const PROHIBITED_TERMS = [
  { term: /HeliFan/gi, reason: "Source branding" },
  { term: /My Store/gi, reason: "Source branding" },
  { term: /Shrine/gi, reason: "Source branding" },
  { term: /helicopter ceiling fan/gi, reason: "Source product language" },
  { term: /airframe/gi, reason: "Source product language" },
  { term: /NapFleet™/g, reason: "Trademark symbol (clearance not complete)" },
  { term: /NapFleet®/g, reason: "Registered mark (not registered)" },
  { term: /\bOrthopedic\b/gi, reason: "Unsupported health claim" },
  { term: /\borthopedic\b/gi, reason: "Unsupported health claim" },
  { term: /Chew-proof\b/gi, reason: "Unsupported durability claim" },
  { term: /chew-proof\b/gi, reason: "Unsupported durability claim" },
  { term: /Indestructible\b/gi, reason: "Unsupported durability claim" },
  { term: /Waterproof\b/gi, reason: "Unsupported material claim" },
  { term: /waterproof\b/gi, reason: "Unsupported material claim" },
  { term: /Machine washable\b/gi, reason: "Unsupported care claim" },
  { term: /Hypoallergenic\b/gi, reason: "Unsupported health claim" },
  { term: /Vet approved\b/gi, reason: "Unsupported endorsement claim" },
  { term: /Anxiety reducing\b/gi, reason: "Unsupported health claim" },
  { term: /Calming\b/gi, reason: "Unsupported health claim (in product context)" },
  { term: /Therapeutic\b/gi, reason: "Unsupported health claim" },
  { term: /Made in America\b/gi, reason: "Unsupported manufacturing claim" },
  { term: /Military-grade/i, reason: "Unsupported specification claim" },
  { term: /Combat-grade/i, reason: "Unsupported specification claim" },
  { term: /combat-tested/i, reason: "Unsupported specification claim" },
  { term: /Powered by Shrine/i, reason: "Source branding" },
  { term: /© 2035/i, reason: "Incorrect year" },
];

export type ContentIssue = {
  term: string;
  reason: string;
};

export function lintContent(text: string): ContentIssue[] {
  const issues: ContentIssue[] = [];
  for (const rule of PROHIBITED_TERMS) {
    if (rule.term.test(text)) {
      issues.push({ term: rule.term.source, reason: rule.reason });
    }
  }
  return issues;
}

export function lintMultipleContents(texts: { source: string; content: string }[]): { source: string; issues: ContentIssue[] }[] {
  return texts.map((t) => ({ source: t.source, issues: lintContent(t.content) })).filter((r) => r.issues.length > 0);
}
