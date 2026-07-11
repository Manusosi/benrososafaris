-- Seed draft: Enashipai Resort & Spa (map and gallery left for manual entry).

do $$
declare
  v_accommodation_id uuid := gen_random_uuid();
  v_destination_id uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.accommodation_translations
    where locale = 'en' and slug = 'enashipai-resort-spa'
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
    'Luxury Resort / Spa Hotel',
    'luxury',
    'on_request',
    null,
    '[
      "Elegant en-suite rooms",
      "Restaurant",
      "Bar and lounge",
      "Outdoor swimming pool",
      "Spa and wellness center",
      "Fitness center",
      "Steam and sauna facilities",
      "Garden and outdoor seating areas",
      "Free Wi-Fi in public areas",
      "Private parking",
      "Room service",
      "Laundry service",
      "Conference and event facilities",
      "Family-friendly accommodation",
      "Children''s activities",
      "Boat ride arrangements nearby",
      "Crescent Island access nearby",
      "Hell''s Gate National Park access",
      "Transfer arrangements",
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
    'enashipai-resort-spa',
    'Enashipai Resort & Spa',
    'Enashipai Resort & Spa is a luxury Lake Naivasha resort offering elegant rooms, lush gardens, fine dining, a spa, swimming pool, and easy access to boat rides, Crescent Island, Hell’s Gate, and Rift Valley safari routes.',
    jsonb_build_object(
      'html',
      $description$<p>Enashipai Resort & Spa is a refined Lake Naivasha stay for guests who want comfort, wellness, and a polished resort experience as part of their Kenya safari. Set within the Naivasha area, the resort offers a relaxing atmosphere with beautiful gardens, stylish accommodation, and easy access to the lake’s most popular activities, including boat rides, birdwatching, Crescent Island walking safaris, and Hell’s Gate National Park excursions.</p><p>For guests booking with Benroso Safaris, Enashipai Resort & Spa works well for luxury Lake Naivasha safari packages, honeymoon stopovers, family holidays, wellness retreats, corporate travel, and Kenya road safari circuits connecting Nairobi, Lake Nakuru, Maasai Mara, Amboseli, or Aberdare. It is especially suitable for travelers who want to enjoy safari activities during the day and return to a comfortable resort with strong dining, spa, and leisure facilities.</p><p>The resort combines modern hospitality with a peaceful Rift Valley setting, making it ideal for guests who want more than just a stopover. With Benroso Safaris, Enashipai Resort & Spa can be included in short Naivasha getaways, romantic Kenya safari packages, weekend escapes, and longer safari itineraries where comfort and relaxation matter.</p>$description$
    ),
    'Enashipai Resort & Spa',
    'Book Enashipai Resort & Spa with Benroso Safaris for a luxury Lake Naivasha stay with spa, pool, dining, gardens, and nearby safari activities.',
    'Enashipai Resort & Spa',
    '["Enashipai Resort Kenya","luxury Naivasha resort","Lake Naivasha accommodation","Naivasha spa resort","Kenya safari resort"]'::jsonb,
    null,
    v_now
  );
end $$;
