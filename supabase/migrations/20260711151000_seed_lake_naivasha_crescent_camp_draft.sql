-- Seed draft: Lake Naivasha Crescent Camp (map and gallery left for manual entry).

do $$
declare
  v_accommodation_id uuid := gen_random_uuid();
  v_destination_id uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.accommodation_translations
    where locale = 'en' and slug = 'lake-naivasha-crescent-camp'
  ) then
    return;
  end if;

  select d.id
  into v_destination_id
  from public.destinations d
  join public.destination_translations dt on dt.destination_id = d.id
  where dt.locale = 'en' and dt.slug = 'lake-naivasha'
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
    'Lake Naivasha',
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
      "Breakfast and meal options",
      "Boat ride arrangements nearby",
      "Crescent Island access nearby",
      "Birdwatching opportunities",
      "Hell''s Gate National Park access",
      "Conference and event facilities",
      "Transfer arrangements",
      "Reception support",
      "Lake Naivasha safari access"
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
    'lake-naivasha-crescent-camp',
    'Lake Naivasha Crescent Camp',
    'Lake Naivasha Crescent Camp is a comfortable tented camp near Lake Naivasha, offering spacious safari tents, dining, a pool, gardens, and easy access to Crescent Island, boat rides, and Hell’s Gate National Park.',
    jsonb_build_object(
      'html',
      $description$<p>Lake Naivasha Crescent Camp is a relaxed mid-range accommodation option for travelers who want the feel of a safari camp while staying close to Lake Naivasha’s top attractions. It offers a peaceful setting with comfortable tented rooms, outdoor spaces, and convenient access to lake activities, making it a good choice for guests who want nature, comfort, and value in one place.</p><p>For guests booking with Benroso Safaris, Lake Naivasha Crescent Camp works well for mid-range Lake Naivasha safari packages, family trips, couple getaways, birdwatching tours, and Kenya road safari itineraries connecting Nairobi, Lake Nakuru, Maasai Mara, Amboseli, or Hell’s Gate National Park. It is especially suitable for travelers who want to enjoy boat rides, Crescent Island walking safaris, cycling, and scenic Rift Valley experiences.</p><p>The camp offers a warm and simple safari atmosphere with en-suite tented accommodation, dining facilities, a swimming pool, gardens, and areas where guests can relax after a day of exploring. With Benroso Safaris, Lake Naivasha Crescent Camp can be included in short Naivasha getaways, weekend safari escapes, and longer Kenya safari circuits designed for easy movement and memorable outdoor experiences.</p>$description$
    ),
    'Lake Naivasha Crescent Camp',
    'Book Lake Naivasha Crescent Camp with Benroso Safaris for a mid-range tented stay near boat rides, Crescent Island, and Hell’s Gate.',
    'Lake Naivasha Crescent Camp',
    '["Lake Naivasha Crescent Camp Kenya","mid-range Naivasha camp","Lake Naivasha accommodation","Crescent Island accommodation","Kenya safari camp"]'::jsonb,
    null,
    v_now
  );
end $$;
