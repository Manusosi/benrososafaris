-- Seed draft: Mountain Lodge (map and gallery left for manual entry).

do $$
declare
  v_accommodation_id uuid := gen_random_uuid();
  v_destination_id uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.accommodation_translations
    where locale = 'en' and slug = 'mountain-lodge'
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
    'Economy Safari Lodge / Mountain Lodge',
    'economy',
    'on_request',
    null,
    '[
      "Comfortable guest rooms",
      "En-suite bathrooms",
      "Restaurant",
      "Bar and lounge",
      "Garden and outdoor seating areas",
      "Private parking",
      "Free Wi-Fi in selected areas",
      "Room service",
      "Laundry service",
      "Family-friendly accommodation",
      "Breakfast and meal options",
      "Conference and event facilities",
      "Birdwatching opportunities nearby",
      "Mount Kenya access",
      "Ol Pejeta safari access",
      "Transfer arrangements",
      "Reception support",
      "Central Kenya safari access",
      "Relaxed highland setting"
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
    'mountain-lodge',
    'Mountain Lodge',
    'Mountain Lodge is a comfortable highland lodge near Mount Kenya and Ol Pejeta routes, offering scenic surroundings, cozy rooms, dining, gardens, and a practical base for central Kenya safari and nature experiences.',
    jsonb_build_object(
      'html',
      $description$<p>Mountain Lodge is a simple and comfortable stay for travelers exploring the Mount Kenya region, Nanyuki, and the wider Ol Pejeta Conservancy safari circuit. Its highland setting makes it suitable for guests who want a relaxed overnight base before or after visiting Ol Pejeta, Mount Kenya, Aberdare, or nearby central Kenya attractions.</p><p>For guests booking with Benroso Safaris, Mountain Lodge works well for economy Ol Pejeta safari packages, Mount Kenya stopovers, family road trips, hiking itineraries, and Kenya safari circuits connecting Samburu, Aberdare, Lake Nakuru, or Maasai Mara. It is a good choice for travelers who want value, comfort, and easy movement across the central Kenya safari route.</p><p>The lodge offers a calm and practical atmosphere with comfortable rooms, dining spaces, outdoor areas, and essential guest services. With Benroso Safaris, Mountain Lodge can be included in short central Kenya escapes and longer safari itineraries where guests want affordable accommodation without losing access to key wildlife and nature destinations.</p>$description$
    ),
    'Mountain Lodge Kenya',
    'Book Mountain Lodge with Benroso Safaris for affordable central Kenya accommodation near Mount Kenya, Nanyuki, and Ol Pejeta safari routes.',
    'Mountain Lodge Kenya',
    '["Mountain Lodge Kenya","budget lodge near Ol Pejeta","Mount Kenya lodge","central Kenya accommodation","Kenya safari lodge"]'::jsonb,
    null,
    v_now
  );
end $$;
