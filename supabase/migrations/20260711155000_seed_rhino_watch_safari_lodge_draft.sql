-- Seed draft: Rhino Watch Safari Lodge (map and gallery left for manual entry).

do $$
declare
  v_accommodation_id uuid := gen_random_uuid();
  v_destination_id uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.accommodation_translations
    where locale = 'en' and slug = 'rhino-watch-safari-lodge'
  ) then
    return;
  end if;

  select d.id
  into v_destination_id
  from public.destinations d
  join public.destination_translations dt on dt.destination_id = d.id
  where dt.locale = 'en' and dt.slug = 'aberdare-national-park'
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
    'Aberdare National Park',
    v_destination_id,
    'Economy Safari Lodge',
    'economy',
    'on_request',
    null,
    '[
      "Comfortable guest rooms",
      "Cottage-style accommodation",
      "En-suite bathrooms",
      "Restaurant",
      "Bar and lounge",
      "Outdoor swimming pool",
      "Garden and outdoor seating areas",
      "Free Wi-Fi in selected areas",
      "Private parking",
      "Room service",
      "Laundry service",
      "Conference and event facilities",
      "Family-friendly accommodation",
      "Children''s play area",
      "Breakfast and meal options",
      "Birdwatching opportunities",
      "Nature walk arrangements nearby",
      "Transfer arrangements",
      "Reception support",
      "Aberdare safari access"
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
    'rhino-watch-safari-lodge',
    'Rhino Watch Safari Lodge',
    'Rhino Watch Safari Lodge is a peaceful and affordable safari stay near Aberdare National Park, offering cozy rooms, gardens, mountain views, and a convenient base for wildlife adventures and Kenya highlands safaris.',
    jsonb_build_object(
      'html',
      $description$<p>Rhino Watch Safari Lodge is a lovely choice for travelers looking for affordable comfort near Aberdare National Park and the central Kenya highlands. Set in the scenic Mweiga area, the lodge gives guests a calm countryside atmosphere with easy access to Aberdare’s forests, waterfalls, wildlife, and nearby attractions such as Solio Ranch and Mount Kenya routes.</p><p>For guests booking with Benroso Safaris, Rhino Watch Safari Lodge works well for economy Aberdare safari packages, family stopovers, Kenya road safaris, birdwatching trips, and safari circuits that connect Aberdare with Ol Pejeta, Lake Nakuru, Samburu, or Maasai Mara. It is especially suitable for travelers who want a relaxed overnight stay in a peaceful setting without stretching their accommodation budget.</p><p>The lodge offers a warm and simple safari atmosphere with comfortable rooms, cottage-style accommodation, gardens, dining spaces, and outdoor areas where guests can unwind after a day of exploring. With Benroso Safaris, Rhino Watch Safari Lodge can be included in short Aberdare getaways and longer Kenya safari itineraries for guests who value scenery, accessibility, and good value.</p>$description$
    ),
    'Rhino Watch Safari Lodge',
    'Book Rhino Watch Safari Lodge with Benroso Safaris for affordable accommodation near Aberdare National Park with comfort, gardens, and safari access.',
    'Rhino Watch Safari Lodge',
    '["Rhino Watch Safari Lodge Kenya","Aberdare accommodation","budget safari lodge in Kenya","Mweiga safari lodge","affordable Aberdare lodge"]'::jsonb,
    null,
    v_now
  );
end $$;
