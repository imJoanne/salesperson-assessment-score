# Security

## Secret Handling
- Supabase service key never in frontend. Only anon key in client.
- Server actions / route handlers use service key server-side only.
- `.env.local` for dev; Vercel env vars for prod. Never commit secrets.

## Permission Model
- **Visitor:** Signup/login is required before assessment submission. Visitors see only their own profile, responses, purchases, and ratings.
- **Public:** Products, questions, and answer options remain readable so the landing experience loads before auth; writes require the operator role.
- **Operator:** Dashboard and product management require authentication plus `profiles.role = 'operator'`. Operators may read all captured leads and activity.
- Purchase and rating inserts create immutable audit-log entries through database triggers.

## Operator bootstrap
After the owner creates their app account, promote it once from the Supabase SQL editor:
```sql
update public.profiles set role = 'operator' where email = 'owner@example.com';
```
Thereafter, only an existing operator or the Supabase service role can grant operator access.

## Approved-Tools Rule
No raw `run_any` / `send_any` calls. Only named functions in `lib/data/` for DB access, named AI tools in `lib/ai/` for intelligence. Agent (when added) inherits calling user's permissions.

## Audit Principle
Every meaningful action (purchase, rating, future AI action) writes a row with actor, action, target, and timestamp. Purchase and rating audit rows are populated by database triggers.
