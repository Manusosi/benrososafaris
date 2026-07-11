-- Seed draft: Fairmont Mount Kenya Safari Club (map and gallery left for manual entry).

do $$
declare
  v_accommodation_id uuid := gen_random_uuid();
  v_destination_id uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.accommodation_translations
    where locale = 'en' and slug = 'fairmont-mount-kenya-safari-club'
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
    'Mid-Range / Luxury Country Club Hotel',
    'mid-range',
    'on_request',
    null,
    '[
      "Elegant en-suite rooms and suites",
      "Restaurant",
      "Bar and lounge",
      "Outdoor swimming pool",
      "Spa and wellness facilities",
      "Fitness center",
      "Golf course access",
      "Horse riding arrangements",
      "Garden and outdoor seating areas",
      "Free Wi-Fi in public areas",
      "Private parking",
      "Room service",
      "Laundry service",
      "Conference and event facilities",
      "Family-friendly accommodation",
      "Children''s activities",
      "Nature walk arrangements",
      "Birdwatching opportunities",
      "Transfer arrangements",
      "Mount Kenya and Ol Pejeta safari access"
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
    'fairmont-mount-kenya-safari-club',
    'Fairmont Mount Kenya Safari Club',
    'Fairmont Mount Kenya Safari Club is a historic luxury retreat at the foot of Mount Kenya, offering elegant rooms, gardens, fine dining, leisure activities, and a scenic base for Mount Kenya, Ol Pejeta, and central Kenya safaris.',
    jsonb_build_object(
      'html',
      $description$<p>Fairmont Mount Kenya Safari Club is one of Kenya’s most iconic highland retreats, set against the beautiful backdrop of Mount Kenya. It is ideal for guests who want a refined countryside stay with fresh mountain air, manicured gardens, warm hospitality, and easy access to some of central Kenya’s best safari and outdoor experiences.</p><p>For guests booking with Benroso Safaris, Fairmont Mount Kenya Safari Club works well for Mount Kenya safari packages, luxury family holidays, honeymoon stopovers, golf and leisure trips, and Kenya road safari circuits connecting Mount Kenya with Ol Pejeta Conservancy, Aberdare National Park, Samburu, or Lake Nakuru. It is especially suitable for travelers who want comfort, history, scenery, and a relaxed pace between wildlife destinations.</p><p>The property blends classic elegance with modern resort-style comfort, offering spacious rooms and suites, fine dining, outdoor activities, wellness facilities, and beautiful views across the Mount Kenya region. With Benroso Safaris, Fairmont Mount Kenya Safari Club can be included in premium Kenya safari itineraries for guests who want a polished stay with mountain charm and easy access to wildlife, culture, and adventure.</p>$description$
    ),
    'Fairmont Mount Kenya Safari Club',
    'Book Fairmont Mount Kenya Safari Club with Benroso Safaris for a scenic Mount Kenya stay with gardens, dining, leisure, and safari access.',
    'Fairmont Mount Kenya Safari Club',
    '["Fairmont Mount Kenya Safari Club","Mount Kenya accommodation","luxury Mount Kenya hotel","Nanyuki safari hotel","Kenya safari accommodation"]'::jsonb,
    null,
    v_now
  );
end $$;
