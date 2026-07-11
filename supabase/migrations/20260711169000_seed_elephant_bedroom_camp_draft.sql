-- Seed draft: Elephant Bedroom Camp (map and gallery left for manual entry).

do $$
declare
  v_accommodation_id uuid := gen_random_uuid();
  v_destination_id uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.accommodation_translations
    where locale = 'en' and slug = 'elephant-bedroom-camp'
  ) then
    return;
  end if;

  select d.id
  into v_destination_id
  from public.destinations d
  join public.destination_translations dt on dt.destination_id = d.id
  where dt.locale = 'en' and dt.slug = 'samburu-national-reserve'
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
    'Samburu National Reserve',
    v_destination_id,
    'High-End Luxury Tented Safari Camp',
    'ultra-luxury',
    'on_request',
    null,
    '[
      "Luxury en-suite safari tents",
      "Private verandas / decks",
      "Riverside views",
      "Restaurant",
      "Bar and lounge",
      "Outdoor swimming pool",
      "Private plunge pool in selected tents",
      "Outdoor seating areas",
      "Free Wi-Fi in selected areas",
      "Room service",
      "Laundry service",
      "Full-board meal options",
      "Guided game drives",
      "Birdwatching opportunities",
      "Samburu Special Five viewing",
      "Photography-friendly setting",
      "Honeymoon-friendly accommodation",
      "Transfer arrangements",
      "Reception support",
      "Samburu National Reserve access"
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
    'elephant-bedroom-camp',
    'Elephant Bedroom Camp',
    'Elephant Bedroom Camp is a high-end tented camp in Samburu, offering elegant riverside tents, private decks, close wildlife encounters, fine dining, and a quiet luxury safari experience in northern Kenya.',
    jsonb_build_object(
      'html',
      $description$<p>Elephant Bedroom Camp is an intimate luxury safari camp set along the Ewaso Nyiro River in Samburu National Reserve, one of Kenya’s most distinctive safari destinations. The camp is loved for its peaceful riverside setting, elegant tented suites, and the chance to experience Samburu’s wildlife in a more personal and relaxed way.</p><p>For guests booking with Benroso Safaris, Elephant Bedroom Camp is a strong choice for high-end Samburu safari packages, honeymoon safaris, private Kenya safaris, photography trips, and premium northern circuit itineraries. It is especially suitable for travelers who want to see elephants, big cats, birdlife, and the Samburu Special Five while staying in a smaller camp with character, comfort, and excellent wildlife access.</p><p>The camp offers spacious luxury tents with private decks, stylish interiors, and a close-to-nature atmosphere that still feels polished and comfortable. With Benroso Safaris, Elephant Bedroom Camp can be included in luxury Kenya safari circuits connecting Samburu with Ol Pejeta, Aberdare, Lake Nakuru, Maasai Mara, or Nairobi for guests who want exclusivity, scenery, and a memorable northern Kenya safari stay.</p>$description$
    ),
    'Elephant Bedroom Camp',
    'Book Elephant Bedroom Camp with Benroso Safaris for a high-end Samburu safari stay with luxury tents, river views, wildlife, and game drives.',
    'Elephant Bedroom Camp',
    '["Elephant Bedroom Camp Kenya","luxury Samburu camp","Samburu tented accommodation","Ewaso Nyiro safari camp","Kenya luxury safari lodge"]'::jsonb,
    null,
    v_now
  );
end $$;
