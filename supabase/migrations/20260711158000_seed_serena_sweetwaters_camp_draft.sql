-- Seed draft: Serena Sweetwaters Camp (map and gallery left for manual entry).

do $$
declare
  v_accommodation_id uuid := gen_random_uuid();
  v_destination_id uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.accommodation_translations
    where locale = 'en' and slug = 'serena-sweetwaters-camp'
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
    'Mid-Range Tented Safari Camp',
    'mid-range',
    'on_request',
    null,
    '[
      "En-suite safari tents",
      "Private verandas",
      "Restaurant",
      "Bar and lounge",
      "Outdoor swimming pool",
      "Garden and outdoor seating areas",
      "Free Wi-Fi in public areas",
      "Private parking",
      "Room service",
      "Laundry service",
      "Gift shop",
      "Conference facilities",
      "Family-friendly accommodation",
      "Full-board meal options",
      "Game drive access",
      "Rhino viewing opportunities",
      "Chimpanzee sanctuary access nearby",
      "Birdwatching opportunities",
      "Mount Kenya views",
      "Transfer arrangements"
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
    'serena-sweetwaters-camp',
    'Serena Sweetwaters Camp',
    'Serena Sweetwaters Camp is a comfortable tented safari camp inside Ol Pejeta Conservancy, offering scenic views, en-suite tents, dining, a pool, and excellent access to rhinos, chimpanzees, and Big Five wildlife.',
    jsonb_build_object(
      'html',
      $description$<p>Serena Sweetwaters Camp is one of the most popular safari stays inside Ol Pejeta Conservancy, giving guests direct access to one of Kenya’s most rewarding wildlife destinations. The camp sits in a beautiful conservancy setting with views toward Mount Kenya, making it a great choice for travelers who want comfort, scenery, and strong wildlife viewing in one place.</p><p>For guests booking with Benroso Safaris, Serena Sweetwaters Camp works well for mid-range Ol Pejeta safari packages, family safaris, private Kenya safaris, rhino conservation tours, and central Kenya itineraries connecting Aberdare, Samburu, Lake Nakuru, or Maasai Mara. It is especially suitable for guests interested in rhino sightings, the Sweetwaters Chimpanzee Sanctuary, predator viewing, and conservation-focused safari experiences.</p><p>The camp combines the charm of tented safari accommodation with the reliability of a well-managed lodge experience. Guests can relax in spacious en-suite tents, enjoy meals at the restaurant, unwind by the pool, and take part in guided safari activities within the conservancy. With Benroso Safaris, Serena Sweetwaters Camp can be included in short Ol Pejeta getaways or longer Kenya safari circuits for guests who want wildlife, comfort, and conservation value.</p>$description$
    ),
    'Serena Sweetwaters Camp',
    'Book Serena Sweetwaters Camp with Benroso Safaris for a mid-range Ol Pejeta stay with tents, wildlife, rhinos, chimpanzees, and game drives.',
    'Serena Sweetwaters Camp',
    '["Serena Sweetwaters Camp Kenya","Ol Pejeta safari camp","Sweetwaters accommodation","mid-range Ol Pejeta lodge","Kenya safari accommodation"]'::jsonb,
    null,
    v_now
  );
end $$;
