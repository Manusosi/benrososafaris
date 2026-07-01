-- National park gallery
--
-- Parks need a media gallery like destinations/experiences so the wizard can set
-- a cover image and the public detail page can render a hero. The base table was
-- created without one; add it. Ordered media_assets ids; first is the cover.
alter table public.national_parks
  add column if not exists gallery jsonb not null default '[]'::jsonb;
