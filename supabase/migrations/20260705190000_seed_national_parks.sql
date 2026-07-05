-- Seed starter national parks so the public listing page can render cards,
-- compare UI, and tour links before CMS authors add more parks manually.

with park_rows as (
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
    d.id,
    v.country,
    v.region,
    'published',
    v.park_size_km2,
    v.established_year,
    jsonb_build_object('summary', v.best_time_summary),
    to_jsonb(v.wildlife),
    to_jsonb(v.activities),
    v.position
  from (
    values
      (
        'amboseli-national-park',
        'Kenya',
        'Southern Kenya',
        392::numeric,
        1974,
        'Dry season (Jun–Oct) for clear Kilimanjaro views and elephant herds.',
        array['Elephants', 'Lions', 'Cheetahs', 'Buffalo'],
        array['Game drives', 'Photography', 'Cultural visits'],
        1
      ),
      (
        'maasai-mara',
        'Kenya',
        'Southwestern Kenya',
        1510::numeric,
        1961,
        'Jul–Oct for the Great Migration river crossings; green season for calving.',
        array['Big Five', 'Wildebeest', 'Cheetahs', 'Hyenas'],
        array['Game drives', 'Hot-air balloon', 'Walking safaris'],
        2
      ),
      (
        'aberdare-national-park',
        'Kenya',
        'Central Highlands',
        767::numeric,
        1950,
        'Dry months for clearer forest trails; wet season for lush scenery.',
        array['Elephants', 'Black rhino', 'Leopards', 'Colobus monkeys'],
        array['Game drives', 'Forest walks', 'Birdwatching'],
        3
      ),
      (
        'hells-gate-national-park',
        'Kenya',
        'Rift Valley',
        68::numeric,
        1984,
        'Year-round; mornings are cooler for cycling and gorge walks.',
        array['Zebras', 'Giraffes', 'Buffalo', 'Raptors'],
        array['Cycling', 'Hiking', 'Rock climbing'],
        4
      )
  ) as v(destination_slug, country, region, park_size_km2, established_year, best_time_summary, wildlife, activities, position)
  join public.destinations d on d.status = 'published'
  join public.destination_translations dt
    on dt.destination_id = d.id
   and dt.locale = 'en'
   and dt.slug = v.destination_slug
   and dt.published_at is not null
  where not exists (
    select 1
    from public.national_park_translations existing
    where existing.locale = 'en'
      and existing.slug = v.destination_slug
  )
  returning id, destination_id, country, region, park_size_km2, established_year, best_time, wildlife, activities, position
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
      'Explore ' || dt.name || ' with Benroso Safaris — wildlife seasons, routes, and tailored safari options.'
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
insert into public.tour_national_parks (tour_id, park_id, position)
select
  t.id,
  p.id,
  row_number() over (order by p.position) - 1
from park_rows p
cross join lateral (
  select tours.id
  from public.tours
  join public.tour_translations tt
    on tt.tour_id = tours.id
   and tt.locale = 'en'
   and tt.published_at is not null
  where tours.status = 'published'
  order by tours.updated_at desc
  limit 1
) t
where p.position <= 2
on conflict do nothing;
