-- Seed draft: Lake Nakuru Sopa Lodge (map and gallery left for manual entry).

do $$
declare
  v_accommodation_id uuid := gen_random_uuid();
  v_destination_id uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.accommodation_translations
    where locale = 'en' and slug = 'lake-nakuru-sopa-lodge'
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
      "Spacious en-suite rooms",
      "Private balconies / verandas",
      "Restaurant",
      "Bar and lounge",
      "Outdoor swimming pool",
      "Garden and outdoor seating areas",
      "Free Wi-Fi in public areas",
      "Private parking",
      "Room service",
      "Laundry service",
      "Gift shop",
      "Conference facilities",
      "Family-friendly accommodation",
      "Children''s activities",
      "Full-board meal options",
      "Game drive access",
      "Birdwatching opportunities",
      "Scenic lake views",
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
    'lake-nakuru-sopa-lodge',
    'Lake Nakuru Sopa Lodge',
    'Lake Nakuru Sopa Lodge is a scenic luxury safari lodge overlooking Lake Nakuru National Park, offering spacious rooms, beautiful Rift Valley views, dining, a pool, and easy access to rhino and birdwatching safaris.',
    jsonb_build_object(
      'html',
      $description$<p>Lake Nakuru Sopa Lodge is a beautiful safari stay for travelers who want comfort, scenery, and a peaceful base near one of Kenya’s most rewarding national parks. Set on the western side of the Lake Nakuru area, the lodge offers wide views across the lake and surrounding landscapes, making it a great choice for guests who enjoy calm surroundings after a day of wildlife viewing.</p><p>For guests booking with Benroso Safaris, Lake Nakuru Sopa Lodge works well for luxury Lake Nakuru safari packages, Kenya road safaris, family holidays, honeymoon stopovers, birdwatching safaris, and Rift Valley itineraries connecting Maasai Mara, Lake Naivasha, Amboseli, Samburu, or Aberdare. It is especially suitable for travelers who want a more relaxed lodge setting with strong access to Lake Nakuru’s rhinos, Rothschild giraffes, buffaloes, baboons, flamingos, and rich birdlife.</p><p>The lodge offers spacious rooms, warm hospitality, dining facilities, a swimming pool, gardens, and relaxing outdoor areas with memorable views of the Great Rift Valley. With Benroso Safaris, Lake Nakuru Sopa Lodge can be included in both short Lake Nakuru getaways and longer Kenya safari circuits for guests who want comfort, scenery, and a smooth safari experience.</p>$description$
    ),
    'Lake Nakuru Sopa Lodge',
    'Book Lake Nakuru Sopa Lodge with Benroso Safaris for a luxury Lake Nakuru safari stay with lake views, dining, pool, and game drives.',
    'Lake Nakuru Sopa Lodge',
    '["Lake Nakuru Sopa Lodge Kenya","luxury Lake Nakuru lodge","Lake Nakuru safari accommodation","Rift Valley safari lodge","Kenya safari accommodation"]'::jsonb,
    null,
    v_now
  );
end $$;
