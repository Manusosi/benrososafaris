-- Allow the same media asset to appear more than once in the fleet gallery.

alter table public.fleet_gallery_items
  drop constraint if exists fleet_gallery_items_media_id_key;
