-- 0002_products.sql
-- The storefront catalogue. Column names mirror `purchase_items` in the CRM
-- (CLAUDE.md §6) so recording a sale can copy a product row instead of making
-- staff retype the spec.

create table if not exists series (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text        not null,
  episode_label text,
  blurb         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists products (
  id                uuid primary key default gen_random_uuid(),
  sku               text unique not null,
  name              text        not null,
  category          text        not null
                      check (category in ('ring','earring','bracelet','brooch','pendant')),
  metal_type        text        not null,
  gold_weight_g     numeric(6,2),
  -- Stable key (ruby, sapphire, …); the Thai label lives in lib/site.ts so the
  -- filter URLs stay readable and stable.
  stone_type        text        not null,
  stone_carat       numeric(6,2),
  -- Free-text setting note where a carat number would be misleading,
  -- e.g. "เม็ดเล็กที่ตาและขา".
  stone_carat_note  text,
  stone_color       text,
  stone_origin      text,
  stone_treatment   text,
  cert_lab          text,
  cert_number       text,
  cert_file_path    text,
  ring_size_th      numeric(4,1)
                      check (ring_size_th is null or ring_size_th between 40 and 70),
  price             numeric(12,2) not null check (price >= 0),
  description       text,
  series_slug       text references series (slug) on delete set null,
  series_episode    text,
  series_note       text,
  status            text        not null default 'draft'
                      check (status in ('draft','published')),
  -- Sold pieces stay published: they are proof the shop does real work and the
  -- catalogue of things that can be made again (§4).
  sold_at           timestamptz,
  published_at      timestamptz,
  created_by        uuid references staff (id),
  updated_by        uuid references staff (id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  -- Staff may edit and add but never delete; only the owner clears a row (§9).
  deleted_at        timestamptz
);

create index if not exists products_public_idx
  on products (published_at desc)
  where status = 'published' and deleted_at is null;

create index if not exists products_series_idx on products (series_slug);
create index if not exists products_category_idx on products (category);
create index if not exists products_stone_idx on products (stone_type);

create table if not exists product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references products (id) on delete cascade,
  storage_path  text not null,
  -- Thai description of the actual piece, never a filename (SEO §8).
  alt_th        text,
  sort_order    int  not null default 0,
  width         int,
  height        int,
  blur_data_url text,
  created_at    timestamptz not null default now()
);

create unique index if not exists product_images_order_idx
  on product_images (product_id, sort_order);

create or replace function touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_touch before update on products
  for each row execute function touch_updated_at();
create trigger series_touch before update on series
  for each row execute function touch_updated_at();

alter table series         enable row level security;
alter table products       enable row level security;
alter table product_images enable row level security;

-- Anonymous readers see published, undeleted rows only. Drafts never leak.
create policy products_public_read on products
  for select using (status = 'published' and deleted_at is null);

create policy products_staff_read on products
  for select using (is_staff());

create policy products_staff_insert on products
  for insert with check (is_staff());

create policy products_staff_update on products
  for update using (is_staff()) with check (is_staff());

-- No delete policy for staff: deletion is soft, and only the owner may purge.
create policy products_owner_delete on products
  for delete using (is_owner());

create policy product_images_public_read on product_images
  for select using (
    exists (
      select 1 from products p
      where p.id = product_images.product_id
        and p.status = 'published'
        and p.deleted_at is null
    )
  );

create policy product_images_staff_all on product_images
  for all using (is_staff()) with check (is_staff());

create policy series_public_read on series for select using (true);
create policy series_staff_write on series
  for all using (is_staff()) with check (is_staff());
