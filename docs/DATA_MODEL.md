# Data Model

## products
| Field | Type |
|---|---|
| id | uuid pk |
| name | text |
| slug | text unique |
| description | text |
| price_cents | int |
| is_active | bool default true |
| sort_order | int |
| user_id | uuid nullable |
| created_at | timestamptz |

## questions
| Field | Type |
|---|---|
| id | uuid pk |
| text | text |
| category | text |
| sort_order | int |
| user_id | uuid nullable |
| created_at | timestamptz |

## answer_options
| Field | Type |
|---|---|
| id | uuid pk |
| question_id | uuid fk → questions |
| text | text |
| weight | numeric |
| gap_flag | text nullable |
| user_id | uuid nullable |
| created_at | timestamptz |

## assessment_responses
| Field | Type |
|---|---|
| id | uuid pk |
| user_id | uuid nullable |
| answers | jsonb |
| total_score | numeric |
| lead_type | text |
| gap_flags | text[] |
| ai_narrative | text nullable |
| ai_source | text nullable |
| ai_confidence | numeric nullable |
| ai_review_status | text default 'unreviewed' |
| created_at | timestamptz |

- **answers** JSONB: `[{question_id, answer_option_id, gap_flag}]`
- **lead_type**: one of `great|good|average|struggling`

## purchases
| Field | Type |
|---|---|
| id | uuid pk |
| assessment_response_id | uuid fk → assessment_responses |
| product_id | uuid fk → products |
| amount_cents | int |
| user_id | uuid nullable |
| created_at | timestamptz |

## ratings
| Field | Type |
|---|---|
| id | uuid pk |
| assessment_response_id | uuid fk → assessment_responses |
| score | int (1-5) |
| referral_email | text nullable |
| user_id | uuid nullable |
| created_at | timestamptz |

## Relationships
- questions 1→N answer_options
- assessment_responses 1→N purchases
- assessment_responses 1→1 ratings (optional)

## profiles
One row per Supabase Auth user with `full_name`, `email`, optional `company` and `phone`, and `role` (`visitor|operator`). An Auth trigger populates it from signup metadata.

## RLS
Questions, answer options, and products are publicly readable. Profiles, assessment responses, purchases, and ratings are owner-scoped with `auth.uid() = user_id`; operators can read all lead activity and manage catalog content. Legacy demo rows may retain a null `user_id` and are visible only to operators.

`audit_logs` records purchase and rating creation through database triggers.

## AI Fields
`assessment_responses.ai_narrative` stores AI-generated gap summary text with `ai_source`, `ai_confidence`, `ai_review_status` per convention. All nullable in v1 (rule-based path works without them).
