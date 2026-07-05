-- Job title and contact details for About page team profiles.

alter table public.team_members
  add column if not exists job_title text not null default '',
  add column if not exists email text,
  add column if not exists phone text;

comment on column public.team_members.job_title is 'Public-facing title, e.g. Chief Executive Officer (CEO)';
comment on column public.team_members.email is 'Optional contact email shown on public profile card';
comment on column public.team_members.phone is 'Optional contact phone shown on public profile card';
