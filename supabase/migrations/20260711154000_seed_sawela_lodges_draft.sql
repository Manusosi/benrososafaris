-- Seed draft: Sawela Lodges (map and gallery left for manual entry).

do $$
declare
  v_accommodation_id uuid := gen_random_uuid();
  v_destination_id uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.accommodation_translations
    where locale = 'en' and slug = 'sawela-lodges'
  ) then
    return;
  end if;

  select d.id
  into v_destination_id
  from public.destinations d
  join public.destination_translations dt on dt.destination_id = d.id
  where dt.locale = 'en' and dt.slug = 'lake-naivasha'
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
    'Lake Naivasha',
    v_destination_id,
    'Luxury Resort / Lakeside Safari Lodge',
    'luxury',
    'on_request',
    null,
    '[
      "Spacious en-suite rooms",
      "Family room options",
      "Restaurant",
      "Bar and lounge",
      "Outdoor swimming pool",
      "Garden and outdoor seating areas",
      "Free Wi-Fi in public areas",
      "Private parking",
      "Room service",
      "Laundry service",
      "Conference and event facilities",
      "Family-friendly accommodation",
      "Children''s play area",
      "Team-building facilities",
      "Breakfast and meal options",
      "Boat ride arrangements nearby",
      "Crescent Island access nearby",
      "Hell''s Gate National Park access",
      "Transfer arrangements",
      "Lake Naivasha safari access"
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
    'sawela-lodges',
    'Sawela Lodges',
    'Sawela Lodges is a luxury Lake Naivasha resort offering spacious rooms, gardens, dining, a swimming pool, family facilities, and easy access to boat rides, Crescent Island, Hell’s Gate, and Rift Valley safari routes.',
    jsonb_build_object(
      'html',
      $description$<p>Sawela Lodges is a relaxing Lake Naivasha stay for travelers who want comfort, space, and a peaceful resort atmosphere close to the lake. The property is well suited for guests who want to enjoy Naivasha’s soft adventure experiences, including boat rides, birdwatching, Crescent Island walking safaris, and day trips to Hell’s Gate National Park.</p><p>For guests booking with Benroso Safaris, Sawela Lodges works well for luxury Lake Naivasha safari packages, family holidays, group tours, romantic getaways, corporate retreats, and Kenya road safari itineraries connecting Nairobi, Lake Nakuru, Maasai Mara, Amboseli, or Aberdare. It is especially ideal for travelers who want a comfortable stopover where they can slow down, enjoy the gardens, and still stay close to Naivasha’s main attractions.</p><p>The lodge offers a spacious and friendly setting with comfortable rooms, outdoor spaces, dining facilities, a swimming pool, and family-friendly services. With Benroso Safaris, Sawela Lodges can be included in short Naivasha getaways, weekend escapes, and longer Kenya safari circuits designed around wildlife, scenery, relaxation, and smooth travel between destinations.</p>$description$
    ),
    'Sawela Lodges',
    'Book Sawela Lodges with Benroso Safaris for a luxury Lake Naivasha stay near boat rides, Crescent Island, Hell’s Gate, and Rift Valley safaris.',
    'Sawela Lodges',
    '["Sawela Lodges Kenya","luxury Naivasha resort","Lake Naivasha accommodation","Naivasha safari lodge","Kenya safari accommodation"]'::jsonb,
    null,
    v_now
  );
end $$;
