-- Seed draft: Lake Naivasha Resort (map and gallery left for manual entry).

do $$
declare
  v_accommodation_id uuid := gen_random_uuid();
  v_destination_id uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.accommodation_translations
    where locale = 'en' and slug = 'lake-naivasha-resort'
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
    'Mid-Range Resort / Lakeside Safari Hotel',
    'mid-range',
    'on_request',
    null,
    '[
      "Comfortable guest rooms",
      "En-suite bathrooms",
      "Restaurant",
      "Bar and lounge",
      "Outdoor swimming pool",
      "Garden and outdoor seating areas",
      "Free Wi-Fi in selected areas",
      "Private parking",
      "Room service",
      "Laundry service",
      "Conference and event facilities",
      "Family-friendly accommodation",
      "Children''s play area",
      "Breakfast and meal options",
      "Boat ride arrangements nearby",
      "Crescent Island access nearby",
      "Hell''s Gate National Park access",
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
    'lake-naivasha-resort',
    'Lake Naivasha Resort',
    'Lake Naivasha Resort is a comfortable resort-style stay near Lake Naivasha, offering spacious rooms, dining, a pool, gardens, and easy access to boat rides, Crescent Island, Hell’s Gate, and Rift Valley safari routes.',
    jsonb_build_object(
      'html',
      $description$<p>Lake Naivasha Resort is a good choice for travelers who want a relaxed hotel-style stay with easy access to Lake Naivasha’s main attractions. The property offers a comfortable base for guests planning boat rides, birdwatching, Crescent Island walking safaris, Hell’s Gate excursions, and scenic Rift Valley stopovers.</p><p>For guests booking with Benroso Safaris, Lake Naivasha Resort works well for mid-range Lake Naivasha safari packages, family holidays, group tours, corporate retreats, couple getaways, and Kenya road safari itineraries connecting Nairobi, Lake Nakuru, Maasai Mara, Amboseli, or Aberdare. It is especially suitable for travelers who want convenience, comfort, and enough facilities to relax between activities.</p><p>The resort has a warm and spacious feel, with guest rooms, dining areas, gardens, a swimming pool, conference facilities, and outdoor relaxation spaces. With Benroso Safaris, Lake Naivasha Resort can be included in short Naivasha getaways, weekend escapes, and longer Kenya safari circuits for guests who want an easy, comfortable stay near the lake.</p>$description$
    ),
    'Lake Naivasha Resort',
    'Book Lake Naivasha Resort with Benroso Safaris for a comfortable Naivasha stay near boat rides, Crescent Island, and Hell’s Gate.',
    'Lake Naivasha Resort',
    '["Lake Naivasha Resort Kenya","mid-range Naivasha hotel","Lake Naivasha accommodation","Naivasha safari resort","Kenya safari hotel"]'::jsonb,
    null,
    v_now
  );
end $$;
