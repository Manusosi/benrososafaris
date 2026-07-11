-- Seed draft: Sarova Shaba Game Lodge (map and gallery left for manual entry).

do $$
declare
  v_accommodation_id uuid := gen_random_uuid();
  v_destination_id uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.accommodation_translations
    where locale = 'en' and slug = 'sarova-shaba-game-lodge'
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
    'Shaba National Reserve',
    v_destination_id,
    'Mid-Range Safari Lodge',
    'mid-range',
    'on_request',
    null,
    '[
      "Comfortable en-suite rooms",
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
      "Riverine wildlife viewing",
      "Transfer arrangements",
      "Shaba and Samburu safari access"
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
    'sarova-shaba-game-lodge',
    'Sarova Shaba Game Lodge',
    'Sarova Shaba Game Lodge is a scenic safari lodge in Shaba National Reserve near Samburu, offering riverside accommodation, dining, a pool, gardens, and access to northern Kenya wildlife experiences.',
    jsonb_build_object(
      'html',
      $description$<p>Sarova Shaba Game Lodge is a beautiful choice for travelers exploring the Samburu and Shaba safari region, where rugged landscapes, riverine forests, and rare northern wildlife create a very different safari experience from Kenya’s southern parks. The lodge offers a peaceful setting with the Ewaso Nyiro ecosystem nearby, giving guests a relaxed base for game drives and nature-focused travel.</p><p>For guests booking with Benroso Safaris, Sarova Shaba Game Lodge works well for mid-range Samburu safari packages, family safaris, private Kenya safaris, photography trips, and northern circuit itineraries connecting Samburu with Ol Pejeta, Aberdare, Lake Nakuru, or Maasai Mara. It is especially suitable for travelers interested in elephants, big cats, birdlife, and the Samburu Special Five.</p><p>The lodge combines comfort, space, and classic safari hospitality, with rooms designed for relaxation after a day in the reserve. With Benroso Safaris, Sarova Shaba Game Lodge can be included in Samburu and Shaba safari programs for guests who want a quieter northern Kenya stay with good facilities, scenic surroundings, and rewarding wildlife access.</p>$description$
    ),
    'Sarova Shaba Game Lodge',
    'Book Sarova Shaba Game Lodge with Benroso Safaris for a scenic northern Kenya safari stay near Samburu with dining, pool, and game drives.',
    'Sarova Shaba Game Lodge',
    '["Sarova Shaba Game Lodge Kenya","Shaba safari lodge","Samburu safari accommodation","northern Kenya safari lodge","Kenya safari accommodation"]'::jsonb,
    null,
    v_now
  );
end $$;
