-- SEO keyword columns for tour and package translations (match destinations/experiences).

alter table public.tour_translations
  add column if not exists focus_keyword text,
  add column if not exists keywords jsonb not null default '[]'::jsonb;

alter table public.package_translations
  add column if not exists focus_keyword text,
  add column if not exists keywords jsonb not null default '[]'::jsonb;
