-- About page team profiles: staff, safari guides, and driver-guides.

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  role_type text not null check (role_type in ('staff', 'safari_guide', 'driver')),
  media_id uuid references public.media_assets(id) on delete set null,
  name text not null,
  years_experience integer check (years_experience is null or years_experience >= 0),
  bio text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index team_members_role_position_idx on public.team_members (role_type, position, created_at);
create index team_members_status_idx on public.team_members (status);

alter table public.team_members enable row level security;

create policy "public read published team members" on public.team_members
  for select to anon, authenticated
  using (status = 'published');

create policy "staff read team members" on public.team_members
  for select to authenticated
  using (public.staff_has_role(array['owner', 'admin', 'editor', 'viewer']));

create policy "editors manage team members" on public.team_members
  for all to authenticated
  using (public.staff_has_role(array['owner', 'admin', 'editor']))
  with check (public.staff_has_role(array['owner', 'admin', 'editor']));

grant select on public.team_members to anon;
grant select, insert, update, delete on public.team_members to authenticated;
