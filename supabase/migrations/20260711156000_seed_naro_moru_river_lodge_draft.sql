-- Seed draft: Naro Moru River Lodge (map and gallery left for manual entry).

do $$
declare
  v_accommodation_id uuid := gen_random_uuid();
  v_destination_id uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.accommodation_translations
    where locale = 'en' and slug = 'naro-moru-river-lodge'
  ) then
    return;
  end if;

  select d.id
  into v_destination_id
  from public.destinations d
  join public.destination_translations dt on dt.destination_id = d.id
  where dt.locale = 'en' and dt.slug = 'mount-kenya'
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
    'Mount Kenya',
    v_destination_id,
    'Economy Lodge / Mountain Safari Lodge',
    'economy',
    'on_request',
    null,
    '[
      "Comfortable guest rooms",
      "Cottage-style accommodation",
      "En-suite bathrooms",
      "Restaurant",
      "Bar and lounge",
      "Garden and outdoor seating areas",
      "Swimming pool",
      "Free Wi-Fi in selected areas",
      "Private parking",
      "Room service",
      "Laundry service",
      "Conference and event facilities",
      "Family-friendly accommodation",
      "Breakfast and meal options",
      "Mount Kenya hiking access",
      "Birdwatching opportunities",
      "Transfer arrangements",
      "Reception support",
      "Ol Pejeta safari access",
      "Central Kenya safari access"
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
    'naro-moru-river-lodge',
    'Naro Moru River Lodge',
    'Naro Moru River Lodge is an affordable lodge near Mount Kenya and Ol Pejeta routes, offering comfortable rooms, gardens, dining, and a scenic base for highland safaris, hiking, and central Kenya adventures.',
    jsonb_build_object(
      'html',
      $description$<p>Naro Moru River Lodge is a practical and scenic accommodation choice for travelers exploring the Mount Kenya region, Ol Pejeta Conservancy, and the central Kenya safari circuit. Set around the Naro Moru area, the lodge offers a calm highland atmosphere with easy access to Mount Kenya hiking routes, wildlife experiences, and nearby attractions.</p><p>For guests booking with Benroso Safaris, Naro Moru River Lodge works well for economy Ol Pejeta safari packages, Mount Kenya stopovers, family trips, hiking itineraries, and Kenya road safaris connecting Aberdare, Samburu, Lake Nakuru, or Maasai Mara. It is especially suitable for guests who want an affordable and comfortable base before or after visiting Ol Pejeta Conservancy.</p><p>The lodge offers a relaxed countryside setting with comfortable rooms, cottages, gardens, dining areas, and outdoor spaces where guests can unwind after a day of travel, hiking, or game viewing. With Benroso Safaris, Naro Moru River Lodge can be included in short central Kenya getaways and longer safari circuits designed for wildlife, scenery, and smooth travel between destinations.</p>$description$
    ),
    'Naro Moru River Lodge',
    'Book Naro Moru River Lodge with Benroso Safaris for affordable central Kenya accommodation near Mount Kenya and Ol Pejeta safari routes.',
    'Naro Moru River Lodge',
    '["Naro Moru River Lodge Kenya","budget lodge near Ol Pejeta","Mount Kenya accommodation","central Kenya safari lodge","Kenya safari accommodation"]'::jsonb,
    null,
    v_now
  );
end $$;
