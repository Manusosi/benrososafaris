-- Seed draft: Jambo Mutara Camp (map and gallery left for manual entry).

do $$
declare
  v_accommodation_id uuid := gen_random_uuid();
  v_destination_id uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.accommodation_translations
    where locale = 'en' and slug = 'jambo-mutara-camp'
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
    'Luxury Safari Camp / Tented Conservancy Camp',
    'luxury',
    'on_request',
    null,
    '[
      "Luxury en-suite safari tents",
      "Private verandas",
      "Restaurant",
      "Bar and lounge",
      "Outdoor swimming pool",
      "Garden and outdoor seating areas",
      "Free Wi-Fi in selected areas",
      "Private parking",
      "Room service",
      "Laundry service",
      "Family-friendly accommodation",
      "Full-board meal options",
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
    'jambo-mutara-camp',
    'Jambo Mutara Camp',
    'Jambo Mutara Camp is a luxury tented safari camp near Ol Pejeta Conservancy, offering elegant tents, scenic wilderness views, dining, a pool, and access to rhino, Big Five, and Mount Kenya safari experiences.',
    jsonb_build_object(
      'html',
      $description$<p>Jambo Mutara Camp is a refined safari stay for travelers who want comfort, privacy, and a peaceful conservancy-style atmosphere near Ol Pejeta Conservancy. Set in the greater Laikipia and Mount Kenya safari region, the camp gives guests a beautiful base for wildlife viewing, relaxation, and scenic central Kenya adventures.</p><p>For guests booking with Benroso Safaris, Jambo Mutara Camp works well for luxury Ol Pejeta safari packages, honeymoon safaris, private Kenya safaris, family getaways, and conservation-focused itineraries. It is especially suitable for travelers who want to explore Ol Pejeta’s rhinos, chimpanzee sanctuary, predators, plains wildlife, and Mount Kenya views while returning to a calm and stylish camp.</p><p>The camp offers spacious luxury tents, warm hospitality, outdoor relaxation areas, a swimming pool, and dining spaces designed for guests who want a more elevated safari feel. With Benroso Safaris, Jambo Mutara Camp can be included in premium central Kenya safari circuits connecting Ol Pejeta with Aberdare, Mount Kenya, Samburu, Lake Nakuru, or Maasai Mara.</p>$description$
    ),
    'Jambo Mutara Camp',
    'Book Jambo Mutara Camp with Benroso Safaris for a luxury Ol Pejeta safari stay near rhinos, Big Five wildlife, and Mount Kenya views.',
    'Jambo Mutara Camp',
    '["Jambo Mutara Camp Kenya","luxury Ol Pejeta camp","Laikipia safari accommodation","Ol Pejeta safari lodge","Kenya luxury safari camp"]'::jsonb,
    null,
    v_now
  );
end $$;
