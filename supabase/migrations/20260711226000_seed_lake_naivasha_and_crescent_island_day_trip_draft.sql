-- Seed draft: Lake Naivasha and Crescent Island Day Trip (no pricing; ready for images + publish).

do $$
declare
  v_tour_id uuid := gen_random_uuid();
  v_exp_excursions uuid;
  v_dest_naivasha uuid;
  v_dest_crescent uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.tour_translations
    where locale = 'en' and slug = 'lake-naivasha-and-crescent-island-day-trip'
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
  into v_dest_naivasha
  from public.destinations d
  join public.destination_translations dt on dt.destination_id = d.id
  where dt.locale = 'en' and dt.slug = 'lake-naivasha'
  limit 1;

  select d.id
  into v_dest_crescent
  from public.destinations d
  join public.destination_translations dt on dt.destination_id = d.id
  where dt.locale = 'en' and dt.slug = 'crescent-island-game-sanctuary'
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
      {"from":"Nairobi","to":"Lake Naivasha"},
      {"from":"Lake Naivasha","to":"Crescent Island"},
      {"from":"Crescent Island","to":"Nairobi"}
    ]'::jsonb,
    $notice$Wildlife sightings occur naturally and cannot be guaranteed. Boat rides depend on weather, water and safety conditions. Comfortable walking shoes are recommended for Crescent Island. Lake and island entry fees should be confirmed before publishing the final price. The walking safari route may vary according to local conditions. The exact departure and return times depend on Nairobi traffic.$notice$,
    '[
      "Departure from Nairobi",
      "Return road transport between Nairobi and Lake Naivasha",
      "Boat ride on Lake Naivasha",
      "Walking safari at Crescent Island",
      "Lunch",
      "Return transfer to Nairobi"
    ]'::jsonb,
    '[
      "International and domestic flights",
      "Visa fees",
      "Travel insurance",
      "Lake or island entry fees unless included in the final package",
      "Drinks and personal expenses",
      "Tips and gratuities",
      "Additional activities not listed in the itinerary",
      "Any item not specifically mentioned under \"What Is Included\""
    ]'::jsonb,
    $itinerary$[
      {
        "day": 1,
        "title": "Lake Naivasha and Crescent Island Experience",
        "description": "<p><strong>Activity:</strong> Nairobi departure, road transfer, boat ride, walking safari, lunch and return journey</p><p>Your day trip begins with departure from Nairobi for Lake Naivasha. Enjoy the scenic road journey into the Great Rift Valley before arriving at the lakeshore.</p><p>Board a boat for a ride across Lake Naivasha, with opportunities to observe the lake’s birdlife and surrounding scenery. The excursion then continues to Crescent Island for a guided walking safari.</p><p>Explore the island on foot and enjoy a closer look at the wildlife and natural environment. After the walking experience, stop for lunch before beginning the return journey to Nairobi.</p>",
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
    'lake-naivasha-and-crescent-island-day-trip',
    'Lake Naivasha and Crescent Island Day Trip',
    'Travel from Nairobi to Lake Naivasha on a day trip with Benroso Safaris. Enjoy a scenic boat ride, explore Crescent Island on foot, observe wildlife and birdlife, have lunch and return to Nairobi the same day.',
    jsonb_build_object(
      'html',
      $overview$<p>The Lake Naivasha and Crescent Island Day Trip offers a convenient escape from Nairobi into the landscapes of the Great Rift Valley. The journey begins with a road transfer to Lake Naivasha, one of Kenya’s best-known freshwater lakes.</p><p>Once at the lake, guests enjoy a boat ride across the water, taking in the scenery and looking out for birdlife along the shoreline. The excursion then continues to Crescent Island, where a guided walking safari provides an opportunity to explore the natural environment on foot.</p><p>Unlike a traditional vehicle-based safari, the Crescent Island experience allows guests to move through the landscape at a slower pace and appreciate the surroundings more closely. The day also includes lunch before the return journey to Nairobi.</p><p>Benroso Safaris recommends this short safari for couples, families, birdwatchers, photographers and travelers with one free day in Nairobi. It is particularly suitable for guests looking for a relaxed combination of lake scenery, boating and wildlife viewing.</p><h2>Experiences Associated With This Trip</h2><ul><li><p>Lake Naivasha boat ride</p></li><li><p>Crescent Island walking safari</p></li><li><p>Great Rift Valley scenery</p></li><li><p>Bird watching</p></li><li><p>Lakeside wildlife viewing</p></li><li><p>Guided nature walk</p></li><li><p>Scenic road travel</p></li><li><p>Nairobi day trip</p></li></ul><h2>This Is Suitable For</h2><ul><li><p>Couples and small groups</p></li><li><p>Families with children</p></li><li><p>Birdwatchers and nature lovers</p></li><li><p>Wildlife photographers</p></li><li><p>Travelers with one free day in Nairobi</p></li><li><p>Guests seeking a relaxed outdoor excursion</p></li></ul>$overview$
    ),
    '[
      {"question":"How long does the day trip take?","answer":"This is a full-day excursion from Nairobi. The exact duration depends on traffic, weather and activity schedules."},
      {"question":"Is the boat ride included?","answer":"Yes. The itinerary includes a boat ride on Lake Naivasha."},
      {"question":"Is the Crescent Island safari done on foot?","answer":"Yes. The itinerary includes a walking safari on Crescent Island."},
      {"question":"Is lunch included?","answer":"Yes. Lunch is listed in the source itinerary."},
      {"question":"Is this trip suitable for children?","answer":"Yes. It can be suitable for families, subject to boat safety rules and the children’s comfort with walking."},
      {"question":"Where does the trip start and end?","answer":"The day trip starts and ends in Nairobi."}
    ]'::jsonb,
    'Lake Naivasha and Crescent Island Day Trip',
    'Lake Naivasha and Crescent Island day trip with Benroso Safaris, featuring a scenic boat ride, guided walking safari and lunch from Nairobi.',
    'Lake Naivasha and Crescent Island Day Trip',
    '["Lake Naivasha day trip","Crescent Island safari","Nairobi to Naivasha tour","Lake Naivasha boat ride","Benroso Safaris"]'::jsonb,
    null,
    v_now
  );

  if v_exp_excursions is not null then
    insert into public.tour_experiences (tour_id, experience_id, position)
    values (v_tour_id, v_exp_excursions, 0);
  end if;

  if v_dest_naivasha is not null then
    insert into public.tour_destinations (tour_id, destination_id, position)
    values (v_tour_id, v_dest_naivasha, 0);
  end if;

  if v_dest_crescent is not null then
    insert into public.tour_destinations (tour_id, destination_id, position)
    values (v_tour_id, v_dest_crescent, 1);
  end if;
end $$;
