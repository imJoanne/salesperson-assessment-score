# Security

## Secret Handling
- Supabase service key never in frontend. Only anon key in client.
- Server actions / route handlers use service key server-side only.
- `.env.local` for dev; Vercel env vars for prod. Never commit secrets.

## Permission Model
- **v1 (demo):** Open RLS — all tables readable/writable without auth. Seed data visible to anonymous visitors.
- **Lock-down (later):** Replace permissive policies with `auth.uid() = user_id`. Only owner sees their responses/purchases/ratings. Products and questions remain public read.
- Operator dashboard gated behind `auth` + role check.

## Approved-Tools Rule
No raw `run_any` / `send_any` calls. Only named functions in `lib/data/` for DB access, named AI tools in `lib/ai/` for intelligence. Agent (when added) inherits calling user's permissions.

## Audit Principle
Every meaningful action (purchase, rating, future AI action) writes a row with actor, action, target, timestamp. In v1, purchases and ratings are direct inserts; audit logging added at lock-down.