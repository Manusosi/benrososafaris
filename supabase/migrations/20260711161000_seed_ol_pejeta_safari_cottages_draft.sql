-- Seed draft: Ol Pejeta Safari Cottages (map and gallery left for manual entry).

do $$
declare
  v_accommodation_id uuid := gen_random_uuid();
  v_destination_id uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.accommodation_translations
    where locale = 'en' and slug = 'ol-pejeta-safari-cottages'
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
    'Luxury Safari Cottage / Private Conservancy Accommodation',
    'luxury',
    'on_request',
    null,
    '[
      "Luxury private cottages",
      "En-suite bathrooms",
      "Private verandas",
      "Personalized dining",
      "Lounge and relaxation areas",
      "Garden and outdoor seating areas",
      "Private conservancy setting",
      "Full-board meal options",
      "Game drive access",
      "Rhino viewing opportunities",
      "Chimpanzee sanctuary access nearby",
      "Birdwatching opportunities",
      "Mount Kenya views",
      "Family-friendly accommodation",
      "Honeymoon-friendly setting",
      "Laundry service",
      "Transfer arrangements",
      "Private safari arrangements",
      "Reception support",
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
    'ol-pejeta-safari-cottages',
    'Ol Pejeta Safari Cottages',
    'Ol Pejeta Safari Cottages offer a private luxury stay inside Ol Pejeta Conservancy, with elegant cottages, personalized service, wildlife views, and excellent access to rhinos, chimpanzees, Big Five sightings, and Mount Kenya scenery.',
    jsonb_build_object(
      'html',
      $description$<p>Ol Pejeta Safari Cottages are ideal for travelers who want a more private and personalized safari experience inside one of Kenya’s leading wildlife conservancies. The cottages offer a peaceful setting within Ol Pejeta, giving guests close access to rhino conservation areas, the Sweetwaters Chimpanzee Sanctuary, predator territories, plains wildlife, and beautiful views toward Mount Kenya.</p><p>For guests booking with Benroso Safaris, Ol Pejeta Safari Cottages work well for luxury Ol Pejeta safari packages, family safaris, honeymoon stays, conservation-focused tours, and private Kenya safari itineraries. They are especially suitable for travelers who prefer space, privacy, flexible dining, and a quieter safari rhythm compared to larger lodge-style properties.</p><p>The cottages combine the comfort of a private home with the atmosphere of a wilderness safari stay. Guests can enjoy spacious interiors, verandas, dedicated hospitality, outdoor relaxation, and easy access to guided game drives within the conservancy. With Benroso Safaris, Ol Pejeta Safari Cottages can be included in premium Kenya safari circuits connecting Ol Pejeta with Aberdare, Mount Kenya, Samburu, Lake Nakuru, or Maasai Mara.</p>$description$
    ),
    'Ol Pejeta Safari Cottages',
    'Book Ol Pejeta Safari Cottages with Benroso Safaris for a private luxury stay inside Ol Pejeta with rhinos, wildlife, and Mount Kenya views.',
    'Ol Pejeta Safari Cottages',
    '["Ol Pejeta Safari Cottages Kenya","luxury Ol Pejeta accommodation","private safari cottages Kenya","Ol Pejeta Conservancy lodging","Kenya luxury safari accommodation"]'::jsonb,
    null,
    v_now
  );
end $$;
