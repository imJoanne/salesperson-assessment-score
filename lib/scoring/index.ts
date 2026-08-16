import type { LeadType, SelectedAnswer } from "@/lib/types";

export const CRITICAL_GAPS = new Set(["no_sales_system", "conversion_below_5", "no_objection_handling"]);

export const GAP_LABELS: Record<string, string> = {
  no_sales_system: "No repeatable sales system",
  no_documented_process: "Process is not documented",
  no_psychology_basis: "Sales approach is not grounded in buyer psychology",
  conversion_below_5: "Lead-to-close conversion is below 5%",
  lead_gen_issues: "Lead flow is inconsistent",
  no_persuasive_language: "Persuasive conversation skills need strengthening",
  no_usp_features_only: "Value is explained as features, not outcomes",
  no_follow_up_system: "Follow-up is inconsistent or manual",
  no_referral_system: "No reliable referral system",
  no_objection_handling: "No repeatable objection-handling framework",
  scaling_strategy: "Growth depends on you rather than a scaling plan",
};

export function scoreAssessment(answers: SelectedAnswer[]) {
  const totalScore = answers.reduce((total, answer) => total + Number(answer.weight), 0);
  const gapFlags = [...new Set(answers.map((answer) => answer.gap_flag).filter(Boolean))] as string[];
  const criticalCount = gapFlags.filter((flag) => CRITICAL_GAPS.has(flag)).length;
  let leadType: LeadType;
  if (totalScore >= 45 || criticalCount >= 3) leadType = "struggling";
  else if (totalScore >= 30) leadType = "average";
  else if (totalScore >= 15) leadType = "good";
  else if (criticalCount === 0) leadType = "great";
  else leadType = "good";
  return { totalScore, leadType, gapFlags };
}

export function formatGap(flag: string) {
  return GAP_LABELS[flag] ?? flag.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}
