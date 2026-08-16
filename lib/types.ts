export type LeadType = "great" | "good" | "average" | "struggling";

export type AnswerOption = { id: string; question_id: string; text: string; weight: number; gap_flag: string | null };
export type Question = { id: string; text: string; category: string; sort_order: number; answer_options: AnswerOption[] };
export type SelectedAnswer = { question_id: string; answer_option_id: string; gap_flag: string | null; weight: number };
export type AssessmentResponse = { id: string; answers: SelectedAnswer[]; total_score: number; lead_type: LeadType; gap_flags: string[]; created_at: string };
export type Product = { id: string; name: string; slug: string; description: string | null; price_cents: number; is_active: boolean; sort_order: number };
export type Purchase = { id: string; assessment_response_id: string; product_id: string; amount_cents: number; created_at: string };

export type DashboardMetrics = {
  totalReports: number;
  totalPurchases: number;
  totalRevenueCents: number;
  averageRating: number | null;
  leadDistribution: Record<LeadType, number>;
  purchasesByProduct: { name: string; count: number; revenueCents: number }[];
  recentReports: Pick<AssessmentResponse, "id" | "lead_type" | "total_score" | "gap_flags" | "created_at">[];
};
