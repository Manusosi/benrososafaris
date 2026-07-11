-- Update draft: Naro Moru River Lodge (revised content).

do $$
declare
  v_accommodation_id uuid;
  v_destination_id uuid;
  v_now timestamptz := now();
begin
  select at.accommodation_id
  into v_accommodation_id
  from public.accommodation_translations at
  where at.locale = 'en' and at.slug = 'naro-moru-river-lodge'
  limit 1;

  select d.id
  into v_destination_id
  from public.destinations d
  join public.destination_translations dt on dt.destination_id = d.id
  where dt.locale = 'en' and dt.slug = 'mount-kenya'
  limit 1;

  if v_accommodation_id is null then
    v_accommodation_id := gen_random_uuid();

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
      'Economy Lodge / Mountain Safari Lodge',
      'economy',
      'on_request',
      null,
      '[
        "Comfortable guest rooms",
        "En-suite bathrooms",
        "Restaurant",
        "Bar and lounge",
        "Garden and outdoor seating areas",
        "Swimming pool",
        "Private parking",
        "Free Wi-Fi in selected areas",
        "Room service",
        "Laundry service",
        "Conference and event facilities",
        "Family-friendly accommodation",
        "Breakfast and meal options",
        "Mount Kenya hiking access",
        "Nature walk arrangements",
        "Birdwatching opportunities",
        "Team-building facilities",
        "Transfer arrangements",
        "Reception support",
        "Central Kenya safari access"
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
      'naro-moru-river-lodge',
      'Naro Moru River Lodge',
      'Naro Moru River Lodge is a scenic Mount Kenya lodge offering affordable comfort, gardens, dining, outdoor activities, and a convenient base for Mount Kenya hikes, Ol Pejeta visits, and central Kenya safari circuits.',
      jsonb_build_object(
        'html',
        $description$<p>Naro Moru River Lodge is a practical and scenic stay for travelers exploring the Mount Kenya region. Its highland setting makes it a good base for guests interested in Mount Kenya hiking, nature walks, birdwatching, and central Kenya safari routes. It is especially suitable for travelers who want a relaxed lodge atmosphere with easy access to both mountain adventure and nearby wildlife destinations.</p><p>For guests booking with Benroso Safaris, Naro Moru River Lodge works well for economy Mount Kenya accommodation, hiking stopovers, family trips, group travel, and Kenya safari circuits connecting Mount Kenya with Ol Pejeta Conservancy, Aberdare National Park, Samburu, or Lake Nakuru. It gives guests a comfortable place to rest before or after outdoor activities without stretching the accommodation budget.</p><p>The lodge offers a countryside feel with spacious grounds, comfortable rooms, dining areas, gardens, and outdoor relaxation spaces. With Benroso Safaris, Naro Moru River Lodge can be included in Mount Kenya climbing itineraries, scenic central Kenya getaways, and longer safari packages designed around wildlife, landscapes, and smooth travel between destinations.</p>$description$
      ),
      'Naro Moru River Lodge',
      'Book Naro Moru River Lodge with Benroso Safaris for affordable Mount Kenya accommodation near hiking routes, nature trails, and safari circuits.',
      'Naro Moru River Lodge',
      '["Naro Moru River Lodge Kenya","Mount Kenya accommodation","budget Mount Kenya lodge","Naro Moru safari lodge","Kenya mountain lodge"]'::jsonb,
      null,
      v_now
    );

    return;
  end if;

  update public.accommodations
  set
    country = 'Kenya',
    region = 'Mount Kenya',
    destination_id = v_destination_id,
    property_type = 'Economy Lodge / Mountain Safari Lodge',
    comfort_level = 'economy',
    availability = 'on_request',
    amenities = '[
      "Comfortable guest rooms",
      "En-suite bathrooms",
      "Restaurant",
      "Bar and lounge",
      "Garden and outdoor seating areas",
      "Swimming pool",
      "Private parking",
      "Free Wi-Fi in selected areas",
      "Room service",
      "Laundry service",
      "Conference and event facilities",
      "Family-friendly accommodation",
      "Breakfast and meal options",
      "Mount Kenya hiking access",
      "Nature walk arrangements",
      "Birdwatching opportunities",
      "Team-building facilities",
      "Transfer arrangements",
      "Reception support",
      "Central Kenya safari access"
    ]'::jsonb,
    updated_at = v_now
  where id = v_accommodation_id;

  update public.accommodation_translations
  set
    name = 'Naro Moru River Lodge',
    summary = 'Naro Moru River Lodge is a scenic Mount Kenya lodge offering affordable comfort, gardens, dining, outdoor activities, and a convenient base for Mount Kenya hikes, Ol Pejeta visits, and central Kenya safari circuits.',
    description = jsonb_build_object(
      'html',
      $description$<p>Naro Moru River Lodge is a practical and scenic stay for travelers exploring the Mount Kenya region. Its highland setting makes it a good base for guests interested in Mount Kenya hiking, nature walks, birdwatching, and central Kenya safari routes. It is especially suitable for travelers who want a relaxed lodge atmosphere with easy access to both mountain adventure and nearby wildlife destinations.</p><p>For guests booking with Benroso Safaris, Naro Moru River Lodge works well for economy Mount Kenya accommodation, hiking stopovers, family trips, group travel, and Kenya safari circuits connecting Mount Kenya with Ol Pejeta Conservancy, Aberdare National Park, Samburu, or Lake Nakuru. It gives guests a comfortable place to rest before or after outdoor activities without stretching the accommodation budget.</p><p>The lodge offers a countryside feel with spacious grounds, comfortable rooms, dining areas, gardens, and outdoor relaxation spaces. With Benroso Safaris, Naro Moru River Lodge can be included in Mount Kenya climbing itineraries, scenic central Kenya getaways, and longer safari packages designed around wildlife, landscapes, and smooth travel between destinations.</p>$description$
    ),
    seo_title = 'Naro Moru River Lodge',
    seo_description = 'Book Naro Moru River Lodge with Benroso Safaris for affordable Mount Kenya accommodation near hiking routes, nature trails, and safari circuits.',
    focus_keyword = 'Naro Moru River Lodge',
    keywords = '["Naro Moru River Lodge Kenya","Mount Kenya accommodation","budget Mount Kenya lodge","Naro Moru safari lodge","Kenya mountain lodge"]'::jsonb,
    updated_at = v_now
  where accommodation_id = v_accommodation_id and locale = 'en';
end $$;
