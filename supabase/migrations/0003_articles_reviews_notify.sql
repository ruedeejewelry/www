-- 0003_articles_reviews_notify.sql
-- Gemstone guide, customer reviews, and new-arrival alerts.

create table if not exists articles (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  title            text        not null,
  excerpt          text,
  -- Shown by Google under the title; the editor warns past 155 characters.
  seo_description  text,
  cover_image_path text,
  cover_alt        text,
  status           text        not null default 'draft'
                     check (status in ('draft','published')),
  published_at     timestamptz,
  created_by       uuid references staff (id),
  updated_by       uuid references staff (id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  deleted_at       timestamptz
);

create table if not exists article_blocks (
  id          uuid primary key default gen_random_uuid(),
  article_id  uuid not null references articles (id) on delete cascade,
  sort_order  int  not null,
  kind        text not null check (kind in ('text','image')),
  text        text,
  image_path  text,
  created_at  timestamptz not null default now()
);

create unique index if not exists article_blocks_order_idx
  on article_blocks (article_id, sort_order);

-- Products shown as cards at the end of an article, so a reader who finishes
-- can act straight away.
create table if not exists article_products (
  article_id uuid not null references articles (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  primary key (article_id, product_id)
);

create table if not exists reviews (
  id            uuid primary key default gen_random_uuid(),
  -- Every review names the piece it is about, so it can link to that page (§).
  sku           text references products (sku) on delete set null,
  customer_name text        not null,
  body          text        not null,
  image_path    text,
  published     boolean     not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists notify_subscriptions (
  id            uuid primary key default gen_random_uuid(),
  -- Whatever the customer left us: a LINE id, a phone number, an email.
  contact       text        not null,
  contact_kind  text        not null default 'line'
                  check (contact_kind in ('line','phone','email')),
  stone_types   text[]      not null default '{}',
  price_bands   text[]      not null default '{}',
  active        boolean     not null default true,
  created_at    timestamptz not null default now()
);

create trigger articles_touch before update on articles
  for each row execute function touch_updated_at();
create trigger reviews_touch before update on reviews
  for each row execute function touch_updated_at();

alter table articles             enable row level security;
alter table article_blocks       enable row level security;
alter table article_products     enable row level security;
alter table reviews              enable row level security;
alter table notify_subscriptions enable row level security;

create policy articles_public_read on articles
  for select using (status = 'published' and deleted_at is null);
create policy articles_staff_all on articles
  for all using (is_staff()) with check (is_staff());

create policy article_blocks_public_read on article_blocks
  for select using (
    exists (
      select 1 from articles a
      where a.id = article_blocks.article_id
        and a.status = 'published'
        and a.deleted_at is null
    )
  );
create policy article_blocks_staff_all on article_blocks
  for all using (is_staff()) with check (is_staff());

create policy article_products_public_read on article_products
  for select using (
    exists (
      select 1 from articles a
      where a.id = article_products.article_id
        and a.status = 'published'
        and a.deleted_at is null
    )
  );
create policy article_products_staff_all on article_products
  for all using (is_staff()) with check (is_staff());

create policy reviews_public_read on reviews
  for select using (published);
create policy reviews_staff_all on reviews
  for all using (is_staff()) with check (is_staff());

-- Sign-ups are written server-side with the service role and read by staff.
-- Nothing about a subscriber is readable by the public.
create policy notify_staff_read on notify_subscriptions
  for select using (is_staff());
