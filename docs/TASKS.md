# Tasks

## Sprint 1 — Core Data + Assessment Engine
**Goal:** Authenticated visitor completes the assessment, which scores and stores an owner-scoped response.
- [ ] Create Supabase tables (migration SQL)
- [ ] Seed 5 products, 15 questions, ~45 answer options with weights + gap flags
- [ ] Build `lib/data/` for all table CRUD
- [ ] Build assessment page: render questions, collect answers, submit
- [ ] Build scoring engine (`lib/scoring/`): sum weights → lead type + gap flags
- [ ] Persist assessment_response with answers, total_score, lead_type, gap_flags
- **DoD:** Visitor creates an account, completes assessment → response row exists with their user_id, correct lead_type, and gap_flags.

## Sprint 2 — Gap Report + Product Match + Purchase
**Goal:** Owner-only report renders, products match, and purchase logs.
- [ ] Build gap report page `/reports/[id]`: lead type label, gap list, matched products ranked
- [ ] Build product matching logic from gap_flags → product slugs
- [ ] Add buy buttons → insert purchase record → confirmation state
- [ ] Handle loading/empty/error states on report page
- **DoD:** Visitor sees report with correct type, gaps, ≥1 product, clicks Buy → purchase row created.

## Sprint 3 — Rating + Referral + Operator Dashboard
**Goal:** Exit flow + aggregate metrics visible.
- [ ] Build exit page: 1-5 rating + optional referral email → insert rating row
- [ ] Build operator dashboard: total reports, lead type distribution chart, purchases by product
- [ ] Dashboard reads aggregate counts from DB (not localStorage)
- [ ] Handle empty dashboard (no responses yet) state
- **DoD:** After purchase, visitor rates 4/5 → rating row exists; dashboard shows correct counts.

## Sprint 4 — Polish + Five States + Empty/Error Handling
**Goal:** Every screen handles loading, empty, error, partial, ready.
- [ ] Assessment: loading skeleton, error if fetch fails, retry
- [ ] Report: error if invalid ID, empty if no products matched
- [ ] Dashboard: empty state with CTA, loading skeleton
- [ ] Mobile responsive: sidebar → hamburger
- [ ] Test all flows manually
- **DoD:** Every screen tested in all 5 states; no dead buttons; UI copy clear.

## Sprint 5 — Authenticated Lead Capture + RLS
- [x] Add Supabase email/password signup/login and capture lead profile details
- [x] Replace permissive RLS with owner-scoped access on responses, purchases, ratings
- [x] Keep products + questions public read
- [x] Gate operator dashboard and catalog management behind auth + role
- [x] Add audit log table + populate on purchase/rating
- **DoD:** Logged-out visitor sees the landing page but must log in to assess; a visitor sees only their records; an operator sees the lead dashboard.

## v1 Functional Milestone: End of Sprint 3
Success scenario fully usable: land → signup/login → assess → report → buy → rate → operator dashboard reflects an identifiable lead.

## Gantt
```
S1: Data + Assessment Engine     ████████
S2: Report + Purchase            ████████
S3: Rating + Dashboard           ████████  ← v1 functional
S4: Polish + States              ████████
S5: Auth + Lock Down             ████████
```
