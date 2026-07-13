-- Seed draft: Lake Naivasha and Hell's Gate Day Trip (no pricing; ready for images + publish).

do $$
declare
  v_tour_id uuid := gen_random_uuid();
  v_exp_excursions uuid;
  v_dest_hells_gate uuid;
  v_dest_naivasha uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.tour_translations
    where locale = 'en' and slug = 'lake-naivasha-and-hells-gate-day-trip'
  ) then
    return;
  end if;

  select e.id
  into v_exp_excursions
  from public.experiences e
  join public.experience_translations et on et.experience_id = e.id
  where et.locale = 'en' and et.slug = 'excursions'
  limit 1;

  select d.id
  into v_dest_hells_gate
  from public.destinations d
  join public.destination_translations dt on dt.destination_id = d.id
  where dt.locale = 'en' and dt.slug = 'hells-gate-national-park'
  limit 1;

  select d.id
  into v_dest_naivasha
  from public.destinations d
  join public.destination_translations dt on dt.destination_id = d.id
  where dt.locale = 'en' and dt.slug = 'lake-naivasha'
  limit 1;

  insert into public.tours (
    id,
    status,
    days,
    nights,
    countries,
    start_location,
    end_location,
    route_waypoints,
    important_notice,
    inclusions,
    exclusions,
    itinerary_days,
    gallery,
    pricing_table_keys,
    updated_at
  ) values (
    v_tour_id,
    'draft',
    1,
    0,
    array['kenya']::text[],
    'Nairobi',
    'Nairobi',
    '[
      {"from":"Nairobi","to":"Hell''s Gate National Park"},
      {"from":"Hell''s Gate National Park","to":"Lunch Stop"},
      {"from":"Lunch Stop","to":"Nairobi"}
    ]'::jsonb,
    $notice$The gorge visit is optional and depends on park access and safety conditions. Cycling requires a reasonable level of fitness. Bicycle hire should be confirmed before booking. Comfortable clothing, walking shoes and sun protection are recommended. Park entry fees should be confirmed before publishing the final price. The exact schedule depends on Nairobi traffic, weather and park conditions.$notice$,
    '[
      "Departure from Nairobi",
      "Return road transport between Nairobi and Hell''s Gate National Park",
      "Cycling experience or guided game drive through the park",
      "Lunch",
      "Return transfer to Nairobi"
    ]'::jsonb,
    '[
      "International and domestic flights",
      "Visa fees",
      "Travel insurance",
      "Hell''s Gate National Park entry fees unless included in the final package",
      "Bicycle hire unless included in the selected option",
      "Hell''s Gate Gorge visit",
      "Guide fees for the gorge where required",
      "Drinks and personal expenses",
      "Tips and gratuities",
      "Any item not specifically mentioned under \"What Is Included\""
    ]'::jsonb,
    $itinerary$[
      {
        "day": 1,
        "title": "Hell''s Gate National Park Adventure",
        "description": "<p><strong>Activity:</strong> Nairobi departure, road transfer, cycling or game drive, optional gorge visit, lunch and return journey</p><p>Your day begins with departure from Nairobi for Hell''s Gate National Park. Travel through the Great Rift Valley before arriving at one of Kenya''s most distinctive outdoor destinations.</p><p>Once inside the park, choose between cycling through the landscape or enjoying a guided game drive. The route offers views of open plains, rock formations and the dramatic scenery associated with Hell''s Gate.</p><p>Guests may also explore Hell''s Gate Gorge as an optional activity, subject to safety conditions and park access. After the park experience, enjoy lunch before beginning the return journey to Nairobi.</p>",
        "imageId": "",
        "accommodationOptions": [],
        "mealPlan": "Lunch"
      }
    ]$itinerary$::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    v_now
  );

  insert into public.tour_translations (
    tour_id,
    locale,
    slug,
    title,
    excerpt,
    overview,
    faqs,
    seo_title,
    seo_description,
    focus_keyword,
    keywords,
    published_at,
    updated_at
  ) values (
    v_tour_id,
    'en',
    'lake-naivasha-and-hells-gate-day-trip',
    'Lake Naivasha and Hell''s Gate Day Trip',
    'Explore Hell''s Gate National Park on a day trip from Nairobi with Benroso Safaris. Cycle or enjoy a game drive through the park, take in dramatic scenery, consider an optional gorge visit and stop for lunch before returning.',
    jsonb_build_object(
      'html',
      $overview$<p>The Lake Naivasha and Hell's Gate Day Trip offers an active escape from Nairobi into the dramatic landscapes of the Great Rift Valley. The journey begins with a road transfer to Hell's Gate National Park, a destination known for its open scenery and outdoor adventure opportunities.</p><p>Guests may explore the park by bicycle or choose a guided game drive, depending on their interests and fitness level. Cycling provides a more active way to experience the landscape, while the game-drive option offers a relaxed alternative.</p><p>The itinerary also includes the possibility of exploring Hell's Gate Gorge. This activity is optional and depends on park access, weather and safety conditions. After the park experience, guests stop for lunch before returning to Nairobi.</p><p>Benroso Safaris recommends this short safari for couples, families with older children, active travelers, small groups and photographers. It is especially suitable for guests seeking a day trip that combines scenery, light adventure and time outdoors.</p><h2>Experiences Associated With This Trip</h2><ul><li><p>Hell's Gate cycling experience</p></li><li><p>Guided park game drive</p></li><li><p>Great Rift Valley scenery</p></li><li><p>Rock formation viewing</p></li><li><p>Optional gorge exploration</p></li><li><p>Outdoor adventure</p></li><li><p>Scenic road travel</p></li><li><p>Nairobi day trip</p></li></ul><h2>This Is Suitable For</h2><ul><li><p>Active travelers</p></li><li><p>Couples and small groups</p></li><li><p>Families with older children</p></li><li><p>Adventure and nature enthusiasts</p></li><li><p>Photographers and outdoor travelers</p></li><li><p>Guests with one free day in Nairobi</p></li></ul>$overview$
    ),
    '[
      {"question":"Can guests cycle through Hell''s Gate National Park?","answer":"Yes. Cycling is one of the main activities listed in the itinerary."},
      {"question":"Is a game-drive option available?","answer":"Yes. Guests may choose a game drive instead of cycling through the park."},
      {"question":"Is the gorge visit included?","answer":"No. The gorge visit is optional and should be confirmed before departure."},
      {"question":"Is lunch included?","answer":"Yes. Lunch is listed in the source itinerary."},
      {"question":"Is this day trip suitable for children?","answer":"It may be suitable for older children, depending on their fitness, cycling ability and the selected activities."},
      {"question":"Where does the excursion start and end?","answer":"The day trip starts and ends in Nairobi."}
    ]'::jsonb,
    'Lake Naivasha and Hell''s Gate Day Trip',
    'Hell''s Gate day trip from Nairobi with Benroso Safaris, featuring cycling or a game drive, dramatic Rift Valley scenery and lunch.',
    'Lake Naivasha and Hell''s Gate Day Trip',
    '["Hell''s Gate day trip","Nairobi to Hell''s Gate tour","Hell''s Gate cycling safari","Rift Valley day trip","Benroso Safaris"]'::jsonb,
    null,
    v_now
  );

  if v_exp_excursions is not null then
    insert into public.tour_experiences (tour_id, experience_id, position)
    values (v_tour_id, v_exp_excursions, 0);
  end if;

  if v_dest_hells_gate is not null then
    insert into public.tour_destinations (tour_id, destination_id, position)
    values (v_tour_id, v_dest_hells_gate, 0);
  end if;

  if v_dest_naivasha is not null then
    insert into public.tour_destinations (tour_id, destination_id, position)
    values (v_tour_id, v_dest_naivasha, 1);
  end if;
end $$;
