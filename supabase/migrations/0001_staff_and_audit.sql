-- 0001_staff_and_audit.sql
-- Staff, roles and the audit trail.
--
-- These tables are shared with the LINE CRM (CLAUDE.md §8): staff log in once
-- at admin.ruedeejewelry.com and see both the customer menu and the product
-- menu. If the CRM project already owns `staff` and `audit_log`, skip this file
-- and point this app at the same database instead of creating a second set.

create extension if not exists "pgcrypto";

create table if not exists staff (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text        not null,
  role        text        not null default 'staff' check (role in ('owner', 'staff')),
  active      boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table staff is
  'Shop staff. Shared with the CRM — one login, both menus.';

create table if not exists audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references staff (id),
  action      text        not null,
  table_name  text        not null,
  record_id   uuid,
  before      jsonb,
  after       jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists audit_log_record_idx
  on audit_log (table_name, record_id, created_at desc);

-- Helpers used by every policy below.
create or replace function is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from staff
    where staff.id = auth.uid() and staff.active
  );
$$;

create or replace function is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from staff
    where staff.id = auth.uid() and staff.active and staff.role = 'owner'
  );
$$;

alter table staff     enable row level security;
alter table audit_log enable row level security;

create policy staff_self_read on staff
  for select using (id = auth.uid() or is_owner());

create policy staff_owner_write on staff
  for all using (is_owner()) with check (is_owner());

-- Audit rows are written by the service role from server actions and read by
-- owners only. Nobody may edit or delete them.
create policy audit_owner_read on audit_log
  for select using (is_owner());
