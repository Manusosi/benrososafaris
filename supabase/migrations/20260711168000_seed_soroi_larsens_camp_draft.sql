-- Seed draft: Soroi Larsens Camp (map and gallery left for manual entry).

do $$
declare
  v_accommodation_id uuid := gen_random_uuid();
  v_destination_id uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.accommodation_translations
    where locale = 'en' and slug = 'soroi-larsens-camp'
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
      "Private verandas",
      "Riverside views",
      "Restaurant",
      "Bar and lounge",
      "Outdoor swimming pool",
      "Garden and outdoor seating areas",
      "Fine dining experiences",
      "Free Wi-Fi in selected areas",
      "Private parking",
      "Room service",
      "Laundry service",
      "Full-board meal options",
      "Guided game drives",
      "Birdwatching opportunities",
      "Samburu Special Five viewing",
      "Photography-friendly setting",
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
    'soroi-larsens-camp',
    'Soroi Larsens Camp',
    'Soroi Larsens Camp is a high-end luxury tented camp in Samburu, offering elegant riverside accommodation, fine dining, a pool, guided game drives, and exclusive access to northern Kenya’s rare wildlife.',
    jsonb_build_object(
      'html',
      $description$<p>Soroi Larsens Camp is a refined safari stay for travelers who want a more exclusive and intimate experience in Samburu National Reserve. Set along the beautiful Ewaso Nyiro River, the camp offers a classic luxury safari atmosphere with sweeping wilderness views, elegant tented suites, and close access to Samburu’s best wildlife areas.</p><p>For guests booking with Benroso Safaris, Soroi Larsens Camp is ideal for high-end Samburu safari packages, honeymoon safaris, private Kenya safaris, photography trips, and premium northern circuit itineraries. It is especially suitable for travelers who want to see elephants, lions, leopards, rich birdlife, and the Samburu Special Five while enjoying a quieter, more polished camp experience.</p><p>The camp blends old-world safari charm with modern comfort, giving guests a beautiful place to relax between game drives. With Benroso Safaris, Soroi Larsens Camp can be included in luxury Kenya safari circuits connecting Samburu with Ol Pejeta, Aberdare, Lake Nakuru, Maasai Mara, or Nairobi for guests who want comfort, privacy, and exceptional wildlife access.</p>$description$
    ),
    'Soroi Larsens Camp',
    'Book Soroi Larsens Camp with Benroso Safaris for a high-end Samburu safari stay with luxury tents, river views, fine dining, and game drives.',
    'Soroi Larsens Camp',
    '["Soroi Larsens Camp Kenya","luxury Samburu camp","Samburu high-end accommodation","Ewaso Nyiro safari camp","Kenya luxury safari accommodation"]'::jsonb,
    null,
    v_now
  );
end $$;
