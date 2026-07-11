-- Seed draft: Maisha Sweetwaters Camp (map and gallery left for manual entry).

do $$
declare
  v_accommodation_id uuid := gen_random_uuid();
  v_destination_id uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.accommodation_translations
    where locale = 'en' and slug = 'maisha-sweetwaters-camp'
  ) then
    return;
  end if;

  select d.id
  into v_destination_id
  from public.destinations d
  join public.destination_translations dt on dt.destination_id = d.id
  where dt.locale = 'en' and dt.slug = 'ol-pejeta-conservancy'
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
    'Ol Pejeta Conservancy',
    v_destination_id,
    'Mid-Range Safari Camp / Tented Camp',
    'mid-range',
    'on_request',
    null,
    '[
      "Comfortable safari tents",
      "En-suite bathrooms",
      "Restaurant",
      "Bar and lounge",
      "Outdoor seating areas",
      "Garden and relaxation spaces",
      "Free Wi-Fi in selected areas",
      "Private parking",
      "Room service",
      "Laundry service",
      "Family-friendly accommodation",
      "Breakfast and meal options",
      "Game drive access",
      "Rhino viewing opportunities nearby",
      "Chimpanzee sanctuary access nearby",
      "Birdwatching opportunities",
      "Mount Kenya views nearby",
      "Transfer arrangements",
      "Reception support",
      "Ol Pejeta safari access"
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
    'maisha-sweetwaters-camp',
    'Maisha Sweetwaters Camp',
    'Maisha Sweetwaters Camp is a comfortable safari camp near Ol Pejeta Conservancy, offering relaxed tented accommodation, dining, outdoor spaces, and convenient access to rhino, chimpanzee, and Big Five safari experiences.',
    jsonb_build_object(
      'html',
      $description$<p>Maisha Sweetwaters Camp is a good choice for travelers looking for a comfortable and affordable safari stay around the Ol Pejeta Conservancy area. Its setting makes it practical for guests who want easy access to Ol Pejeta’s wildlife experiences while enjoying a calm place to rest before and after game drives.</p><p>For guests booking with Benroso Safaris, Maisha Sweetwaters Camp works well for mid-range Ol Pejeta safari packages, family trips, private Kenya safaris, conservation-focused tours, and central Kenya itineraries connecting Aberdare, Mount Kenya, Samburu, Lake Nakuru, or Maasai Mara. It is especially suitable for travelers interested in rhino viewing, the Sweetwaters Chimpanzee Sanctuary, scenic Mount Kenya landscapes, and relaxed safari travel.</p><p>The camp offers a simple and welcoming safari atmosphere with comfortable accommodation, dining areas, outdoor relaxation spaces, and guest services suited for a smooth safari stay. With Benroso Safaris, Maisha Sweetwaters Camp can be included in short Ol Pejeta getaways or longer Kenya safari circuits for guests who want value, comfort, and memorable wildlife access.</p>$description$
    ),
    'Maisha Sweetwaters Camp',
    'Book Maisha Sweetwaters Camp with Benroso Safaris for a mid-range Ol Pejeta stay near rhinos, chimpanzees, game drives, and Mount Kenya views.',
    'Maisha Sweetwaters Camp',
    '["Maisha Sweetwaters Camp Kenya","Ol Pejeta accommodation","mid-range Sweetwaters camp","Kenya safari camp","Ol Pejeta safari lodge"]'::jsonb,
    null,
    v_now
  );
end $$;
