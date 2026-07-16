-- Seed draft: Kicheche Valley Naboisho Camp (map and gallery left for manual entry).

do $$
declare
  v_accommodation_id uuid := gen_random_uuid();
  v_destination_id uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.accommodation_translations
    where locale = 'en' and slug = 'kicheche-valley-naboisho-camp'
  ) then
    return;
  end if;

  select d.id
  into v_destination_id
  from public.destinations d
  join public.destination_translations dt on dt.destination_id = d.id
  where dt.locale = 'en' and dt.slug = 'maasai-mara'
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
    'Mara Naboisho Conservancy',
    v_destination_id,
    'High-End Luxury Tented Safari Camp',
    'ultra-luxury',
    'on_request',
    null,
    '[
      "Luxury en-suite safari tents",
      "Private verandas",
      "Restaurant and dining tent",
      "Bar and lounge",
      "Outdoor seating areas",
      "Campfire area",
      "Full-board meal options",
      "Guided day game drives",
      "Night game drive arrangements",
      "Guided walking safaris",
      "Birdwatching opportunities",
      "Big cat viewing",
      "Photography-friendly setting",
      "Sundowner arrangements",
      "Cultural visit arrangements",
      "Laundry service",
      "Transfer arrangements",
      "Family-friendly accommodation",
      "Honeymoon-friendly setting",
      "Mara Naboisho Conservancy access"
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
    'kicheche-valley-naboisho-camp',
    'Kicheche Valley Naboisho Camp',
    'Kicheche Valley Naboisho Camp is an intimate high-end safari camp in the Mara Naboisho Conservancy, offering luxury tented accommodation, excellent guiding, big cat sightings, walking safaris, and a quieter Maasai Mara experience.',
    jsonb_build_object(
      'html',
      $description$<p>Kicheche Valley Naboisho Camp is a beautiful choice for travelers who want a more private and authentic Maasai Mara safari away from the busier reserve routes. Set within the Mara Naboisho Conservancy, the camp offers guests access to excellent wildlife areas, open savannah, strong predator sightings, and a quieter conservancy-style safari experience.</p><p>For guests booking with Benroso Safaris, Kicheche Valley Naboisho Camp works perfectly for high-end Maasai Mara safari packages, honeymoon safaris, photography safaris, private Kenya safaris, and luxury Great Migration extensions. It is especially suitable for travelers who value expert guiding, intimate camp settings, fewer vehicles, and a more personal connection to the wilderness.</p><p>The camp offers spacious en-suite safari tents, warm hospitality, elegant bush dining, and peaceful views across the Naboisho landscape. Guests can enjoy day and night game drives, guided walking safaris, sundowners, cultural experiences, and relaxed evenings around camp. With Benroso Safaris, Kicheche Valley Naboisho Camp can be included in premium Maasai Mara itineraries for guests who want comfort, exclusivity, and rewarding wildlife encounters.</p>$description$
    ),
    'Kicheche Valley Naboisho Camp',
    'Book Kicheche Valley Naboisho Camp with Benroso Safaris for a high-end Maasai Mara conservancy stay with luxury tents and expert guiding.',
    'Kicheche Valley Naboisho Camp',
    '["Kicheche Valley Camp Kenya","Mara Naboisho luxury camp","high-end Maasai Mara camp","Kenya conservancy safari","luxury Kenya safari accommodation"]'::jsonb,
    null,
    v_now
  );
end $$;
