-- products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  slug text unique not null,
  description text,
  price_cents int not null default 0,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table products enable row level security;
drop policy if exists "products_v1_read" on products;
create policy "products_v1_read" on products for select using (true);
drop policy if exists "products_v1_write" on products;
create policy "products_v1_write" on products for all using (true) with check (true);

insert into products (name, slug, description, price_cents, is_active, sort_order) values
('4-Week Fast Track Intensive Coaching', '4-week-fast-track', 'Intensive 4-week coaching to build your sales system on human buying psychology.', 4900, true, 1),
('4-Week Fast Track + 11-Month Inner Circle Coaching', '4-week-fast-track-inner-circle', 'Fast Track plus 11 months of Inner Circle ongoing coaching and support.', 9900, true, 2),
('6-Week Persuasive Conversation Masterclass', 'persuasive-conversation-masterclass', 'Master persuasive language patterns and hidden needs in 6 weeks.', 2900, true, 3),
('Ready Set Close Master Sales System [DIY]', 'ready-set-close-master-sales-system', 'Complete DIY master sales system built on decision science.', 1900, true, 4),
('Get Leads and Close Sales [DIY]', 'get-leads-and-close-sales', 'DIY system for lead generation and closing without a coach.', 1200, true, 5)
on conflict (slug) do nothing;

-- questions
create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  text text not null,
  category text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table questions enable row level security;
drop policy if exists "questions_v1_read" on questions;
create policy "questions_v1_read" on questions for select using (true);
drop policy if exists "questions_v1_write" on questions;
create policy "questions_v1_write" on questions for all using (true) with check (true);

-- answer_options
create table if not exists answer_options (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  question_id uuid not null,
  text text not null,
  weight numeric not null default 0,
  gap_flag text,
  created_at timestamptz not null default now()
);
alter table answer_options enable row level security;
drop policy if exists "answer_options_v1_read" on answer_options;
create policy "answer_options_v1_read" on answer_options for select using (true);
drop policy if exists "answer_options_v1_write" on answer_options;
create policy "answer_options_v1_write" on answer_options for all using (true) with check (true);

-- Seed 3 demo questions (full 15 added at build time; 3 here for SQL brevity)
insert into questions (text, category, sort_order) values
('Do you have a documented sales process you follow on every call?', 'Sales System', 1),
('Is your sales process built on understanding human buying psychology and decision science?', 'Sales System', 2),
('What is your current lead-to-close conversion rate?', 'Conversion', 3);

-- Answer options for Q1
insert into answer_options (question_id, text, weight, gap_flag)
select id, 'Yes, fully documented and psychology-based', 0, null from questions where sort_order = 1 and category = 'Sales System'
union all
select id, 'Yes, documented but not based on psychology', 2, 'no_psychology_basis' from questions where sort_order = 1 and category = 'Sales System'
union all
select id, 'Partially, I wing it based on experience', 4, 'no_documented_process' from questions where sort_order = 1 and category = 'Sales System'
union all
select id, 'No, I just talk to people', 6, 'no_sales_system' from questions where sort_order = 1 and category = 'Sales System';

-- Answer options for Q2
insert into answer_options (question_id, text, weight, gap_flag)
select id, 'Yes, fully grounded in decision science', 0, null from questions where sort_order = 2 and category = 'Sales System'
union all
select id, 'Somewhat, I use some principles', 3, 'no_psychology_basis' from questions where sort_order = 2 and category = 'Sales System'
union all
select id, 'No, I rely on instinct and charm', 5, 'no_psychology_basis' from questions where sort_order = 2 and category = 'Sales System';

-- Answer options for Q3
insert into answer_options (question_id, text, weight, gap_flag)
select id, 'Above 10%', 0, null from questions where sort_order = 3 and category = 'Conversion'
union all
select id, '5-10%', 2, null from questions where sort_order = 3 and category = 'Conversion'
union all
select id, '1-5%', 5, 'conversion_below_5' from questions where sort_order = 3 and category = 'Conversion'
union all
select id, 'Below 1% or unknown', 7, 'conversion_below_5' from questions where sort_order = 3 and category = 'Conversion';

-- assessment_responses
create table if not exists assessment_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  answers jsonb not null default '[]'::jsonb,
  total_score numeric not null default 0,
  lead_type text not null default 'struggling',
  gap_flags text[] not null default '{}',
  ai_narrative text,
  ai_source text,
  ai_confidence numeric,
  ai_review_status text not null default 'unreviewed',
  created_at timestamptz not null default now()
);
alter table assessment_responses enable row level security;
drop policy if exists "assessment_responses_v1_read" on assessment_responses;
create policy "assessment_responses_v1_read" on assessment_responses for select using (true);
drop policy if exists "assessment_responses_v1_write" on assessment_responses;
create policy "assessment_responses_v1_write" on assessment_responses for all using (true) with check (true);

-- Seed 3 demo responses
insert into assessment_responses (answers, total_score, lead_type, gap_flags) values
('[{"question_id":"demo","answer_option_id":"demo","gap_flag":"no_follow_up_system","weight":4}]', 28, 'good', '{no_follow_up_system,no_usp_features_only,no_referral_system}'),
('[{"question_id":"demo","answer_option_id":"demo","gap_flag":"conversion_below_5","weight":7}]', 52, 'struggling', '{no_sales_system,conversion_below_5,no_objection_handling,no_follow_up_system}'),
('[{"question_id":"demo","answer_option_id":"demo","gap_flag":null,"weight":0}]', 8, 'great', '{}');

-- purchases
create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  assessment_response_id uuid not null,
  product_id uuid not null,
  amount_cents int not null default 0,
  created_at timestamptz not null default now()
);
alter table purchases enable row level security;
drop policy if exists "purchases_v1_read" on purchases;
create policy "purchases_v1_read" on purchases for select using (true);
drop policy if exists "purchases_v1_write" on purchases;
create policy "purchases_v1_write" on purchases for all using (true) with check (true);

-- Seed 3 demo purchases
insert into purchases (assessment_response_id, product_id, amount_cents)
select ar.id, p.id, p.price_cents from assessment_responses ar, products p
where ar.lead_type = 'good' and p.slug = 'get-leads-and-close-sales' limit 1;

insert into purchases (assessment_response_id, product_id, amount_cents)
select ar.id, p.id, p.price_cents from assessment_responses ar, products p
where ar.lead_type = 'struggling' and p.slug = '4-week-fast-track' limit 1;

insert into purchases (assessment_response_id, product_id, amount_cents)
select ar.id, p.id, p.price_cents from assessment_responses ar, products p
where ar.lead_type = 'great' and p.slug = '4-week-fast-track-inner-circle' limit 1;

-- ratings
create table if not exists ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  assessment_response_id uuid not null,
  score int not null check (score >= 1 and score <= 5),
  referral_email text,
  created_at timestamptz not null default now()
);
alter table ratings enable row level security;
drop policy if exists "ratings_v1_read" on ratings;
create policy "ratings_v1_read" on ratings for select using (true);
drop policy if exists "ratings_v1_write" on ratings;
create policy "ratings_v1_write" on ratings for all using (true) with check (true);

-- Seed 2 demo ratings
insert into ratings (assessment_response_id, score, referral_email)
select id, 4, 'friend@example.com' from assessment_responses where lead_type = 'good' limit 1;

insert into ratings (assessment_response_id, score)
select id, 5 from assessment_responses where lead_type = 'great' limit 1;