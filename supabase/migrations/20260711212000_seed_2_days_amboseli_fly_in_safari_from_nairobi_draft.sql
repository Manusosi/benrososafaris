-- Seed draft: 2 Days Amboseli Fly-In Safari from Nairobi (no pricing; ready for images + publish).

do $$
declare
  v_tour_id uuid := gen_random_uuid();
  v_exp_fly_in uuid;
  v_exp_big5 uuid;
  v_park_amboseli uuid;
  v_dest_amboseli uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.tour_translations
    where locale = 'en' and slug = '2-days-amboseli-fly-in-safari-from-nairobi'
  ) then
    return;
  end if;

  select e.id
  into v_exp_fly_in
  from public.experiences e
  join public.experience_translations et on et.experience_id = e.id
  where et.locale = 'en' and et.slug = 'fly-in-safaris'
  limit 1;

  select e.id
  into v_exp_big5
  from public.experiences e
  join public.experience_translations et on et.experience_id = e.id
  where et.locale = 'en' and et.slug = 'big-5-safaris'
  limit 1;

  select np.id
  into v_park_amboseli
  from public.national_parks np
  join public.national_park_translations npt on npt.park_id = np.id
  where npt.locale = 'en' and npt.slug = 'amboseli-national-park'
  limit 1;

  select d.id
  into v_dest_amboseli
  from public.destinations d
  join public.destination_translations dt on dt.destination_id = d.id
  where dt.locale = 'en' and dt.slug = 'amboseli-national-park'
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
    2,
    1,
    array['kenya']::text[],
    'Nairobi / Jomo Kenyatta International Airport',
    'Nairobi / Jomo Kenyatta International Airport',
    '[
      {"from":"Nairobi","to":"Wilson Airport"},
      {"from":"Wilson Airport","to":"Amboseli National Park"},
      {"from":"Amboseli National Park","to":"Wilson Airport"},
      {"from":"Wilson Airport","to":"Nairobi"}
    ]'::jsonb,
    $notice$Wildlife sightings occur naturally and cannot be guaranteed. Views of Mount Kilimanjaro depend on weather and cloud conditions. Scheduled flights are subject to availability and operational changes. Domestic aircraft may have strict luggage limits. Accommodation depends on the selected midrange or luxury package. Flamingo and other bird sightings vary with water levels and seasonal conditions. The Day 2 lunch arrangement should be confirmed against the scheduled return flight time.$notice$,
    '[
      "Transfers between your Nairobi hotel, residence or airport and Wilson Airport",
      "Scheduled return flights between Nairobi and Amboseli",
      "Accommodation during the safari",
      "Meals indicated in the itinerary",
      "Unlimited drinking water during the tour",
      "Flying Doctors medical, emergency and rescue cover",
      "Game drives and activities mentioned in the itinerary",
      "Transport in a private 4x4 Safari Land Cruiser",
      "Experienced English-speaking driver-guide",
      "Applicable government taxes, levies and entry fees",
      "Eco-friendly stainless steel safari water bottle",
      "Personalized private service"
    ]'::jsonb,
    '[
      "International flights",
      "Visa fees",
      "Travel insurance beyond the stated emergency and rescue cover",
      "Alcoholic drinks, soft drinks and other beverages",
      "Personal expenses",
      "Tips and gratuities",
      "Optional activities not listed in the itinerary",
      "Any item not specifically mentioned under \"What Is Included\""
    ]'::jsonb,
    $itinerary$[
      {
        "day": 1,
        "title": "Nairobi to Amboseli National Park",
        "description": "<p><strong>Activity:</strong> Nairobi transfer, scheduled flight, airstrip pick-up, lunch and afternoon game drive</p><p>Your journey begins with a transfer from your Nairobi hotel or Jomo Kenyatta International Airport to Wilson Airport. From there, board a scheduled 45-minute flight to Amboseli National Park.</p><p>As the aircraft approaches Amboseli, you may enjoy views of Mount Kilimanjaro, depending on weather conditions. On arrival, your safari guide will meet you and transfer you to your selected camp or lodge, with wildlife-viewing opportunities along the way.</p><p>After lunch and time to relax, depart for an afternoon game drive across Amboseli’s open plains. The itinerary highlights possible sightings of elephants, lions, giraffes, zebras, buffaloes, wildebeests and a wide variety of birdlife.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected midrange or luxury camp/lodge, to be confirmed based on package selection"],
        "mealPlan": "Lunch & Dinner"
      },
      {
        "day": 2,
        "title": "Amboseli to Nairobi",
        "description": "<p><strong>Activity:</strong> Early morning game drive, wetland visit, bird watching, breakfast and return flight</p><p>Begin the day with an early morning game drive when wildlife is often more active and the light is well suited to photography.</p><p>Explore Amboseli’s wetland areas, where flamingos, pelicans and other bird species may be seen against the backdrop of Mount Kilimanjaro. After breakfast, return to the lodge to freshen up before transferring to the airstrip.</p><p>Board your scheduled 45-minute flight back to Nairobi. On arrival, a Benroso Safaris representative will transfer you to your hotel, residence or Jomo Kenyatta International Airport.</p>",
        "imageId": "",
        "accommodationOptions": [],
        "mealPlan": "Breakfast & Lunch"
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
    '2-days-amboseli-fly-in-safari-from-nairobi',
    '2 Days Amboseli Fly-In Safari from Nairobi',
    'Explore Amboseli on a 2-day fly-in safari from Nairobi with Benroso Safaris. Enjoy scenic flights, elephant sightings, game drives, wetland birdlife and views of Mount Kilimanjaro in one of Kenya’s most rewarding short safari packages.',
    jsonb_build_object(
      'html',
      $overview$<p>The 2 Days Amboseli Fly-In Safari from Nairobi is a compact wildlife experience designed for travelers who want to visit Amboseli without spending long hours on the road. The journey begins with a transfer to Wilson Airport, followed by a scheduled 45-minute flight into the park.</p><p>Amboseli is especially known for its large elephant herds, open plains, wetland habitats and views of Mount Kilimanjaro. After landing, guests enjoy a game-viewing transfer to a selected midrange or luxury camp or lodge, followed by lunch and an afternoon game drive.</p><p>The second day begins with an early morning safari, providing another chance to observe wildlife when temperatures are cooler and animals are often more active. The itinerary also includes a visit to Amboseli’s wetland areas, where guests may see flamingos, pelicans and other bird species.</p><p>After breakfast, guests transfer to the airstrip for the return flight to Nairobi. Benroso Safaris recommends this package for travelers with limited time, couples, families and business visitors looking for a short but meaningful Kenya safari.</p><h2>Experiences Associated With This Trip</h2><ul><li><p>Amboseli fly-in safari</p></li><li><p>Scenic scheduled flights</p></li><li><p>Elephant viewing</p></li><li><p>Mount Kilimanjaro views</p></li><li><p>Morning and afternoon game drives</p></li><li><p>Wetland wildlife viewing</p></li><li><p>Flamingo and pelican sightings</p></li><li><p>Bird watching</p></li><li><p>Wildlife photography</p></li><li><p>Private 4x4 safari experience</p></li></ul><h2>This Is Suitable For</h2><ul><li><p>Travelers with limited time in Nairobi</p></li><li><p>Couples and honeymooners</p></li><li><p>Families and small private groups</p></li><li><p>Elephant and bird-watching enthusiasts</p></li><li><p>Business travelers adding a short safari</p></li><li><p>Nature and wildlife photographers</p></li></ul>$overview$
    ),
    '[
      {"question":"How long is the flight from Nairobi to Amboseli?","answer":"The scheduled flight takes approximately 45 minutes each way."},
      {"question":"Are game drives included?","answer":"Yes. The itinerary includes an afternoon game drive on Day 1 and an early morning game drive on Day 2."},
      {"question":"Can guests see Mount Kilimanjaro?","answer":"Mount Kilimanjaro may be visible from Amboseli, but views depend on weather and cloud cover."},
      {"question":"What wildlife can guests expect to see?","answer":"The itinerary highlights elephants, lions, giraffes, zebras, buffaloes, wildebeests and several bird species."},
      {"question":"What accommodation categories are available?","answer":"Guests may select either a midrange or luxury camp or lodge, subject to availability."},
      {"question":"Is this safari suitable for families?","answer":"Yes. The short flights and compact itinerary make it suitable for families, subject to the selected accommodation’s child policy."}
    ]'::jsonb,
    '2 Days Amboseli Fly-In Safari from Nairobi',
    '2-day Amboseli fly-in safari with Benroso Safaris, featuring scenic Nairobi flights, elephant game drives and Mount Kilimanjaro views.',
    '2 Days Amboseli Fly-In Safari from Nairobi',
    '["Amboseli flight safari","Nairobi to Amboseli safari","short Kenya fly-in safari","Mount Kilimanjaro safari","Benroso Safaris"]'::jsonb,
    null,
    v_now
  );

  if v_exp_fly_in is not null then
    insert into public.tour_experiences (tour_id, experience_id, position)
    values (v_tour_id, v_exp_fly_in, 0);
  end if;

  if v_exp_big5 is not null then
    insert into public.tour_experiences (tour_id, experience_id, position)
    values (v_tour_id, v_exp_big5, 1);
  end if;

  if v_park_amboseli is not null then
    insert into public.tour_national_parks (tour_id, park_id, position)
    values (v_tour_id, v_park_amboseli, 0);
  end if;

  if v_dest_amboseli is not null then
    insert into public.tour_destinations (tour_id, destination_id, position)
    values (v_tour_id, v_dest_amboseli, 0);
  end if;
end $$;
