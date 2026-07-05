-- Seed national parks from published destinations in Tanzania, Uganda, Rwanda,
-- and South Africa. Idempotent: skips slugs that already exist in
-- national_park_translations (en). No tour link seeding.

with candidate_destinations as (
  select
    d.id as destination_id,
    d.country,
    d.region,
    dt.slug,
    dt.name,
    dt.summary,
    d.best_time,
    d.wildlife,
    row_number() over (
      partition by d.country
      order by dt.name
    ) as country_position
  from public.destinations d
  join public.destination_translations dt
    on dt.destination_id = d.id
   and dt.locale = 'en'
   and dt.published_at is not null
  where d.status = 'published'
    and d.country in ('Tanzania', 'Uganda', 'Rwanda', 'South Africa')
    and not exists (
      select 1
      from public.national_park_translations existing
      where existing.locale = 'en'
        and existing.slug = dt.slug
    )
),
park_rows as (
  insert into public.national_parks (
    destination_id,
    country,
    region,
    status,
    park_size_km2,
    established_year,
    best_time,
    wildlife,
    activities,
    position
  )
  select
    c.destination_id,
    c.country,
    c.region,
    'published',
    null::numeric,
    null::integer,
    case
      when coalesce(c.best_time ->> 'summary', '') <> '' then c.best_time
      else jsonb_build_object(
        'summary',
        'Year-round travel is possible; contact Benroso Safaris for seasonal tips and availability.'
      )
    end,
    case
      when jsonb_typeof(c.wildlife) = 'array'
       and jsonb_array_length(c.wildlife) > 0 then c.wildlife
      else to_jsonb(array['Wildlife viewing', 'Scenic landscapes']::text[])
    end,
    to_jsonb(
      array['Game drives', 'Guided safaris', 'Photography']::text[]
    ),
    100 + c.country_position
  from candidate_destinations c
  returning id, destination_id, country, region
),
translation_rows as (
  insert into public.national_park_translations (
    park_id,
    locale,
    slug,
    name,
    summary,
    published_at
  )
  select
    p.id,
    'en',
    dt.slug,
    dt.name,
    coalesce(
      dt.summary,
      'Explore ' || dt.name || ' with Benroso Safaris - wildlife seasons, routes, and tailored safari options.'
    ),
    now()
  from park_rows p
  join public.destinations d on d.id = p.destination_id
  join public.destination_translations dt
    on dt.destination_id = d.id
   and dt.locale = 'en'
   and dt.published_at is not null
  returning park_id
)
select
  p.country,
  count(*)::int as parks_seeded
from park_rows p
join translation_rows t on t.park_id = p.id
group by p.country
order by p.country;