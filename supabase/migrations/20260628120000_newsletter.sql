-- Newsletter subscribers and campaigns
--
-- The public footer form collects email addresses into `newsletter_subscribers`
-- via a SECURITY DEFINER RPC (mirrors `submit_enquiry`) so the table itself is
-- never publicly readable or writable. Staff manage the list and broadcast
-- `newsletter_campaigns` (new destinations, articles, offers) from the portal.
--
-- Sending happens server-side through Resend; this schema only stores the list,
-- the campaign content, and per-send counters.

-- ---------------------------------------------------------------------------
-- Subscribers
-- ---------------------------------------------------------------------------
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  locale text not null default 'en',
  -- subscribed: active; unsubscribed: opted out; bounced: hard-failed at send.
  status text not null default 'subscribed' check (status in ('subscribed', 'unsubscribed', 'bounced')),
  -- Where the address came from: 'footer', 'manual', 'import'.
  source text,
  source_path text,
  tags text[] not null default '{}',
  -- Opaque token embedded in the one-click unsubscribe link.
  unsubscribe_token uuid not null default gen_random_uuid(),
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index newsletter_subscribers_status_idx on public.newsletter_subscribers (status);
create unique index newsletter_subscribers_token_idx
  on public.newsletter_subscribers (unsubscribe_token);

-- ---------------------------------------------------------------------------
-- Campaigns
-- ---------------------------------------------------------------------------
create table public.newsletter_campaigns (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  preheader text,
  body_html text,
  status text not null default 'draft' check (status in ('draft', 'sending', 'sent', 'failed')),
  recipient_count integer not null default 0,
  sent_count integer not null default 0,
  sent_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index newsletter_campaigns_status_idx on public.newsletter_campaigns (status);

-- ---------------------------------------------------------------------------
-- RLS — staff only. The public never reads or writes these tables directly;
-- subscription happens through the SECURITY DEFINER RPCs below.
-- ---------------------------------------------------------------------------
alter table public.newsletter_subscribers enable row level security;
alter table public.newsletter_campaigns enable row level security;

create policy "staff read subscribers" on public.newsletter_subscribers
  for select to authenticated
  using (public.staff_has_role(array['owner', 'admin', 'editor', 'viewer']));
create policy "editors manage subscribers" on public.newsletter_subscribers
  for all to authenticated
  using (public.staff_has_role(array['owner', 'admin', 'editor']))
  with check (public.staff_has_role(array['owner', 'admin', 'editor']));

create policy "staff read campaigns" on public.newsletter_campaigns
  for select to authenticated
  using (public.staff_has_role(array['owner', 'admin', 'editor', 'viewer']));
create policy "editors manage campaigns" on public.newsletter_campaigns
  for all to authenticated
  using (public.staff_has_role(array['owner', 'admin', 'editor']))
  with check (public.staff_has_role(array['owner', 'admin', 'editor']));

grant select, insert, update, delete on public.newsletter_subscribers to authenticated, service_role;
grant select, insert, update, delete on public.newsletter_campaigns to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Public subscribe RPC
-- ---------------------------------------------------------------------------
-- Validates the email, then upserts: a brand-new address is inserted as
-- 'subscribed'; an existing 'unsubscribed' row is reactivated. Re-subscribing an
-- already-active address is a no-op. Never leaks whether the address existed.
create or replace function public.subscribe_newsletter(
  p_email text,
  p_name text default null,
  p_locale text default 'en',
  p_source text default 'footer',
  p_source_path text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_email is null or p_email !~ '^[^@]+@[^@]+\.[^@]+$' then
    raise exception 'Valid email is required';
  end if;

  insert into public.newsletter_subscribers (email, name, locale, source, source_path)
  values (
    lower(trim(p_email)),
    nullif(trim(coalesce(p_name, '')), ''),
    coalesce(nullif(trim(p_locale), ''), 'en'),
    coalesce(nullif(trim(p_source), ''), 'footer'),
    p_source_path
  )
  on conflict (email) do update set
    status = 'subscribed',
    name = coalesce(excluded.name, public.newsletter_subscribers.name),
    locale = excluded.locale,
    unsubscribed_at = null,
    updated_at = now();
end;
$$;

revoke all on function public.subscribe_newsletter(text, text, text, text, text) from public;
grant execute on function public.subscribe_newsletter(text, text, text, text, text)
  to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Public unsubscribe RPC
-- ---------------------------------------------------------------------------
-- Flips a subscriber to 'unsubscribed' by their opaque token. Returns true when
-- a matching active subscriber was found (so the page can confirm), false
-- otherwise. Idempotent.
create or replace function public.unsubscribe_newsletter(p_token uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  matched boolean;
begin
  update public.newsletter_subscribers
  set status = 'unsubscribed',
      unsubscribed_at = now(),
      updated_at = now()
  where unsubscribe_token = p_token
    and status <> 'unsubscribed';

  get diagnostics matched = row_count;

  -- A token that exists but is already unsubscribed still counts as success.
  if not matched then
    return exists (
      select 1 from public.newsletter_subscribers where unsubscribe_token = p_token
    );
  end if;

  return true;
end;
$$;

revoke all on function public.unsubscribe_newsletter(uuid) from public;
grant execute on function public.unsubscribe_newsletter(uuid) to anon, authenticated, service_role;
