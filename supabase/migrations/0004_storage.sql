-- 0004_storage.sql
-- Storage buckets for jewellery photos, certificates and article images.
--
-- Buckets stay private; the site serves signed URLs (CLAUDE.md §9). Never flip
-- `public` to true — certificate scans carry lab numbers.

insert into storage.buckets (id, name, public)
values
  ('product-photos', 'product-photos', false),
  ('certificates',   'certificates',   false),
  ('article-images', 'article-images', false)
on conflict (id) do nothing;

-- Only signed-in staff may put files in or take them out directly; customers
-- reach photos through signed URLs minted server-side.
create policy "staff read storage"
  on storage.objects for select
  using (
    bucket_id in ('product-photos', 'certificates', 'article-images')
    and is_staff()
  );

create policy "staff write storage"
  on storage.objects for insert
  with check (
    bucket_id in ('product-photos', 'certificates', 'article-images')
    and is_staff()
  );

create policy "staff update storage"
  on storage.objects for update
  using (
    bucket_id in ('product-photos', 'certificates', 'article-images')
    and is_staff()
  );

create policy "owner delete storage"
  on storage.objects for delete
  using (
    bucket_id in ('product-photos', 'certificates', 'article-images')
    and is_owner()
  );
