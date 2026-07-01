-- Reviews: homepage / Google + Tripadvisor fields
--
-- The base `public.reviews` table is created in 20260624093000_content_relations.sql.
-- This migration adds the fields the public homepage reviews slider needs and
-- constrains `source` to the supported providers so each card can render the
-- correct Google / Tripadvisor logo. Idempotent so it is safe on the existing DB.

alter table public.reviews
  add column if not exists review_date date,
  add column if not exists avatar_url text,
  add column if not exists source_url text;

-- Constrain source to the supported review providers. Null stays allowed for
-- legacy / tour-linked reviews that predate the provider distinction.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.reviews'::regclass
      and conname = 'reviews_source_check'
  ) then
    alter table public.reviews
      add constraint reviews_source_check
      check (source is null or source in ('google', 'tripadvisor'));
  end if;
end $$;
