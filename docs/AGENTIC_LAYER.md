# Agentic Layer

## v1 Status
No automated actions in v1. All flows are user-driven (visitor clicks, operator reads). Agentic features are later.

## Draftable Actions (later, low risk — auto)
- AI generates personalized gap narrative text for report → stored in `ai_narrative` with source/confidence/review_status. Auto-draft, operator can edit.
- Auto-tag responses with additional gap flags not caught by rules.

## Executable After Approval (later, medium risk)
- Create follow-up task for operator when high-value lead detected.
- Update lead status from "new" to "contacted" after operator review.

## Human-Only Actions (always)
- Delete a response or purchase record.
- Refund a purchase.
- Send outbound email to a lead/referral.
- Change scoring thresholds or product prices.

## Named Tools (later)
- `generate_gap_narrative(response_id)` — low risk, auto.
- `create_followup_task(response_id)` — medium, approval.
- `send_referral_email(email)` — high, approval.
- `process_refund(purchase_id)` — critical, human-only.

## Audit Log Fields (for later)
`id, actor_id, action, target_table, target_id, risk_level, status, created_at`

## v1 vs Later
- v1: none.
- Later: gap narrative AI, follow-up task creation, email automation, refund handling.