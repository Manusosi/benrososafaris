-- Seed draft: Mbweha Camp (map and gallery left for manual entry).

do $$
declare
  v_accommodation_id uuid := gen_random_uuid();
  v_destination_id uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.accommodation_translations
    where locale = 'en' and slug = 'mbweha-camp'
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
    'High-End Safari Camp / Boutique Bush Lodge',
    'ultra-luxury',
    'on_request',
    null,
    '[
      "Stone cottage accommodation",
      "En-suite bathrooms",
      "Restaurant",
      "Bar and lounge",
      "Outdoor swimming pool",
      "Garden and outdoor relaxation areas",
      "Private conservancy setting",
      "Guided nature walks",
      "Birdwatching opportunities",
      "Mountain biking arrangements",
      "Horse riding arrangements",
      "Night game drive arrangements",
      "Balloon safari arrangements",
      "Laundry service",
      "Family-friendly accommodation",
      "Private parking",
      "Transfer arrangements",
      "Full-board meal options",
      "Scenic Rift Valley views",
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
    'mbweha-camp',
    'Mbweha Camp',
    'Mbweha Camp is an intimate safari camp in the private Congreve Conservancy near Lake Nakuru, offering rustic luxury cottages, open views, guided activities, and a peaceful Rift Valley safari setting.',
    jsonb_build_object(
      'html',
      $description$<p>Mbweha Camp is a beautiful choice for travelers who want a quieter, more private safari experience near Lake Nakuru National Park. Set within the private Congreve Conservancy, the camp offers a calm bush setting with views of the Eburru and Mau ranges, giving guests a different side of the Rift Valley beyond the usual in-park lodge experience.</p><p>For guests booking with Benroso Safaris, Mbweha Camp works well for high-end Lake Nakuru safari packages, private Kenya safaris, honeymoon safaris, family trips, birdwatching tours, and scenic Rift Valley itineraries. It is especially suitable for travelers who want to combine Lake Nakuru’s rhino and flamingo experiences with a more exclusive conservancy-style stay.</p><p>The camp has a warm, rustic feel with comfortable stone cottages, thatched roofs, open spaces, and a relaxed atmosphere surrounded by nature. With Benroso Safaris, Mbweha Camp can be included in Kenya safari circuits that connect Lake Nakuru with Lake Naivasha, Maasai Mara, Amboseli, Samburu, or Aberdare for guests who want comfort, privacy, and a memorable safari flow.</p>$description$
    ),
    'Mbweha Camp',
    'Book Mbweha Camp with Benroso Safaris for a high-end Lake Nakuru safari stay in a private conservancy with cottages and guided activities.',
    'Mbweha Camp',
    '["Mbweha Camp Kenya","Lake Nakuru luxury camp","Congreve Conservancy accommodation","high-end Nakuru safari lodge","Kenya safari camp"]'::jsonb,
    null,
    v_now
  );
end $$;
