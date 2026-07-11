-- Seed draft: Samburu Simba Lodge (map and gallery left for manual entry).

do $$
declare
  v_accommodation_id uuid := gen_random_uuid();
  v_destination_id uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.accommodation_translations
    where locale = 'en' and slug = 'samburu-simba-lodge'
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
      "Private balconies / verandas",
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
    'samburu-simba-lodge',
    'Samburu Simba Lodge',
    'Samburu Simba Lodge is a comfortable lodge near Samburu National Reserve, offering spacious rooms, scenic views, dining, a swimming pool, and easy access to northern Kenya wildlife safaris.',
    jsonb_build_object(
      'html',
      $description$<p>Samburu Simba Lodge is a welcoming safari stay for travelers who want comfort, value, and a scenic base near Samburu National Reserve. The lodge is well positioned for guests exploring Samburu’s rugged landscapes, riverine wildlife areas, and the rare northern species that make this destination different from Kenya’s more familiar southern safari parks.</p><p>For guests booking with Benroso Safaris, Samburu Simba Lodge works well for economy Samburu safari packages, family safaris, private Kenya road safaris, and northern circuit itineraries connecting Samburu with Ol Pejeta, Aberdare, Lake Nakuru, or Maasai Mara. It is especially suitable for travelers hoping to see the Samburu Special Five, elephants, lions, leopards, buffaloes, and rich birdlife.</p><p>The lodge offers a relaxed safari atmosphere with comfortable rooms, dining areas, a swimming pool, and outdoor spaces where guests can unwind after game drives. With Benroso Safaris, Samburu Simba Lodge can be included in short Samburu getaways and longer Kenya safari circuits for guests who want a practical, affordable, and rewarding stay in northern Kenya.</p>$description$
    ),
    'Samburu Simba Lodge',
    'Book Samburu Simba Lodge with Benroso Safaris for a comfortable Samburu safari stay with game drives, pool, dining, and northern wildlife.',
    'Samburu Simba Lodge',
    '["Samburu Simba Lodge Kenya","budget Samburu lodge","Samburu safari accommodation","northern Kenya safari lodge","Kenya safari accommodation"]'::jsonb,
    null,
    v_now
  );
end $$;
