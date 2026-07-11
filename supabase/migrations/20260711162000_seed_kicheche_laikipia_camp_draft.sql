-- Seed draft: Kicheche Laikipia Camp (map and gallery left for manual entry).

do $$
declare
  v_accommodation_id uuid := gen_random_uuid();
  v_destination_id uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.accommodation_translations
    where locale = 'en' and slug = 'kicheche-laikipia-camp'
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
    'Luxury Tented Safari Camp / Conservancy Camp',
    'luxury',
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
      "Guided game drives",
      "Rhino viewing opportunities",
      "Chimpanzee sanctuary access nearby",
      "Birdwatching opportunities",
      "Walking safari arrangements",
      "Night game drive arrangements",
      "Photography-friendly setting",
      "Family-friendly accommodation",
      "Laundry service",
      "Transfer arrangements",
      "Private conservancy experience",
      "Mount Kenya views",
      "Ol Pejeta Conservancy access"
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
    'kicheche-laikipia-camp',
    'Kicheche Laikipia Camp',
    'Kicheche Laikipia Camp is an intimate luxury tented camp inside Ol Pejeta Conservancy, offering elegant tents, excellent wildlife access, rhino conservation experiences, guided activities, and scenic views of Mount Kenya.',
    jsonb_build_object(
      'html',
      $description$<p>Kicheche Laikipia Camp is a beautiful choice for travelers who want a more intimate and conservation-focused safari experience in Ol Pejeta Conservancy. Set within one of Kenya’s most important wildlife conservancies, the camp gives guests excellent access to rhino viewing, Big Five safari experiences, predator sightings, birdlife, and the famous Sweetwaters Chimpanzee Sanctuary.</p><p>For guests booking with Benroso Safaris, Kicheche Laikipia Camp is ideal for luxury Ol Pejeta safari packages, honeymoon safaris, private Kenya safaris, photography trips, and conservation safaris. It is especially suited to travelers who prefer a smaller camp with a personal safari feel, strong guiding, peaceful surroundings, and meaningful wildlife encounters.</p><p>The camp offers spacious safari tents, warm hospitality, open views, dining areas, and a relaxed bush atmosphere that feels close to nature without losing comfort. With Benroso Safaris, Kicheche Laikipia Camp can be included in premium Kenya safari circuits connecting Ol Pejeta with Samburu, Aberdare, Mount Kenya, Lake Nakuru, Maasai Mara, or Amboseli.</p>$description$
    ),
    'Kicheche Laikipia Camp',
    'Book Kicheche Laikipia Camp with Benroso Safaris for a luxury Ol Pejeta safari stay with rhinos, wildlife, guided activities, and Mount Kenya views.',
    'Kicheche Laikipia Camp',
    '["Kicheche Laikipia Camp Kenya","luxury Ol Pejeta camp","Ol Pejeta Conservancy accommodation","Laikipia safari camp","Kenya luxury safari accommodation"]'::jsonb,
    null,
    v_now
  );
end $$;
