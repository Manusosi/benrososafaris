-- Tour gallery
--
-- Tours store an itinerary and pricing but no images. Give them a media gallery
-- like destinations/parks so the wizard can set a cover (also used as the OG
-- image and the card image on the "Safaris to this park" section). Ordered
-- media_assets ids; the first is the cover.
alter table public.tours
  add column if not exists gallery jsonb not null default '[]'::jsonb;
