-- Seed draft: Leopard Rock Lodge (map and gallery left for manual entry).

do $$
declare
  v_accommodation_id uuid := gen_random_uuid();
  v_destination_id uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.accommodation_translations
    where locale = 'en' and slug = 'leopard-rock-lodge'
  ) then
    return;
  end if;

  select d.id
  into v_destination_id
  from public.destinations d
  join public.destination_translations dt on dt.destination_id = d.id
  where dt.locale = 'en' and dt.slug = 'meru-national-park'
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
    'Meru National Park',
    v_destination_id,
    'Mid-Range Safari Lodge',
    'mid-range',
    'on_request',
    null,
    '[
      "Comfortable en-suite rooms",
      "Restaurant",
      "Bar and lounge",
      "Outdoor seating areas",
      "Garden and relaxation spaces",
      "Private parking",
      "Free Wi-Fi in selected areas",
      "Room service",
      "Laundry service",
      "Family-friendly accommodation",
      "Breakfast and meal options",
      "Full-board meal options",
      "Game drive access",
      "Birdwatching opportunities",
      "Nature-focused setting",
      "Transfer arrangements",
      "Reception support",
      "Meru National Park access",
      "Safari planning support",
      "Relaxed lodge atmosphere"
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
    'leopard-rock-lodge',
    'Leopard Rock Lodge',
    'Leopard Rock Lodge is a comfortable safari lodge near Meru National Park, offering peaceful accommodation, dining, outdoor relaxation areas, and convenient access to game drives in one of Kenya’s most scenic and less-crowded parks.',
    jsonb_build_object(
      'html',
      $description$<p>Leopard Rock Lodge is a good choice for travelers looking for a calm and comfortable stay while exploring Meru National Park. The lodge offers a relaxed safari atmosphere close to Meru’s wilderness, a destination known for open plains, riverine forests, scenic landscapes, and rewarding wildlife experiences away from the busier safari routes.</p><p>For guests booking with Benroso Safaris, Leopard Rock Lodge works well for mid-range Meru safari packages, private Kenya safaris, family trips, birdwatching tours, and central Kenya safari circuits connecting Meru with Samburu, Ol Pejeta, Aberdare, or Mount Kenya. It is especially suitable for travelers who want a quieter safari destination with a strong sense of space and wilderness.</p><p>The lodge provides comfortable accommodation, dining facilities, and outdoor areas where guests can unwind after game drives. With Benroso Safaris, Leopard Rock Lodge can be included in short Meru getaways or longer Kenya safari itineraries for guests who want value, scenery, and a more peaceful safari experience.</p>$description$
    ),
    'Leopard Rock Lodge',
    'Book Leopard Rock Lodge with Benroso Safaris for a mid-range Meru safari stay near Meru National Park with dining, comfort, and game drives.',
    'Leopard Rock Lodge',
    '["Leopard Rock Lodge Kenya","Meru National Park accommodation","mid-range Meru lodge","Kenya safari lodge","Meru safari accommodation"]'::jsonb,
    null,
    v_now
  );
end $$;
