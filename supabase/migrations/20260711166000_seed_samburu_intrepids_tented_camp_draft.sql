-- Seed draft: Samburu Intrepids Tented Camp (map and gallery left for manual entry).

do $$
declare
  v_accommodation_id uuid := gen_random_uuid();
  v_destination_id uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.accommodation_translations
    where locale = 'en' and slug = 'samburu-intrepids-tented-camp'
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
      "Family-friendly accommodation",
      "Children''s activities",
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
    'samburu-intrepids-tented-camp',
    'Samburu Intrepids Tented Camp',
    'Samburu Intrepids Tented Camp is a comfortable riverside safari camp in Samburu, offering spacious tents, dining, a pool, family-friendly facilities, and excellent access to northern Kenya wildlife.',
    jsonb_build_object(
      'html',
      $description$<p>Samburu Intrepids Tented Camp is a great choice for travelers who want a classic tented safari experience in Samburu National Reserve with comfort, scenery, and reliable access to game drives. Its riverside setting gives guests a calm safari atmosphere, with the landscapes of northern Kenya creating a beautiful backdrop throughout the stay.</p><p>For guests booking with Benroso Safaris, Samburu Intrepids Tented Camp works well for mid-range Samburu safari packages, family safaris, private Kenya safaris, photography trips, and northern circuit itineraries connecting Samburu with Ol Pejeta, Aberdare, Lake Nakuru, or Maasai Mara. It is especially suitable for travelers hoping to see elephants, big cats, rich birdlife, and the famous Samburu Special Five.</p><p>The camp combines the charm of safari tents with the convenience of lodge-style facilities, making it suitable for couples, families, and first-time safari guests. With Benroso Safaris, Samburu Intrepids Tented Camp can be included in short Samburu getaways or longer Kenya safari routes for guests who want comfort, wildlife, and a memorable northern Kenya safari experience.</p>$description$
    ),
    'Samburu Intrepids Tented Camp',
    'Book Samburu Intrepids Tented Camp with Benroso Safaris for a mid-range Samburu stay with tents, pool, dining, and wildlife access.',
    'Samburu Intrepids Tented Camp',
    '["Samburu Intrepids Tented Camp Kenya","Samburu tented camp","mid-range Samburu accommodation","Samburu safari lodge","Kenya safari accommodation"]'::jsonb,
    null,
    v_now
  );
end $$;
