-- Public fleet page gallery: ordered media assets managed from Portal > Our Fleet.

create table public.fleet_gallery_items (
  id uuid primary key default gen_random_uuid(),
  media_id uuid not null references public.media_assets(id) on delete cascade,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  unique (media_id)
);

create index fleet_gallery_items_position_idx on public.fleet_gallery_items (position, created_at);

alter table public.fleet_gallery_items enable row level security;

create policy "public can read fleet gallery items" on public.fleet_gallery_items
  for select to anon, authenticated
  using (true);

create policy "staff read fleet gallery items" on public.fleet_gallery_items
  for select to authenticated
  using (public.staff_has_role(array['owner', 'admin', 'editor', 'viewer']));

create policy "editors manage fleet gallery items" on public.fleet_gallery_items
  for all to authenticated
  using (public.staff_has_role(array['owner', 'admin', 'editor']))
  with check (public.staff_has_role(array['owner', 'admin', 'editor']));

grant select on public.fleet_gallery_items to anon;
grant select, insert, update, delete on public.fleet_gallery_items to authenticated;
