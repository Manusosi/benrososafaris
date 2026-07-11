-- Seed draft: Flamingo Hill Tented Camp (map and gallery left for manual entry).

do $$
declare
  v_accommodation_id uuid := gen_random_uuid();
  v_destination_id uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.accommodation_translations
    where locale = 'en' and slug = 'flamingo-hill-tented-camp'
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
    'Mid-Range Tented Safari Camp',
    'mid-range',
    'on_request',
    null,
    '[
      "En-suite tented rooms",
      "Private verandas",
      "Restaurant",
      "Bar and lounge",
      "Outdoor swimming pool",
      "Garden and relaxation areas",
      "Free Wi-Fi in public areas",
      "Private parking",
      "Room service",
      "Laundry service",
      "Family-friendly accommodation",
      "Conference facilities",
      "Gift shop",
      "Full-board meal options",
      "Game drive access",
      "Birdwatching opportunities",
      "Transfer arrangements",
      "Reception support",
      "Outdoor seating areas",
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
    'flamingo-hill-tented-camp',
    'Flamingo Hill Tented Camp',
    'Flamingo Hill Tented Camp is a charming safari camp near Lake Nakuru National Park, offering comfortable tented rooms, dining, a pool, and a relaxed base for rhino, flamingo, and Rift Valley wildlife safaris.',
    jsonb_build_object(
      'html',
      $description$<p>Flamingo Hill Tented Camp is a welcoming safari accommodation option for travelers who want the feel of a tented camp while staying close to Lake Nakuru National Park. Its setting makes it ideal for guests looking to explore one of Kenya’s most scenic parks, known for rhinos, birdlife, acacia woodland, lake views, and beautiful game drive routes.</p><p>For guests booking with Benroso Safaris, Flamingo Hill Tented Camp works well for mid-range Lake Nakuru safari packages, family safaris, couple getaways, birdwatching trips, and Kenya road safari itineraries that connect Lake Nakuru with Maasai Mara, Lake Naivasha, Amboseli, or Samburu. It gives travelers a comfortable place to rest after a game drive while still keeping the safari experience warm and natural.</p><p>The camp is especially suitable for guests who want value, comfort, and a relaxed atmosphere without choosing a large hotel-style property. With Benroso Safaris, Flamingo Hill Tented Camp can be included in short Lake Nakuru safaris, Rift Valley stopovers, and longer Kenya safari circuits designed for easy movement and memorable wildlife viewing.</p>$description$
    ),
    'Flamingo Hill Tented Camp',
    'Book Flamingo Hill Tented Camp with Benroso Safaris for a mid-range Lake Nakuru safari stay with tented rooms, dining, pool, and game drives.',
    'Flamingo Hill Tented Camp',
    '["Flamingo Hill Tented Camp Kenya","Lake Nakuru tented camp","mid-range Lake Nakuru accommodation","Kenya safari camp","Lake Nakuru safari lodge"]'::jsonb,
    null,
    v_now
  );
end $$;
