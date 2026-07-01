-- Expand site_settings for the redesigned Site Settings dashboard:
--   branding (logo / favicon / OG image / tagline / theme colour),
--   notification routing, analytics + search-console verification tags,
--   and per-page hero configuration (page_heroes).
-- Table-level RLS on site_settings already covers these new columns
-- (super admins manage, public reads — see 20260623140000 / initial schema).

alter table public.site_settings
  add column if not exists tagline text,
  add column if not exists logo_url text,
  add column if not exists favicon_url text,
  add column if not exists og_default_image_url text,
  add column if not exists theme_color text,
  add column if not exists notify_emails text[] not null default '{}'::text[],
  add column if not exists enquiry_email_enabled boolean not null default true,
  add column if not exists enquiry_whatsapp_enabled boolean not null default false,
  add column if not exists whatsapp_notify_phone text,
  add column if not exists analytics jsonb not null default '{}'::jsonb,
  add column if not exists page_heroes jsonb not null default '{}'::jsonb;

-- Migrate the existing homepage hero (hero_slides) into the per-page structure,
-- but only if that legacy column exists in this database.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'site_settings'
      and column_name = 'hero_slides'
  ) then
    execute $mig$
      update public.site_settings
        set page_heroes = jsonb_set(
          coalesce(page_heroes, '{}'::jsonb),
          '{home}',
          jsonb_build_object('type', 'slider', 'slides', hero_slides)
        )
        where hero_slides is not null
          and hero_slides <> '[]'::jsonb
          and not (page_heroes ? 'home')
    $mig$;
  end if;
end $$;

-- Team roster for the portal: profiles joined with auth.users sign-in metadata.
-- auth.users is not readable under RLS, so this runs as a security-definer
-- function guarded to super admins only.
create or replace function public.get_portal_team()
returns table (
  id uuid,
  full_name text,
  role text,
  status text,
  avatar_url text,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.full_name,
    p.role,
    p.status,
    p.avatar_url,
    u.email,
    p.created_at,
    u.last_sign_in_at
  from public.profiles p
  join auth.users u on u.id = p.id
  where public.staff_has_role(array['owner', 'admin'])
  order by p.created_at asc;
$$;

grant execute on function public.get_portal_team() to authenticated;
