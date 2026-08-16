# PRD

## Problem
Sales closers/affiliates waste hours on manual interview calls to qualify leads. A self-serve assessment converts curious salespeople into scored leads with gap reports and product recommendations — replacing the interview.

## Target User
- **Primary:** Salespeople who want to improve their results (take the assessment).
- **Operator:** Closer/affiliate who generates leads and earns from product sales via the app.

## Core Objects
- **Assessment** — set of questions, each mapped to gaps.
- **AssessmentResponse** — one user's answers.
- **GapReport** — computed lead type + specific gaps + prescribed product(s).
- **Product** — purchasable solution (6 products, 5 active in v1).
- **Purchase** — record of a product bought through the app.
- **Rating** — helpfulness score + optional referral.

## MVP (v1)
- [ ] Assessment flow (Q&A) renders without login
- [ ] Scoring engine assigns lead type from answers
- [ ] Gap report shows type, gaps, matched products
- [ ] Purchase action records a product buy
- [ ] Exit: helpfulness rating + referral prompt
- [ ] Operator dashboard: reports count, lead type distribution, purchases
- [ ] Seed data so app looks alive on first load

## Non-goals (v1)
- Login/auth wall
- "Sales Coach in Your Pocket" app
- Lead export/CRM sync
- A/B testing of questions
- Email capture sequences beyond referral prompt

## Success Criteria
An anonymous visitor lands, completes the 15-question assessment, sees a gap report classifying them as "Good" with 7 listed gaps and 2 recommended products, buys one, rates helpfulness 4/5, and the operator dashboard increments reports + purchases — all without any login.