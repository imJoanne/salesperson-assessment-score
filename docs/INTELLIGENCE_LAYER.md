# Intelligence Layer

## Messy Inputs
Assessment answers are structured (option selection), so no free-text parsing needed in v1. Later: open-ended answers and transcript ingestion.

## Auto-Structure Schema (answers JSONB)
```json
[
  {"question_id": "uuid", "answer_option_id": "uuid", "gap_flag": "no_follow_up_system", "weight": 3},
  {"question_id": "uuid", "answer_option_id": "uuid", "gap_flag": "conversion_below_5", "weight": 4}
]
```

## Scoring Rules (rule-based, v1)
- Sum all answer weights.
- **Struggling:** score ≥ 45 OR any 3+ critical gaps.
- **Average:** score 30–44.
- **Good:** score 15–29.
- **Great:** score < 15 AND no critical gaps.
- `gap_flags[]` = unique flags from selected answer options.
- Critical gaps: `no_sales_system`, `conversion_below_5`, `no_objection_handling`.

## Product Matching
Lookup table maps gap flags → product slugs:
- `no_sales_system` → ready-set-close-master-sales-system, 4-week-fast-track
- `no_persuasive_language` → persuasive-conversation-masterclass, 6-week-persuasive
- `lead_gen_issues` → get-leads-and-close-sales
- `scaling_strategy` → 4-week-fast-track + inner-circle
- Great → 4-week-fast-track (strategy consulting upsell)

## Events to Track
- assessment_started, assessment_completed, report_viewed, product_viewed, purchase_completed, rating_submitted, referral_submitted.

## What Gets Ranked
Products in gap report ranked by match count (number of gap flags they address).

## v1 vs Later
- **v1:** Pure rule-based scoring + deterministic product matching.
- **Later:** AI-generated personalized gap narrative, dynamic question branching, transcript-based assessment, A/B testing.