-- Seed draft: Ashnil Samburu Camp (map and gallery left for manual entry).

do $$
declare
  v_accommodation_id uuid := gen_random_uuid();
  v_destination_id uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.accommodation_translations
    where locale = 'en' and slug = 'ashnil-samburu-camp'
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
      "Free Wi-Fi in selected areas",
      "Private parking",
      "Room service",
      "Laundry service",
      "Gift shop",
      "Family-friendly accommodation",
      "Full-board meal options",
      "Game drive access",
      "Birdwatching opportunities",
      "Samburu Special Five viewing",
      "Riverine wildlife viewing",
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
    'ashnil-samburu-camp',
    'Ashnil Samburu Camp',
    'Ashnil Samburu Camp is a comfortable tented safari camp in Samburu National Reserve, offering riverside tents, dining, a pool, and excellent access to game drives, elephants, big cats, and the Samburu Special Five.',
    jsonb_build_object(
      'html',
      $description$<p>Ashnil Samburu Camp is a beautiful safari base for travelers who want to experience the wild beauty of Samburu National Reserve while enjoying the comfort of a well-appointed tented camp. Set in a scenic part of Samburu, the camp gives guests easy access to game drive routes, riverine landscapes, and the rare wildlife species that make northern Kenya so special.</p><p>For guests booking with Benroso Safaris, Ashnil Samburu Camp works well for mid-range Samburu safari packages, family safaris, private Kenya safaris, photography trips, and northern circuit itineraries that connect Samburu with Ol Pejeta, Aberdare, Lake Nakuru, or Maasai Mara. It is especially suitable for travelers looking to see elephants, lions, leopards, cheetahs, and the Samburu Special Five.</p><p>The camp offers a classic tented safari feel with en-suite tents, outdoor relaxation areas, a restaurant, bar, and swimming pool where guests can rest after a day in the reserve. With Benroso Safaris, Ashnil Samburu Camp can be included in short Samburu getaways or longer Kenya safari routes for travelers who want comfort, wildlife, and a true northern Kenya safari atmosphere.</p>$description$
    ),
    'Ashnil Samburu Camp',
    'Book Ashnil Samburu Camp with Benroso Safaris for a mid-range Samburu safari stay with tented rooms, pool, dining, and wildlife access.',
    'Ashnil Samburu Camp',
    '["Ashnil Samburu Camp Kenya","Samburu tented camp","mid-range Samburu accommodation","Samburu National Reserve camp","Kenya safari accommodation"]'::jsonb,
    null,
    v_now
  );
end $$;
