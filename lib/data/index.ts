import { createClient } from "@/lib/supabase/client";
import type { AssessmentResponse, DashboardMetrics, LeadType, Product, Purchase, Question, SelectedAnswer, UserProfile } from "@/lib/types";

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
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) fail("Sign in before submitting your assessment");
  const { data, error } = await supabase.from("assessment_responses").insert({
    user_id: user.id,
    answers: input.answers,
    total_score: input.totalScore,
    lead_type: input.leadType,
    gap_flags: input.gapFlags,
  }).select("id,answers,total_score,lead_type,gap_flags,created_at").single();
  if (error || !data) fail("Your assessment could not be saved", error);
  return { ...data, total_score: Number(data.total_score) } as AssessmentResponse;
}

export async function getAssessmentResponse(id: string): Promise<AssessmentResponse | null> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) return null;
  const { data, error } = await createClient().from("assessment_responses").select("id,answers,total_score,lead_type,gap_flags,created_at").eq("id", id).maybeSingle();
  if (error) fail("Could not load this report", error);
  return data ? ({ ...data, total_score: Number(data.total_score) } as AssessmentResponse) : null;
}

export async function getCurrentProfile(): Promise<UserProfile | null> {
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return null;
  const { data, error } = await supabase.from("profiles").select("id,email,full_name,company,phone,role").eq("id", user.id).maybeSingle();
  if (error) fail("Could not load your account", error);
  return data as UserProfile | null;
}

export async function getActiveProducts(): Promise<Product[]> {
  const { data, error } = await createClient().from("products").select("id,name,slug,description,price_cents,is_active,sort_order").eq("is_active", true).order("sort_order");
  if (error) fail("Could not load products", error);
  return (data ?? []) as Product[];
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await createClient().from("products").select("id,name,slug,description,price_cents,is_active,sort_order").order("sort_order");
  if (error) fail("Could not load products", error);
  return (data ?? []) as Product[];
}

export async function createProduct(input: { name: string; description: string; priceCents: number }): Promise<Product> {
  const baseSlug = input.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "program";
  const { data: lastProduct } = await createClient().from("products").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
  const { data, error } = await createClient().from("products").insert({
    name: input.name.trim(),
    slug: `${baseSlug}-${Date.now().toString(36)}`,
    description: input.description.trim(),
    price_cents: input.priceCents,
    is_active: true,
    sort_order: (lastProduct?.sort_order ?? 0) + 1,
  }).select("id,name,slug,description,price_cents,is_active,sort_order").single();
  if (error || !data) fail("Could not create this program", error);
  return data as Product;
}

export async function updateProduct(id: string, input: { name: string; description: string; priceCents: number }): Promise<Product> {
  const { data, error } = await createClient().from("products").update({ name: input.name.trim(), description: input.description.trim(), price_cents: input.priceCents }).eq("id", id).select("id,name,slug,description,price_cents,is_active,sort_order").single();
  if (error || !data) fail("Could not update this program", error);
  return data as Product;
}

export async function setProductActive(id: string, isActive: boolean): Promise<Product> {
  const { data, error } = await createClient().from("products").update({ is_active: isActive }).eq("id", id).select("id,name,slug,description,price_cents,is_active,sort_order").single();
  if (error || !data) fail(isActive ? "Could not restore this program" : "Could not archive this program", error);
  return data as Product;
}

export async function createPurchase(responseId: string, product: Product): Promise<Purchase> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) fail("Sign in before selecting a program");
  const { data, error } = await supabase.from("purchases").insert({ user_id: user.id, assessment_response_id: responseId, product_id: product.id, amount_cents: product.price_cents }).select("id,assessment_response_id,product_id,amount_cents,created_at").single();
  if (error || !data) fail("Could not record this purchase", error);
  return data as Purchase;
}

export async function createRating(responseId: string, score: number, referralEmail?: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) fail("Sign in before sharing feedback");
  const { data, error } = await supabase.from("ratings").insert({ user_id: user.id, assessment_response_id: responseId, score, referral_email: referralEmail || null }).select("id").single();
  if (error || !data) fail("Could not save your feedback", error);
  return data;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = createClient();
  const [responsesResult, purchasesResult, productsResult, ratingsResult] = await Promise.all([
    supabase.from("assessment_responses").select("id,lead_type,total_score,gap_flags,created_at,lead:profiles!assessment_responses_user_id_fkey(full_name,email,company,phone)").order("created_at", { ascending: false }),
    supabase.from("purchases").select("id,product_id,amount_cents,created_at"),
    supabase.from("products").select("id,name"),
    supabase.from("ratings").select("score"),
  ]);

  const firstError = responsesResult.error ?? purchasesResult.error ?? productsResult.error ?? ratingsResult.error;
  if (firstError) fail("Could not load dashboard metrics", firstError);

  const responses = responsesResult.data ?? [];
  const purchases = purchasesResult.data ?? [];
  const products = productsResult.data ?? [];
  const ratings = ratingsResult.data ?? [];
  const leadDistribution: Record<LeadType, number> = { great: 0, good: 0, average: 0, struggling: 0 };
  for (const response of responses) {
    if (response.lead_type in leadDistribution) leadDistribution[response.lead_type as LeadType] += 1;
  }

  const purchasesByProduct = products.map((product) => {
    const matching = purchases.filter((purchase) => purchase.product_id === product.id);
    return {
      name: product.name,
      count: matching.length,
      revenueCents: matching.reduce((sum, purchase) => sum + purchase.amount_cents, 0),
    };
  }).filter((product) => product.count > 0).sort((a, b) => b.count - a.count || b.revenueCents - a.revenueCents);

  const ratingTotal = ratings.reduce((sum, rating) => sum + rating.score, 0);
  return {
    totalReports: responses.length,
    totalPurchases: purchases.length,
    totalRevenueCents: purchases.reduce((sum, purchase) => sum + purchase.amount_cents, 0),
    averageRating: ratings.length ? ratingTotal / ratings.length : null,
    leadDistribution,
    purchasesByProduct,
    recentReports: responses.slice(0, 5).map((response) => ({
      ...response,
      total_score: Number(response.total_score),
      lead: Array.isArray(response.lead) ? (response.lead[0] ?? null) : response.lead,
    })) as DashboardMetrics["recentReports"],
  };
}
