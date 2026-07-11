-- Seed draft: Elsamere Lodge (map and gallery left for manual entry).

do $$
declare
  v_accommodation_id uuid := gen_random_uuid();
  v_destination_id uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.accommodation_translations
    where locale = 'en' and slug = 'elsamere-lodge'
  ) then
    return;
  end if;

  select d.id
  into v_destination_id
  from public.destinations d
  join public.destination_translations dt on dt.destination_id = d.id
  where dt.locale = 'en' and dt.slug = 'lake-naivasha'
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
    'Lake Naivasha',
    v_destination_id,
    'Economy Lodge / Lakeside Heritage Lodge',
    'economy',
    'on_request',
    null,
    '[
      "Comfortable guest rooms",
      "En-suite bathrooms",
      "Restaurant",
      "Tea garden",
      "Lakeside gardens",
      "Outdoor seating areas",
      "Birdwatching opportunities",
      "Lake views",
      "Free Wi-Fi in selected areas",
      "Private parking",
      "Laundry service",
      "Family-friendly accommodation",
      "Boat ride arrangements",
      "Crescent Island access nearby",
      "Hell''s Gate National Park access",
      "Guided nature activities nearby",
      "Conference and retreat facilities",
      "Transfer arrangements",
      "Reception support",
      "Peaceful heritage setting"
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
    'elsamere-lodge',
    'Elsamere Lodge',
    'Elsamere Lodge is a peaceful heritage stay on the shores of Lake Naivasha, offering lakeside views, gardens, birdlife, warm hospitality, and easy access to Crescent Island, Hell’s Gate, and Rift Valley safari experiences.',
    jsonb_build_object(
      'html',
      $description$<p>Elsamere Lodge is a charming lakeside accommodation on the shores of Lake Naivasha, best known for its peaceful gardens, relaxed atmosphere, and strong connection to Kenya’s conservation history. It is a great choice for travelers who want a quiet, nature-filled stay close to the lake while enjoying easy access to boat rides, birdwatching, Crescent Island, and Hell’s Gate National Park.</p><p>For guests booking with Benroso Safaris, Elsamere Lodge works well for economy Lake Naivasha safari packages, family stopovers, birdwatching trips, romantic retreats, and Kenya road safari itineraries connecting Maasai Mara, Lake Nakuru, Amboseli, or Nairobi. Its lakeside setting makes it especially suitable for guests who want a slower, more scenic break between major safari destinations.</p><p>The lodge offers simple comfort in a historic and natural environment, with guest rooms, dining spaces, outdoor seating areas, and beautiful lakefront gardens where visitors can relax after a day of exploring. With Benroso Safaris, Elsamere Lodge can be included in short Lake Naivasha getaways, Rift Valley circuits, and longer Kenya safari holidays designed for wildlife, scenery, and relaxed travel.</p>$description$
    ),
    'Elsamere Lodge',
    'Book Elsamere Lodge with Benroso Safaris for a peaceful Lake Naivasha stay with gardens, birdlife, lake views, and nearby safari activities.',
    'Elsamere Lodge',
    '["Elsamere Lodge Kenya","Lake Naivasha accommodation","budget lodge in Naivasha","lakeside lodge Kenya","Kenya safari accommodation"]'::jsonb,
    null,
    v_now
  );
end $$;
