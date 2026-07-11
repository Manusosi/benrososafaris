-- Seed draft: Ikweta Safari Camp (map and gallery left for manual entry).

do $$
declare
  v_accommodation_id uuid := gen_random_uuid();
  v_destination_id uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.accommodation_translations
    where locale = 'en' and slug = 'ikweta-safari-camp'
  ) then
    return;
  end if;

  select d.id
  into v_destination_id
  from public.destinations d
  join public.destination_translations dt on dt.destination_id = d.id
  where dt.locale = 'en' and dt.slug = 'meru-national-park'
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
    'Meru National Park',
    v_destination_id,
    'Mid-Range Tented Safari Camp',
    'mid-range',
    'on_request',
    null,
    '[
      "En-suite safari tents",
      "Private verandas",
      "Restaurant",
      "Bar and lounge",
      "Outdoor swimming pool",
      "Garden and outdoor seating areas",
      "Free Wi-Fi in selected areas",
      "Private parking",
      "Room service",
      "Laundry service",
      "Family-friendly accommodation",
      "Full-board meal options",
      "Game drive access",
      "Birdwatching opportunities",
      "Nature-focused setting",
      "Transfer arrangements",
      "Reception support",
      "Meru National Park access",
      "Relaxed camp atmosphere",
      "Safari planning support"
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
    'ikweta-safari-camp',
    'Ikweta Safari Camp',
    'Ikweta Safari Camp is a comfortable tented camp near Meru National Park, offering relaxed safari accommodation, dining, a pool, gardens, and easy access to game drives in one of Kenya’s quieter wilderness destinations.',
    jsonb_build_object(
      'html',
      $description$<p>Ikweta Safari Camp is a great choice for travelers who want to explore Meru National Park while staying in a peaceful and affordable safari setting. Located near the park’s Murera Gate area, the camp gives guests convenient access to Meru’s wild landscapes, river systems, open plains, and diverse wildlife.</p><p>For guests booking with Benroso Safaris, Ikweta Safari Camp works well for mid-range Meru safari packages, private Kenya safaris, family trips, birdwatching tours, and off-the-beaten-path safari itineraries. It is especially suitable for travelers who want a quieter alternative to Kenya’s busier parks while still enjoying elephants, lions, buffaloes, giraffes, zebras, antelopes, and rich birdlife.</p><p>The camp offers a warm tented safari atmosphere with comfortable en-suite tents, outdoor seating areas, dining spaces, and a swimming pool where guests can relax after game drives. With Benroso Safaris, Ikweta Safari Camp can be included in Meru safari itineraries or combined with Samburu, Ol Pejeta, Aberdare, or Mount Kenya for a rewarding central and northern Kenya safari circuit.</p>$description$
    ),
    'Ikweta Safari Camp',
    'Book Ikweta Safari Camp with Benroso Safaris for a mid-range Meru safari stay near the park with tents, pool, dining, and game drives.',
    'Ikweta Safari Camp',
    '["Ikweta Safari Camp Kenya","Meru National Park accommodation","mid-range Meru safari camp","Kenya tented safari camp","Meru safari lodge"]'::jsonb,
    null,
    v_now
  );
end $$;
