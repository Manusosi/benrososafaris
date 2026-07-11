-- Seed draft: Panorama Park Hotel (map and gallery left for manual entry).

do $$
declare
  v_accommodation_id uuid := gen_random_uuid();
  v_destination_id uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.accommodation_translations
    where locale = 'en' and slug = 'panorama-park-hotel'
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
    'Economy Hotel / Lakeside Resort Hotel',
    'economy',
    'on_request',
    null,
    '[
      "Comfortable guest rooms",
      "En-suite bathrooms",
      "Restaurant",
      "Bar and lounge",
      "Outdoor swimming pool",
      "Garden and relaxation areas",
      "Free Wi-Fi in selected areas",
      "Private parking",
      "Room service",
      "Laundry service",
      "Conference and event facilities",
      "Family-friendly accommodation",
      "Children''s play area",
      "Breakfast options",
      "Transfer arrangements",
      "Boat ride arrangements nearby",
      "Crescent Island access nearby",
      "Hell''s Gate National Park access",
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
    'panorama-park-hotel',
    'Panorama Park Hotel',
    'Panorama Park Hotel is an affordable Lake Naivasha stay offering comfortable rooms, dining, a swimming pool, gardens, and convenient access to boat rides, Crescent Island, Hell’s Gate, and Rift Valley safari routes.',
    jsonb_build_object(
      'html',
      $description$<p>Panorama Park Hotel is a practical and affordable accommodation option for guests visiting Lake Naivasha and the surrounding Rift Valley attractions. It is suitable for travelers who want comfort, convenience, and good access to Naivasha activities without moving into higher-priced lakeside lodges.</p><p>For guests booking with Benroso Safaris, Panorama Park Hotel works well for economy Lake Naivasha packages, family stopovers, group trips, short weekend getaways, and Kenya road safari itineraries connecting Nairobi, Lake Nakuru, Maasai Mara, Amboseli, or Hell’s Gate National Park. Its setting around Naivasha makes it easy to include boat rides, Crescent Island walks, cycling tours, and day excursions.</p><p>The hotel offers a relaxed resort-style atmosphere with comfortable guest rooms, dining spaces, outdoor areas, and recreational facilities. It is a good fit for travelers who want a simple, friendly, and budget-conscious stay as part of a well-planned Benroso Safaris itinerary through Kenya’s Great Rift Valley.</p>$description$
    ),
    'Panorama Park Hotel',
    'Book Panorama Park Hotel with Benroso Safaris for affordable Lake Naivasha accommodation near boat rides, Crescent Island, and Hell’s Gate.',
    'Panorama Park Hotel',
    '["Panorama Park Hotel Kenya","budget hotel in Naivasha","Lake Naivasha accommodation","affordable Naivasha hotel","Kenya safari hotel"]'::jsonb,
    null,
    v_now
  );
end $$;
