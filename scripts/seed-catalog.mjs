import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) throw new Error("Run with --env-file=.env.local after pulling the Vercel environment.");

const supabase = createClient(url, key);
const catalog = [
  [4, "Lead Generation", "How predictable is your flow of qualified leads each month?", [["Predictable enough to plan growth with confidence", 0, null], ["It varies and creates occasional slow periods", 2, "lead_gen_issues"], ["Unpredictable or mostly dependent on referrals", 5, "lead_gen_issues"]]],
  [5, "Conversation", "How consistently do your sales conversations uncover the buyer's real needs?", [["Consistently—I use a clear discovery framework", 0, null], ["Usually, but some conversations stay surface-level", 2, "no_persuasive_language"], ["Rarely—I tend to present before fully discovering", 5, "no_persuasive_language"]]],
  [6, "Conversation", "When presenting your offer, what do you focus on most?", [["The buyer's desired outcome and decision criteria", 0, null], ["A mix of outcomes, features, and benefits", 2, "no_usp_features_only"], ["The features, deliverables, and price", 5, "no_usp_features_only"]]],
  [7, "Follow-up", "Do you have a defined follow-up system for every open opportunity?", [["Yes—timed, tracked, and used consistently", 0, null], ["Partly—I use reminders but the cadence varies", 2, "no_follow_up_system"], ["No—I follow up when I remember or have time", 5, "no_follow_up_system"]]],
  [8, "Follow-up", "How often do qualified opportunities go quiet without a clear next step?", [["Rarely—next steps are agreed before every call ends", 0, null], ["Sometimes, especially on longer decisions", 1, "no_follow_up_system"], ["Often—ghosting is a major source of lost sales", 4, "no_follow_up_system"]]],
  [9, "Referrals", "Does your business have a repeatable way to generate referrals?", [["Yes—referrals are requested and tracked systematically", 0, null], ["Somewhat—I ask when the moment feels right", 2, "no_referral_system"], ["No—referrals happen by chance", 5, "no_referral_system"]]],
  [10, "Referrals", "How comfortable are you making a specific referral ask?", [["Very—I use a natural, specific script", 0, null], ["Mostly, though my ask could be clearer", 1, "no_referral_system"], ["Uncomfortable—I avoid asking directly", 4, "no_referral_system"]]],
  [11, "Objections", "Do you use a consistent framework to work through buyer objections?", [["Yes—I diagnose the concern before responding", 0, null], ["Usually, but difficult objections can throw me", 2, "no_objection_handling"], ["No—I respond differently each time", 5, "no_objection_handling"]]],
  [12, "Objections", "How regularly do you review and practice objection handling?", [["Weekly or after every meaningful sales call", 0, null], ["Occasionally, when a new objection appears", 1, "no_objection_handling"], ["Almost never", 4, "no_objection_handling"]]],
  [13, "Growth", "Could your current sales process support twice as many opportunities?", [["Yes—the process and tools are ready to scale", 0, null], ["Possibly, but some steps still depend on me", 2, "scaling_strategy"], ["No—more leads would overwhelm the process", 5, "scaling_strategy"]]],
  [14, "Growth", "How clearly do you track the numbers that drive sales growth?", [["I review conversion, velocity, and pipeline weekly", 0, null], ["I track revenue and a few pipeline measures", 1, "scaling_strategy"], ["I mostly judge progress by feel or bank balance", 4, "scaling_strategy"]]],
  [15, "Confidence", "How confident are you guiding a buyer to a clear decision without pressure?", [["Very confident—I can challenge and guide with empathy", 0, null], ["Fairly confident, but I sometimes soften the close", 2, "no_persuasive_language"], ["Not confident—I either push too hard or avoid the ask", 5, "no_persuasive_language"]]],
];

for (const [sortOrder, category, text, options] of catalog) {
  const { data: existing, error: lookupError } = await supabase.from("questions").select("id").eq("sort_order", sortOrder).eq("category", category).maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) continue;
  const { data: question, error: questionError } = await supabase.from("questions").insert({ text, category, sort_order: sortOrder }).select("id").single();
  if (questionError) throw questionError;
  const rows = options.map(([optionText, weight, gapFlag]) => ({ question_id: question.id, text: optionText, weight, gap_flag: gapFlag }));
  const { error: optionError } = await supabase.from("answer_options").insert(rows);
  if (optionError) throw optionError;
}

const { count, error } = await supabase.from("questions").select("*", { count: "exact", head: true });
if (error) throw error;
console.log(`Assessment catalog ready: ${count} questions.`);
