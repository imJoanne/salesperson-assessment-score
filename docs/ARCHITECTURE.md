# Architecture

## Stack
Next.js (App Router) + Supabase (Postgres/RLS) + Vercel.

## Build Now vs Later
- **Now:** Assessment engine, scoring, gap report, purchase logging, rating, email/password auth, lead profiles, per-user RLS, and a role-gated operator dashboard.
- **Later:** Affiliate tracking, email sequences, social login, AI-generated gap narratives.

## Key User Action Flow
1. Visitor opens `/` → sees intro + Start Assessment CTA → creates an account or signs in.
2. Authenticated visitor answers 15 questions across sales-system, language, conversion, follow-up, referral, objection categories.
3. Scoring engine tallies answer weights → maps to gaps → assigns lead type.
4. Gap report renders: type label, gap list, matched products with buy buttons.
5. Visitor clicks Buy → records Purchase → confirmation.
6. Exit screen: rate 1-5 + referral email prompt.
7. Authenticated operator dashboard auto-refreshes counts and captured lead identities.

## Responsive Nav
Persistent left sidebar on desktop (Assessment, Reports, Products, Dashboard); collapses to hamburger on mobile.

## Layer Plan
1. **Data layer** — Supabase tables + data-access module (`lib/data/`).
2. **App logic** — scoring engine, gap mapping, purchase recording (`lib/scoring/`, server actions).
3. **Smart features** — AI-generated gap narratives + product matching refinement (later).

## Why Core Runs Without AI
Scoring is pure rule-based: each answer maps to gap flags with numeric weights. Lead type = threshold of total score. Products matched by lookup table keyed on gap flags. No LLM call required for v1.

## Repo Structure
```
app/
  assessment/        # assessment flow pages
  reports/[id]/      # gap report page
  dashboard/         # operator dashboard
  products/          # product catalog + buy
lib/
  data/              # all DB reads/writes
  scoring/           # scoring engine + gap mapping
  ai/                # (later) AI gap narrative
  utils/
components/          # shared UI
__tests__/           # beside code they test
```

## Module Map
| Module | Responsibility | Data Owned | Build Order |
|---|---|---|---|
| assessment | Render Q&A, collect answers | AssessmentResponse | 1 |
| scoring | Score answers → lead type + gaps | (pure logic) | 2 |
| gap-report | Display report + matched products | GapReport, Product | 3 |
| purchase | Record product purchase | Purchase | 4 |
| rating | Capture helpfulness + referral | Rating | 5 |
| dashboard | Show aggregate metrics | reads all tables | 6 |
