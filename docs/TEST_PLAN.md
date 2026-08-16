# Test Plan

## v1 Success Scenario
1. Open `/` — see intro + Start Assessment button. No login required.
2. Click Start → 15 questions render with answer options.
3. Answer all (pick options weighted toward "Good" gaps).
4. Submit → redirect to `/reports/[id]`.
5. Verify: lead type = "Good", gap list shows ≥5 gaps, ≥2 products listed.
6. Click Buy on a product → confirmation message appears.
7. See rating prompt → select 4 stars → submit → thank-you screen.
8. Open `/dashboard` → reports count incremented, lead type bar shows "Good", purchases count = 1.

## Empty States
- Dashboard with no responses: shows "No assessments yet" + CTA to take assessment.
- Report with no matched products: shows "No recommendations available" + contact link.

## Error States
- Invalid report ID `/reports/abc`: shows "Report not found" + link back to assessment.
- Assessment submit fails (simulated DB error): shows error message + retry button.
- Dashboard load fails: shows retry button.

## Loading States
- Assessment page: skeleton placeholders while questions load.
- Report page: spinner while response + products load.
- Dashboard: skeleton charts while aggregates load.

## Data Integrity
- Submit assessment twice → two separate response rows.
- Buy product → purchase row amount_cents matches product price.
- Rate → rating row score 1-5 only (constraint check).
- Delete a product → existing purchases still reference it (soft, not hard delete in v1).