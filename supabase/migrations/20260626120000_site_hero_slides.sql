-- Homepage hero media, managed from Portal > Settings.
-- Stored as a JSON array on the site_settings singleton. Each entry:
--   { "mediaType": "image" | "video", "mediaUrl": "...", "posterUrl": "...",
--     "alt": "...", "heading": "...", "subheading": "...", "isActive": true,
--     "sortOrder": 0 }
-- Public read and super-admin write are already covered by existing
-- site_settings RLS policies.

alter table public.site_settings
  add column if not exists hero_slides jsonb not null default '[]'::jsonb;
