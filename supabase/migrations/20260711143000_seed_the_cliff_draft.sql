-- Seed draft: The Cliff (map and gallery left for manual entry).

do $$
declare
  v_accommodation_id uuid := gen_random_uuid();
  v_destination_id uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.accommodation_translations
    where locale = 'en' and slug = 'the-cliff'
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
    'High-End Luxury Safari Camp / Boutique Tented Camp',
    'ultra-luxury',
    'on_request',
    null,
    '[
      "Luxury tented suites",
      "Private viewing decks",
      "En-suite bathrooms",
      "Lake and Rift Valley views",
      "Restaurant",
      "Bar and lounge",
      "Outdoor swimming pool",
      "Spa and wellness treatments",
      "Outdoor relaxation areas",
      "Free Wi-Fi in public areas",
      "Private parking",
      "Room service",
      "Laundry service",
      "Fine dining experiences",
      "Full-board meal options",
      "Game drive access",
      "Birdwatching opportunities",
      "Transfer arrangements",
      "Honeymoon-friendly setting",
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
    'the-cliff',
    'The Cliff',
    'The Cliff is a high-end luxury camp overlooking Lake Nakuru, offering elegant tented suites, panoramic lake views, fine dining, a pool, and a peaceful base for premium Rift Valley safaris.',
    jsonb_build_object(
      'html',
      $description$<p>The Cliff is one of the most stylish and exclusive accommodation options near Lake Nakuru National Park, created for travelers who want privacy, elegance, and unforgettable scenery. Perched above the lake, the camp offers a refined safari experience with sweeping views, beautiful tented suites, and a calm atmosphere that feels intimate from the moment guests arrive.</p><p>For guests booking with Benroso Safaris, The Cliff is an excellent choice for high-end Lake Nakuru safari packages, honeymoon safaris, luxury Kenya road safaris, photography trips, and premium Rift Valley itineraries. It works especially well for travelers who want to combine Lake Nakuru’s rhinos, flamingos, Rothschild giraffes, and birdlife with accommodation that feels more boutique and exclusive.</p><p>The camp blends modern luxury with a classic safari mood, offering spacious tented suites, stylish interiors, private decks, fine dining, a swimming pool, and relaxing spaces overlooking the lake. With Benroso Safaris, The Cliff can be included in luxury Kenya safari circuits connecting Lake Nakuru with Maasai Mara, Lake Naivasha, Amboseli, Samburu, or Aberdare for guests who want comfort, scenery, and a premium safari flow.</p>$description$
    ),
    'The Cliff',
    'Book The Cliff with Benroso Safaris for a high-end Lake Nakuru safari stay with luxury tents, lake views, fine dining, pool, and game drives.',
    'The Cliff Lake Nakuru',
    '["The Cliff Kenya","luxury Lake Nakuru camp","high-end Lake Nakuru accommodation","Lake Nakuru safari lodge","Kenya luxury safari accommodation"]'::jsonb,
    null,
    v_now
  );
end $$;
