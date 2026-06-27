-- Accommodation gallery, pricing, availability, and SEO parity with experiences.

alter table public.accommodations
  add column if not exists property_type text,
  add column if not exists gallery jsonb not null default '[]'::jsonb,
  add column if not exists price_per_night numeric,
  add column if not exists availability text check (
    availability is null or availability in ('available', 'on_request', 'limited')
  ),
  add column if not exists updated_at timestamptz not null default now();

alter table public.accommodation_translations
  add column if not exists focus_keyword text,
  add column if not exists keywords jsonb not null default '[]'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();
