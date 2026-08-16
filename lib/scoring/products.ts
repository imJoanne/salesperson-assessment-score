import type { LeadType, Product } from "@/lib/types";

const PRODUCT_GAPS: Record<string, string[]> = {
  "ready-set-close-master-sales-system": ["no_sales_system", "no_documented_process", "no_psychology_basis", "no_objection_handling", "no_follow_up_system"],
  "4-week-fast-track": ["no_sales_system", "conversion_below_5", "no_follow_up_system", "scaling_strategy"],
  "4-week-fast-track-inner-circle": ["scaling_strategy", "conversion_below_5"],
  "persuasive-conversation-masterclass": ["no_persuasive_language", "no_usp_features_only", "no_objection_handling", "no_psychology_basis"],
  "get-leads-and-close-sales": ["lead_gen_issues", "no_referral_system", "conversion_below_5"],
};

export type MatchedProduct = Product & { matchCount: number; matchedGaps: string[] };

export function matchProducts(products: Product[], gapFlags: string[], leadType: LeadType): MatchedProduct[] {
  const ranked = products.map((product) => {
    const matchedGaps = (PRODUCT_GAPS[product.slug] ?? []).filter((gap) => gapFlags.includes(gap));
    return { ...product, matchedGaps, matchCount: matchedGaps.length };
  }).filter((product) => product.matchCount > 0);

  if (leadType === "great") {
    const strategy = products.find((product) => product.slug === "4-week-fast-track");
    if (strategy && !ranked.some((product) => product.id === strategy.id)) ranked.push({ ...strategy, matchedGaps: [], matchCount: 1 });
  }

  return ranked.sort((a, b) => b.matchCount - a.matchCount || a.sort_order - b.sort_order).slice(0, 2);
}
