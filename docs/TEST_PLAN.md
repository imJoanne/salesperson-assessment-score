# Test Plan

## v1 Success Scenario
1. Open `/` — see public intro; click Start Assessment and reach signup/login.
2. Create an account with name, email, company, and phone; after authentication, start the assessment and see 15 questions.
3. Answer all (pick options weighted toward "Good" gaps).
4. Submit → redirect to `/reports/[id]`.
5. Verify: lead type = "Good", gap list shows ≥5 gaps, ≥2 products listed.
6. Click Buy on a product → confirmation message appears.
7. See rating prompt → select 4 stars → submit → thank-you screen.
8. Sign in as an operator and open `/dashboard` → reports count incremented, captured lead identity appears, lead type bar shows "Good", purchases count = 1.

## Empty States
- Dashboard with no responses: shows "No assessments yet" + CTA to take assessment.
- Report with no matched products: shows "No recommendations available" + contact link.

## Error States
- Invalid report ID `/reports/abc`: shows "Report not found" + link back to assessment.
- Assessment submit fails (simulated DB error): shows error message + retry button.
- Dashboard load fails: shows retry button.
- Logged-out report/dashboard access redirects to login; visitor access to operator routes redirects to My Reports.
- A second visitor cannot read the first visitor's report, purchase, rating, or profile.

## Loading States
- Assessment page: skeleton placeholders while questions load.
- Report page: spinner while response + products load.
- Dashboard: skeleton charts while aggregates load.

## Data Integrity
- Submit assessment twice → two separate response rows.
- Buy product → purchase row amount_cents matches product price.
- Rate → rating row score 1-5 only (constraint check).
- Delete a product → existing purchases still reference it (soft, not hard delete in v1).
