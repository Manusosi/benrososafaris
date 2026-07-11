-- Seed draft: Sarova Lion Hill Game Lodge (map and gallery left for manual entry).

do $$
declare
  v_accommodation_id uuid := gen_random_uuid();
  v_destination_id uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.accommodation_translations
    where locale = 'en' and slug = 'sarova-lion-hill-game-lodge'
  ) then
    return;
  end if;

  select d.id
  into v_destination_id
  from public.destinations d
  join public.destination_translations dt on dt.destination_id = d.id
  where dt.locale = 'en' and dt.slug = 'lake-nakuru-national-park'
  limit 1;

  insert into public.accommodations (
    id,
    status,
    country,
    region,
    destination_id,
    property_type,
    comfort_level,
    availability,
    price_per_night,
    amenities,
    gallery,
    map_query,
    updated_at
  ) values (
    v_accommodation_id,
    'draft',
    'Kenya',
    'Lake Nakuru National Park',
    v_destination_id,
    'Luxury Safari Lodge',
    'luxury',
    'on_request',
    null,
    '[
      "Chalet-style en-suite rooms",
      "Restaurant",
      "Bar and lounge",
      "Outdoor swimming pool",
      "Spa and wellness treatments",
      "Garden and outdoor relaxation areas",
      "Free Wi-Fi",
      "Private parking",
      "Room service",
      "Laundry service",
      "Gift shop",
      "Conference facilities",
      "Family-friendly accommodation",
      "Children''s activities",
      "Birdwatching opportunities",
      "Game drive access",
      "Scenic lake and park views",
      "Full-board meal options",
      "Transfer arrangements",
      "Lake Nakuru National Park access"
    ]'::jsonb,
    '[]'::jsonb,
    null,
    v_now
  );

  insert into public.accommodation_translations (
    accommodation_id,
    locale,
    slug,
    name,
    summary,
    description,
    seo_title,
    seo_description,
    focus_keyword,
    keywords,
    published_at,
    updated_at
  ) values (
    v_accommodation_id,
    'en',
    'sarova-lion-hill-game-lodge',
    'Sarova Lion Hill Game Lodge',
    'Sarova Lion Hill Game Lodge is a luxury safari lodge inside Lake Nakuru National Park, offering scenic lake views, elegant rooms, dining, a pool, spa, and easy access to rhino and birdwatching safaris.',
    jsonb_build_object(
      'html',
      $description$<p>Sarova Lion Hill Game Lodge is one of the most established luxury lodges in Lake Nakuru National Park, beautifully positioned to give guests sweeping views of the lake, park landscapes, and surrounding Rift Valley scenery. It is a wonderful choice for travelers who want to stay inside the park while enjoying comfort, reliable service, and quick access to game drives.</p><p>For guests booking with Benroso Safaris, Sarova Lion Hill Game Lodge fits perfectly into luxury Lake Nakuru safari packages, family safaris, honeymoon trips, birdwatching safaris, and Kenya road safari itineraries connecting Maasai Mara, Lake Naivasha, Samburu, or Amboseli. The lodge is especially ideal for guests interested in rhino sightings, flamingos, Rothschild giraffes, and the dramatic scenery that makes Lake Nakuru a favorite stop on Kenya safari circuits.</p><p>The lodge offers a calm and polished safari atmosphere with stylish chalet-style rooms, beautiful gardens, a restaurant, bar, swimming pool, wellness facilities, and outdoor areas where guests can relax between game drives. With Benroso Safaris, Sarova Lion Hill Game Lodge is a strong choice for travelers who want a refined Lake Nakuru stay with excellent park access and memorable safari views.</p>$description$
    ),
    'Sarova Lion Hill Game Lodge',
    'Book Sarova Lion Hill Game Lodge with Benroso Safaris for a luxury Lake Nakuru safari stay with lake views, game drives, pool, dining, and spa.',
    'Sarova Lion Hill Game Lodge',
    '["Sarova Lion Hill Game Lodge Kenya","luxury Lake Nakuru lodge","Lake Nakuru safari accommodation","Kenya safari lodge","accommodation inside Lake Nakuru National Park"]'::jsonb,
    null,
    v_now
  );
end $$;
