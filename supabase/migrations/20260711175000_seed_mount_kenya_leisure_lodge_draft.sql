-- Seed draft: Mount Kenya Leisure Lodge (map and gallery left for manual entry).

do $$
declare
  v_accommodation_id uuid := gen_random_uuid();
  v_destination_id uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.accommodation_translations
    where locale = 'en' and slug = 'mount-kenya-leisure-lodge'
  ) then
    return;
  end if;

  select d.id
  into v_destination_id
  from public.destinations d
  join public.destination_translations dt on dt.destination_id = d.id
  where dt.locale = 'en' and dt.slug = 'mount-kenya'
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
    'Mount Kenya',
    v_destination_id,
    'Luxury Mountain Lodge / Safari Lodge',
    'luxury',
    'on_request',
    null,
    '[
      "Comfortable en-suite rooms",
      "Restaurant",
      "Bar and lounge",
      "Garden and outdoor seating areas",
      "Private parking",
      "Free Wi-Fi in selected areas",
      "Room service",
      "Laundry service",
      "Family-friendly accommodation",
      "Breakfast and meal options",
      "Conference and event facilities",
      "Nature walk arrangements nearby",
      "Birdwatching opportunities",
      "Hiking access nearby",
      "Mountain views",
      "Transfer arrangements",
      "Reception support",
      "Nanyuki access",
      "Ol Pejeta safari access",
      "Mount Kenya adventure access"
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
    'mount-kenya-leisure-lodge',
    'Mount Kenya Leisure Lodge',
    'Mount Kenya Leisure Lodge is a luxury highland retreat near Mount Kenya, offering comfortable rooms, scenic views, dining, gardens, and a peaceful base for mountain adventures, Ol Pejeta safaris, and central Kenya travel.',
    jsonb_build_object(
      'html',
      $description$<p>Mount Kenya Leisure Lodge is a relaxing choice for travelers who want comfort, scenery, and a quiet highland atmosphere around the Mount Kenya region. It is well suited for guests who enjoy fresh mountain air, open landscapes, and easy access to outdoor activities, nature experiences, and nearby safari destinations.</p><p>For guests booking with Benroso Safaris, Mount Kenya Leisure Lodge works well for luxury Mount Kenya accommodation, honeymoon stopovers, family retreats, private Kenya safaris, and central Kenya itineraries connecting Mount Kenya with Ol Pejeta Conservancy, Aberdare National Park, Samburu, or Lake Nakuru. It is especially suitable for travelers who want a comfortable lodge stay before or after hiking, game drives, or scenic road safaris.</p><p>The lodge offers a calm and welcoming environment with guest rooms, dining spaces, outdoor relaxation areas, and beautiful surroundings that make it easy to slow down between safari destinations. With Benroso Safaris, Mount Kenya Leisure Lodge can be included in premium Kenya safari circuits for guests who want a smooth balance of comfort, nature, and adventure.</p>$description$
    ),
    'Mount Kenya Leisure Lodge',
    'Book Mount Kenya Leisure Lodge with Benroso Safaris for a luxury highland stay near Mount Kenya, Nanyuki, and Ol Pejeta safari routes.',
    'Mount Kenya Leisure Lodge',
    '["Mount Kenya Leisure Lodge","luxury Mount Kenya accommodation","Nanyuki safari lodge","Mount Kenya lodge","Kenya safari accommodation"]'::jsonb,
    null,
    v_now
  );
end $$;
