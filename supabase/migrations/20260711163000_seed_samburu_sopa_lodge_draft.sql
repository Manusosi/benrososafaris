-- Seed draft: Samburu Sopa Lodge (map and gallery left for manual entry).

do $$
declare
  v_accommodation_id uuid := gen_random_uuid();
  v_destination_id uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.accommodation_translations
    where locale = 'en' and slug = 'samburu-sopa-lodge'
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
    'Economy Safari Lodge',
    'economy',
    'on_request',
    null,
    '[
      "Spacious en-suite rooms",
      "Private verandas / balconies",
      "Restaurant",
      "Bar and lounge",
      "Outdoor swimming pool",
      "Garden and outdoor seating areas",
      "Free Wi-Fi in selected areas",
      "Private parking",
      "Room service",
      "Laundry service",
      "Gift shop",
      "Conference facilities",
      "Family-friendly accommodation",
      "Full-board meal options",
      "Game drive access",
      "Birdwatching opportunities",
      "Samburu Special Five viewing",
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
    'samburu-sopa-lodge',
    'Samburu Sopa Lodge',
    'Samburu Sopa Lodge is a comfortable safari lodge in Samburu, offering spacious rooms, warm hospitality, dining, a pool, and easy access to game drives in one of Kenya’s most unique northern wildlife reserves.',
    jsonb_build_object(
      'html',
      $description$<p>Samburu Sopa Lodge is a practical and comfortable choice for travelers exploring Samburu National Reserve, a destination loved for its dramatic landscapes, open plains, riverine forests, and rare northern species. The lodge offers a relaxed safari base where guests can enjoy the beauty of Samburu while staying within easy reach of rewarding game drive areas.</p><p>For guests booking with Benroso Safaris, Samburu Sopa Lodge works well for economy Samburu safari packages, family trips, private Kenya safaris, and northern Kenya safari circuits connecting Samburu with Ol Pejeta, Aberdare, Lake Nakuru, or Maasai Mara. It is especially suitable for travelers who want to see the Samburu Special Five, including Grevy’s zebra, reticulated giraffe, Somali ostrich, gerenuk, and beisa oryx.</p><p>The lodge offers spacious rooms, dining areas, a swimming pool, gardens, and outdoor relaxation spaces where guests can unwind after morning and afternoon game drives. With Benroso Safaris, Samburu Sopa Lodge can be included in short Samburu getaways and longer Kenya safari itineraries for guests who want comfort, value, and access to a truly different safari landscape.</p>$description$
    ),
    'Samburu Sopa Lodge',
    'Book Samburu Sopa Lodge with Benroso Safaris for a comfortable Samburu safari stay with game drives, pool, dining, and northern Kenya wildlife.',
    'Samburu Sopa Lodge',
    '["Samburu Sopa Lodge Kenya","Samburu safari lodge","budget Samburu accommodation","Samburu National Reserve lodge","Kenya safari accommodation"]'::jsonb,
    null,
    v_now
  );
end $$;
