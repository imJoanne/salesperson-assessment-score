-- Sprint 5: authenticated lead capture, owner-scoped data, operator access, and audit logs.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  company text,
  phone text,
  role text not null default 'visitor' check (role in ('visitor', 'operator')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, company, phone)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(coalesce(new.email, 'New lead'), '@', 1)),
    nullif(trim(new.raw_user_meta_data ->> 'company'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'phone'), '')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    company = excluded.company,
    phone = excluded.phone,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update of email, raw_user_meta_data on auth.users
  for each row execute procedure public.handle_new_user();

insert into public.profiles (id, email, full_name, company, phone)
select
  id,
  coalesce(email, ''),
  coalesce(nullif(trim(raw_user_meta_data ->> 'full_name'), ''), split_part(coalesce(email, 'Existing lead'), '@', 1)),
  nullif(trim(raw_user_meta_data ->> 'company'), ''),
  nullif(trim(raw_user_meta_data ->> 'phone'), '')
from auth.users
on conflict (id) do nothing;

create or replace function public.is_operator()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'operator'
  );
$$;

revoke all on function public.is_operator() from public;
grant execute on function public.is_operator() to authenticated;

drop policy if exists "profiles_read" on public.profiles;
create policy "profiles_read" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_operator());

-- Only an operator/service-role process may change profile roles or lead details.
drop policy if exists "profiles_operator_update" on public.profiles;
create policy "profiles_operator_update" on public.profiles
  for update to authenticated
  using (public.is_operator())
  with check (public.is_operator());

-- Catalog content remains publicly readable; only operators can change it.
drop policy if exists "products_v1_read" on public.products;
drop policy if exists "products_v1_write" on public.products;
create policy "products_public_read" on public.products for select to anon, authenticated using (true);
create policy "products_operator_insert" on public.products for insert to authenticated with check (public.is_operator());
create policy "products_operator_update" on public.products for update to authenticated using (public.is_operator()) with check (public.is_operator());
create policy "products_operator_delete" on public.products for delete to authenticated using (public.is_operator());

drop policy if exists "questions_v1_read" on public.questions;
drop policy if exists "questions_v1_write" on public.questions;
create policy "questions_public_read" on public.questions for select to anon, authenticated using (true);
create policy "questions_operator_write" on public.questions for all to authenticated using (public.is_operator()) with check (public.is_operator());

drop policy if exists "answer_options_v1_read" on public.answer_options;
drop policy if exists "answer_options_v1_write" on public.answer_options;
create policy "answer_options_public_read" on public.answer_options for select to anon, authenticated using (true);
create policy "answer_options_operator_write" on public.answer_options for all to authenticated using (public.is_operator()) with check (public.is_operator());

alter table public.assessment_responses alter column user_id set default auth.uid();
alter table public.purchases alter column user_id set default auth.uid();
alter table public.ratings alter column user_id set default auth.uid();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'assessment_responses_user_id_fkey') then
    alter table public.assessment_responses add constraint assessment_responses_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'purchases_user_id_fkey') then
    alter table public.purchases add constraint purchases_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ratings_user_id_fkey') then
    alter table public.ratings add constraint ratings_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade;
  end if;
end $$;

drop policy if exists "assessment_responses_v1_read" on public.assessment_responses;
drop policy if exists "assessment_responses_v1_write" on public.assessment_responses;
create policy "responses_owner_or_operator_read" on public.assessment_responses for select to authenticated
  using (user_id = auth.uid() or public.is_operator());
create policy "responses_owner_insert" on public.assessment_responses for insert to authenticated
  with check (user_id = auth.uid());
create policy "responses_owner_delete" on public.assessment_responses for delete to authenticated
  using (user_id = auth.uid() or public.is_operator());

drop policy if exists "purchases_v1_read" on public.purchases;
drop policy if exists "purchases_v1_write" on public.purchases;
create policy "purchases_owner_or_operator_read" on public.purchases for select to authenticated
  using (user_id = auth.uid() or public.is_operator());
create policy "purchases_owner_insert" on public.purchases for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.assessment_responses response
      where response.id = assessment_response_id and response.user_id = auth.uid()
    )
  );

drop policy if exists "ratings_v1_read" on public.ratings;
drop policy if exists "ratings_v1_write" on public.ratings;
create policy "ratings_owner_or_operator_read" on public.ratings for select to authenticated
  using (user_id = auth.uid() or public.is_operator());
create policy "ratings_owner_insert" on public.ratings for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.assessment_responses response
      where response.id = assessment_response_id and response.user_id = auth.uid()
    )
  );

create table if not exists public.audit_logs (
  id bigint generated by default as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_table text not null,
  target_id uuid not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.audit_logs enable row level security;
create policy "audit_operator_read" on public.audit_logs for select to authenticated using (public.is_operator());

create or replace function public.log_meaningful_action()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.audit_logs (actor_id, action, target_table, target_id, metadata)
  values (
    new.user_id,
    'created',
    tg_table_name,
    new.id,
    case
      when tg_table_name = 'purchases' then jsonb_build_object('assessment_response_id', new.assessment_response_id, 'amount_cents', new.amount_cents)
      when tg_table_name = 'ratings' then jsonb_build_object('assessment_response_id', new.assessment_response_id, 'score', new.score)
      else '{}'::jsonb
    end
  );
  return new;
end;
$$;

drop trigger if exists audit_purchase_created on public.purchases;
create trigger audit_purchase_created after insert on public.purchases
  for each row execute procedure public.log_meaningful_action();
drop trigger if exists audit_rating_created on public.ratings;
create trigger audit_rating_created after insert on public.ratings
  for each row execute procedure public.log_meaningful_action();

