-- Seed draft: Glamping Kenya Mount Kenya Lodge (map and gallery left for manual entry).

do $$
declare
  v_accommodation_id uuid := gen_random_uuid();
  v_destination_id uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.accommodation_translations
    where locale = 'en' and slug = 'glamping-kenya-mount-kenya-lodge'
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
    'Mid-Range Glamping Lodge / Mountain Lodge',
    'mid-range',
    'on_request',
    null,
    '[
      "Comfortable glamping-style accommodation",
      "En-suite bathrooms",
      "Restaurant / dining area",
      "Outdoor seating areas",
      "Garden and nature spaces",
      "Private parking",
      "Free Wi-Fi in selected areas",
      "Breakfast and meal options",
      "Family-friendly accommodation",
      "Nature walk arrangements nearby",
      "Birdwatching opportunities",
      "Hiking access nearby",
      "Mountain views",
      "Bonfire / outdoor relaxation areas",
      "Transfer arrangements",
      "Reception support",
      "Nanyuki access",
      "Ol Pejeta safari access",
      "Mount Kenya adventure access",
      "Peaceful countryside setting"
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
    'glamping-kenya-mount-kenya-lodge',
    'Glamping Kenya Mount Kenya Lodge',
    'Glamping Kenya Mount Kenya Lodge offers a comfortable nature stay near Mount Kenya, combining outdoor charm, scenic views, cozy accommodation, and easy access to hiking, nature walks, Nanyuki, and central Kenya safari routes.',
    jsonb_build_object(
      'html',
      $description$<p>Glamping Kenya Mount Kenya Lodge is a good choice for travelers who want a relaxed nature-based stay around the Mount Kenya region without choosing a traditional hotel. It offers a more outdoorsy experience, ideal for guests who enjoy scenery, fresh highland air, quiet surroundings, and a slower travel pace between safari destinations.</p><p>For guests booking with Benroso Safaris, Glamping Kenya Mount Kenya Lodge works well for mid-range Mount Kenya accommodation, couple getaways, family trips, hiking stopovers, nature retreats, and Kenya road safari circuits connecting Mount Kenya with Ol Pejeta Conservancy, Aberdare National Park, Samburu, or Lake Nakuru. It is especially suitable for travelers who want something simple, scenic, and different from the usual lodge experience.</p><p>The property gives guests a comfortable base for enjoying Mount Kenya’s landscapes, nearby trails, birdlife, and central Kenya attractions. With Benroso Safaris, Glamping Kenya Mount Kenya Lodge can be included in short Mount Kenya escapes, outdoor adventure itineraries, and longer safari packages designed around wildlife, nature, and relaxed travel.</p>$description$
    ),
    'Glamping Kenya Mount Kenya Lodge',
    'Book Glamping Kenya Mount Kenya Lodge with Benroso Safaris for a scenic Mount Kenya nature stay with glamping comfort and safari access.',
    'Glamping Kenya Mount Kenya Lodge',
    '["Glamping Kenya Mount Kenya Lodge","Mount Kenya glamping","mid-range Mount Kenya accommodation","Nanyuki nature lodge","Kenya safari accommodation"]'::jsonb,
    null,
    v_now
  );
end $$;
