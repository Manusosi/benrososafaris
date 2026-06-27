-- Accommodation map location and WordPress-style soft delete.

alter table public.accommodations
  add column if not exists map_query text,
  add column if not exists deleted_at timestamptz;

create index if not exists accommodations_deleted_at_idx
  on public.accommodations (deleted_at);
