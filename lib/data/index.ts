import { createClient } from "@/lib/supabase/client";
import type { AssessmentResponse, Product, Purchase, Question, SelectedAnswer } from "@/lib/types";

function fail(message: string, error?: { message?: string } | null): never {
  throw new Error(error?.message ? `${message}: ${error.message}` : message);
}

export async function getQuestions(): Promise<Question[]> {
  const supabase = createClient();
  const [{ data: questions, error: questionError }, { data: options, error: optionError }] = await Promise.all([
    supabase.from("questions").select("id,text,category,sort_order").order("sort_order"),
    supabase.from("answer_options").select("id,question_id,text,weight,gap_flag").order("weight"),
  ]);
  if (questionError) fail("Could not load assessment questions", questionError);
  if (optionError) fail("Could not load answer options", optionError);
  return (questions ?? []).map((question) => ({
    ...question,
    answer_options: (options ?? []).filter((option) => option.question_id === question.id).map((option) => ({ ...option, weight: Number(option.weight) })),
  }));
}

export async function createAssessmentResponse(input: { answers: SelectedAnswer[]; totalScore: number; leadType: string; gapFlags: string[] }): Promise<AssessmentResponse> {
  const { data, error } = await createClient().from("assessment_responses").insert({
    answers: input.answers,
    total_score: input.totalScore,
    lead_type: input.leadType,
    gap_flags: input.gapFlags,
  }).select("id,answers,total_score,lead_type,gap_flags,created_at").single();
  if (error || !data) fail("Your assessment could not be saved", error);
  return { ...data, total_score: Number(data.total_score) } as AssessmentResponse;
}

export async function getAssessmentResponse(id: string): Promise<AssessmentResponse | null> {
  const { data, error } = await createClient().from("assessment_responses").select("id,answers,total_score,lead_type,gap_flags,created_at").eq("id", id).maybeSingle();
  if (error) fail("Could not load this report", error);
  return data ? ({ ...data, total_score: Number(data.total_score) } as AssessmentResponse) : null;
}

export async function getActiveProducts(): Promise<Product[]> {
  const { data, error } = await createClient().from("products").select("id,name,slug,description,price_cents,is_active,sort_order").eq("is_active", true).order("sort_order");
  if (error) fail("Could not load products", error);
  return (data ?? []) as Product[];
}

export async function createPurchase(responseId: string, product: Product): Promise<Purchase> {
  const { data, error } = await createClient().from("purchases").insert({ assessment_response_id: responseId, product_id: product.id, amount_cents: product.price_cents }).select("id,assessment_response_id,product_id,amount_cents,created_at").single();
  if (error || !data) fail("Could not record this purchase", error);
  return data as Purchase;
}

export async function createRating(responseId: string, score: number, referralEmail?: string) {
  const { data, error } = await createClient().from("ratings").insert({ assessment_response_id: responseId, score, referral_email: referralEmail || null }).select("id").single();
  if (error || !data) fail("Could not save your feedback", error);
  return data;
}
