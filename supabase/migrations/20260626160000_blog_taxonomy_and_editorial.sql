-- Blog taxonomy (categories + tags) and WordPress-style editorial fields.
--
-- 1. Adds `blog_categories` and `blog_tags` taxonomy tables plus the
--    `blog_post_categories` / `blog_post_tags` join tables, mirroring the
--    content-relations join-table pattern.
-- 2. Adds editorial columns to `blog_posts`: soft-delete (`deleted_at`), a
--    `featured` flag, and a `primary_category_id` (the main category shown on
--    cards and in the admin table). The status check is widened to allow the
--    WordPress-style 'trash' status set on soft delete (mirrors destinations
--    and experiences).
-- 3. Adds SEO + featured-image columns to `blog_translations`: `focus_keyword`,
--    `keywords`, and `featured_image_caption`. The existing `og_image_id`
--    doubles as the featured image (no separate column needed).

-- ---------------------------------------------------------------------------
-- Taxonomy tables
-- ---------------------------------------------------------------------------
create table public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.blog_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.blog_post_categories (
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  category_id uuid not null references public.blog_categories(id) on delete cascade,
  primary key (post_id, category_id)
);

create table public.blog_post_tags (
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  tag_id uuid not null references public.blog_tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

create index blog_post_categories_category_id_idx on public.blog_post_categories (category_id);
create index blog_post_tags_tag_id_idx on public.blog_post_tags (tag_id);

-- ---------------------------------------------------------------------------
-- blog_posts editorial columns
-- ---------------------------------------------------------------------------
-- deleted_at: a non-null value marks the post as trashed (soft delete).
-- featured: surfaces the article in prominent slots.
-- primary_category_id: the main category shown on cards and the admin table.
alter table public.blog_posts
  add column if not exists deleted_at timestamptz,
  add column if not exists featured boolean not null default false,
  add column if not exists primary_category_id uuid references public.blog_categories(id) on delete set null;

create index if not exists blog_posts_deleted_at_idx on public.blog_posts (deleted_at);
create index if not exists blog_posts_primary_category_id_idx on public.blog_posts (primary_category_id);

-- Widen the status check so soft delete can set status = 'trash'.
alter table public.blog_posts drop constraint if exists blog_posts_status_check;
alter table public.blog_posts
  add constraint blog_posts_status_check
  check (status in ('draft', 'published', 'archived', 'trash'));

-- ---------------------------------------------------------------------------
-- blog_translations SEO + featured-image columns
-- ---------------------------------------------------------------------------
-- focus_keyword: the primary phrase the page should rank for.
-- keywords: up to 5 supporting phrases (array, stored as jsonb).
-- featured_image_caption: optional caption shown under the featured image.
alter table public.blog_translations
  add column if not exists focus_keyword text,
  add column if not exists keywords jsonb not null default '[]'::jsonb,
  add column if not exists featured_image_caption text;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.blog_categories enable row level security;
alter table public.blog_tags enable row level security;
alter table public.blog_post_categories enable row level security;
alter table public.blog_post_tags enable row level security;

-- Taxonomy names/slugs are public (needed for filter chips and labels).
create policy "public read blog categories" on public.blog_categories
  for select to anon, authenticated
  using (true);
create policy "public read blog tags" on public.blog_tags
  for select to anon, authenticated
  using (true);

-- Join rows are public only while their owning post is published.
create policy "public read blog post categories of published posts" on public.blog_post_categories
  for select to anon, authenticated
  using (exists (select 1 from public.blog_posts p where p.id = post_id and p.status = 'published'));
create policy "public read blog post tags of published posts" on public.blog_post_tags
  for select to anon, authenticated
  using (exists (select 1 from public.blog_posts p where p.id = post_id and p.status = 'published'));

-- Staff read (all active roles).
create policy "staff read blog categories" on public.blog_categories
  for select to authenticated using (public.staff_has_role(array['owner', 'admin', 'editor', 'viewer']));
create policy "staff read blog tags" on public.blog_tags
  for select to authenticated using (public.staff_has_role(array['owner', 'admin', 'editor', 'viewer']));
create policy "staff read blog post categories" on public.blog_post_categories
  for select to authenticated using (public.staff_has_role(array['owner', 'admin', 'editor', 'viewer']));
create policy "staff read blog post tags" on public.blog_post_tags
  for select to authenticated using (public.staff_has_role(array['owner', 'admin', 'editor', 'viewer']));

-- Editor / super-admin write.
create policy "editors manage blog categories" on public.blog_categories
  for all to authenticated
  using (public.staff_has_role(array['owner', 'admin', 'editor']))
  with check (public.staff_has_role(array['owner', 'admin', 'editor']));
create policy "editors manage blog tags" on public.blog_tags
  for all to authenticated
  using (public.staff_has_role(array['owner', 'admin', 'editor']))
  with check (public.staff_has_role(array['owner', 'admin', 'editor']));
create policy "editors manage blog post categories" on public.blog_post_categories
  for all to authenticated
  using (public.staff_has_role(array['owner', 'admin', 'editor']))
  with check (public.staff_has_role(array['owner', 'admin', 'editor']));
create policy "editors manage blog post tags" on public.blog_post_tags
  for all to authenticated
  using (public.staff_has_role(array['owner', 'admin', 'editor']))
  with check (public.staff_has_role(array['owner', 'admin', 'editor']));

-- ---------------------------------------------------------------------------
-- Data API grants (RLS above still governs row visibility).
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on public.blog_categories to authenticated;
grant select, insert, update, delete on public.blog_tags to authenticated;
grant select, insert, update, delete on public.blog_post_categories to authenticated;
grant select, insert, update, delete on public.blog_post_tags to authenticated;
grant select on public.blog_categories to anon;
grant select on public.blog_tags to anon;
grant select on public.blog_post_categories to anon;
grant select on public.blog_post_tags to anon;
