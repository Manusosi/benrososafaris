-- Link accommodations to destination hubs for CMS entry + public filters.
-- Matches the planned authoring flow: destination → comfort level → property.

alter table public.accommodations
  add column if not exists destination_id uuid references public.destinations(id) on delete set null;

create index if not exists accommodations_destination_id_idx
  on public.accommodations (destination_id);
