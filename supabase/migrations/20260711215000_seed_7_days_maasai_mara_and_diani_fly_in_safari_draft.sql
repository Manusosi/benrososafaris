-- Seed draft: 7 Days Maasai Mara and Diani Fly-In Safari (no pricing; ready for images + publish).

do $$
declare
  v_tour_id uuid := gen_random_uuid();
  v_exp_fly_in uuid;
  v_exp_big5 uuid;
  v_park_mara uuid;
  v_dest_mara uuid;
  v_dest_diani uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.tour_translations
    where locale = 'en' and slug = '7-days-maasai-mara-and-diani-fly-in-safari'
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
  into v_park_mara
  from public.national_parks np
  join public.national_park_translations npt on npt.park_id = np.id
  where npt.locale = 'en' and npt.slug = 'maasai-mara'
  limit 1;

  select d.id
  into v_dest_mara
  from public.destinations d
  join public.destination_translations dt on dt.destination_id = d.id
  where dt.locale = 'en' and dt.slug = 'maasai-mara'
  limit 1;

  select d.id
  into v_dest_diani
  from public.destinations d
  join public.destination_translations dt on dt.destination_id = d.id
  where dt.locale = 'en' and dt.slug = 'diani-beach'
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
    7,
    6,
    array['kenya']::text[],
    'Nairobi / Jomo Kenyatta International Airport',
    'Nairobi / Jomo Kenyatta International Airport',
    '[
      {"from":"Nairobi","to":"Wilson Airport"},
      {"from":"Wilson Airport","to":"Maasai Mara National Reserve"},
      {"from":"Maasai Mara National Reserve","to":"Ukunda Airstrip"},
      {"from":"Ukunda Airstrip","to":"Diani Beach"},
      {"from":"Diani Beach","to":"Wilson Airport"},
      {"from":"Wilson Airport","to":"Nairobi"}
    ]'::jsonb,
    $notice$Wildlife sightings occur naturally and cannot be guaranteed. Scheduled flights are subject to weather, availability and operational changes. Small aircraft may enforce strict luggage allowances. Accommodation depends on the selected midrange or luxury category. The hot air balloon safari and Maasai village visit are optional and cost extra. Coastal activities such as snorkeling, diving and fishing are optional unless added to the final package. Sea-based excursions depend on weather and ocean conditions. The Day 7 lunch arrangement should be confirmed against the return flight schedule. The quoted flight durations should be reconfirmed because routing may include intermediate stops.$notice$,
    '[
      "Transfers between your Nairobi hotel, residence or airport and Wilson Airport",
      "Scheduled flight from Nairobi to Maasai Mara",
      "Scheduled flight from Maasai Mara to Ukunda",
      "Scheduled return flight from Ukunda to Nairobi",
      "Accommodation throughout the safari and beach stay",
      "Meals indicated in the itinerary",
      "Unlimited drinking water during the tour",
      "Flying Doctors medical, emergency and rescue cover",
      "Game drives and activities mentioned in the itinerary",
      "Transport in a private 4x4 Safari Land Cruiser in the Maasai Mara",
      "Experienced English-speaking driver-guide",
      "Applicable government taxes, levies and entry fees",
      "Eco-friendly stainless steel safari water bottle",
      "Personalized private service",
      "Transfers between Ukunda Airstrip and the selected Diani resort"
    ]'::jsonb,
    '[
      "International flights",
      "Visa fees",
      "Travel insurance beyond the stated emergency and rescue cover",
      "Hot air balloon safari",
      "Champagne bush breakfast linked to the balloon safari",
      "Maasai village visit",
      "Spa treatments",
      "Snorkeling and diving",
      "Kite surfing",
      "Deep-sea fishing",
      "Dolphin excursions",
      "Alcoholic drinks, soft drinks and other beverages",
      "Personal expenses",
      "Tips and gratuities",
      "Any activity not specifically mentioned under \"What Is Included\""
    ]'::jsonb,
    $itinerary$[
      {
        "day": 1,
        "title": "Nairobi to Maasai Mara National Reserve",
        "description": "<p><strong>Activity:</strong> Nairobi transfer, scheduled flight, game-viewing transfer, lunch and afternoon game drive</p><p>Your journey begins with a transfer from your Nairobi hotel, residence or Jomo Kenyatta International Airport to Wilson Airport. Board a scheduled flight to the Maasai Mara, taking approximately 45 minutes to 1 hour.</p><p>On arrival, your safari guide will meet you and transfer you to your selected camp or lodge, with wildlife viewing along the way. After lunch and time to settle in, depart for an afternoon game drive in search of the Big Five and other animals mentioned in the itinerary, including giraffes, zebras, wildebeests, gazelles and baboons.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected midrange or luxury camp/lodge, to be confirmed based on package selection"],
        "mealPlan": "Lunch & Dinner"
      },
      {
        "day": 2,
        "title": "Discover the Maasai Mara",
        "description": "<p><strong>Activity:</strong> Morning and afternoon game drives, wildlife tracking and optional experiences</p><p>Spend the day exploring the Maasai Mara on morning and afternoon game drives. Your guide will help you track wildlife across the reserve while you enjoy its open plains and varied scenery.</p><p>Guests may choose an optional sunrise hot air balloon safari followed by a champagne bush breakfast. A traditional Maasai village visit may also be arranged at an additional cost.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected midrange or luxury camp/lodge, to be confirmed based on package selection"],
        "mealPlan": "Breakfast, Lunch & Dinner"
      },
      {
        "day": 3,
        "title": "Another Day in the Maasai Mara",
        "description": "<p><strong>Activity:</strong> Early morning game drive, reserve exploration, lodge relaxation and afternoon game drive</p><p>Begin the day with an early morning game drive when wildlife is often more active. Return to the lodge for breakfast before continuing your exploration of different areas of the reserve or relaxing at the property.</p><p>Later in the afternoon, head out for another game drive before returning for dinner and your final overnight stay in the Maasai Mara.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected midrange or luxury camp/lodge, to be confirmed based on package selection"],
        "mealPlan": "Breakfast, Lunch & Dinner"
      },
      {
        "day": 4,
        "title": "Maasai Mara to Diani Beach",
        "description": "<p><strong>Activity:</strong> Breakfast, airstrip transfer, scheduled coastal flight, resort transfer and relaxation</p><p>After breakfast and a relaxed morning, transfer to the airstrip for the scheduled flight to Ukunda, the gateway to Diani Beach. The source document gives an approximate flight time of 2 hours and 45 minutes.</p><p>On arrival, transfer to your selected beach resort and settle into the coastal surroundings. Spend the remainder of the afternoon at leisure before dinner.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected midrange or luxury beach resort, to be confirmed based on package selection"],
        "mealPlan": "Breakfast, Lunch & Dinner"
      },
      {
        "day": 5,
        "title": "Full Day at Diani Beach",
        "description": "<p><strong>Activity:</strong> Beach relaxation, resort facilities and optional coastal activities</p><p>Spend the day at your own pace along Diani’s white-sand beaches and warm Indian Ocean waters. Relax by the pool, use the resort facilities or arrange a spa treatment.</p><p>Optional activities mentioned in the itinerary include snorkeling, diving, kite surfing, deep-sea fishing and dolphin excursions. These experiences are subject to availability and additional charges.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected midrange or luxury beach resort, to be confirmed based on package selection"],
        "mealPlan": "Breakfast, Lunch & Dinner"
      },
      {
        "day": 6,
        "title": "Leisure Along the Kenyan Coast",
        "description": "<p><strong>Activity:</strong> Beach walks, resort relaxation and optional coastal experiences</p><p>Enjoy another full day at Diani Beach. You may take a peaceful walk along the shore, relax by the pool, enjoy the resort facilities or spend time by the ocean.</p><p>The day is intentionally flexible, allowing guests to rest after the safari or arrange additional coastal activities according to their interests.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected midrange or luxury beach resort, to be confirmed based on package selection"],
        "mealPlan": "Breakfast, Lunch & Dinner"
      },
      {
        "day": 7,
        "title": "Diani to Nairobi",
        "description": "<p><strong>Activity:</strong> Breakfast, Ukunda transfer, scheduled flight and Nairobi drop-off</p><p>After breakfast, transfer to Ukunda Airstrip for the scheduled return flight to Nairobi. The source itinerary gives an approximate flight time of 1 hour and 40 minutes.</p><p>On arrival at Wilson Airport, a Benroso Safaris representative will transfer you to Jomo Kenyatta International Airport or your Nairobi hotel.</p>",
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
    '7-days-maasai-mara-and-diani-fly-in-safari',
    '7 Days Maasai Mara and Diani Fly-In Safari',
    'Combine Maasai Mara game drives with Diani Beach relaxation on a 7-day fly-in safari with Benroso Safaris. Enjoy scenic flights, Big Five viewing, optional cultural experiences and three nights along Kenya’s Indian Ocean coast.',
    jsonb_build_object(
      'html',
      $overview$<p>The 7 Days Maasai Mara and Diani Fly-In Safari brings together Kenya’s best-known wildlife reserve and one of its leading beach destinations. The journey starts with a scheduled flight from Nairobi to the Maasai Mara, allowing guests to avoid a long road transfer and begin game viewing soon after arrival.</p><p>Three nights in the Maasai Mara provide time for afternoon, morning and full-day wildlife experiences. The itinerary offers opportunities to search for the Big Five, wildebeests, zebras, giraffes, gazelles and other species. Optional additions include a sunrise hot air balloon safari and a visit to a traditional Maasai village.</p><p>The route then continues by scheduled flight to Ukunda for three nights at Diani Beach. This section is designed for relaxation, with time for swimming, beach walks and resort facilities. Guests may also arrange optional activities such as snorkeling, diving, kite surfing, fishing or dolphin excursions.</p><p>Benroso Safaris recommends this package for couples, honeymooners, families and small groups seeking a complete Kenya bush and beach holiday. The flight connections reduce travel time and make the itinerary especially suitable for guests who value comfort, convenience and a balanced pace.</p><h2>Experiences Associated With This Trip</h2><ul><li><p>Maasai Mara fly-in safari</p></li><li><p>Big Five game drives</p></li><li><p>Predator and plains wildlife viewing</p></li><li><p>Scenic domestic flights</p></li><li><p>Optional hot air balloon safari</p></li><li><p>Optional Maasai village visit</p></li><li><p>Diani Beach stay</p></li><li><p>Indian Ocean swimming</p></li><li><p>Beach walks</p></li><li><p>Resort relaxation</p></li><li><p>Optional snorkeling and diving</p></li><li><p>Optional dolphin excursions</p></li></ul><h2>This Is Suitable For</h2><ul><li><p>Couples and honeymooners</p></li><li><p>Families and small private groups</p></li><li><p>First-time visitors to Kenya</p></li><li><p>Travelers seeking a bush and beach holiday</p></li><li><p>Guests avoiding long road transfers</p></li><li><p>Wildlife lovers who also want coastal relaxation</p></li></ul>$overview$
    ),
    '[
      {"question":"How many nights are spent in each destination?","answer":"The itinerary includes three nights in the Maasai Mara and three nights at Diani Beach."},
      {"question":"Are all domestic flights included?","answer":"Yes. The package includes scheduled flights from Nairobi to Maasai Mara, Maasai Mara to Ukunda and Ukunda back to Nairobi, based on the shared inclusions."},
      {"question":"Are game drives included?","answer":"Yes. The itinerary includes several morning and afternoon game drives during the Maasai Mara stay."},
      {"question":"Are Diani activities included?","answer":"Beach relaxation and resort time are included in the itinerary. Activities such as snorkeling, diving and dolphin excursions are optional."},
      {"question":"Is the hot air balloon safari included?","answer":"No. The hot air balloon safari is optional and available at an additional cost."},
      {"question":"Is this package suitable for honeymooners?","answer":"Yes. The combination of Maasai Mara wildlife experiences and a Diani beach stay makes it particularly suitable for honeymooners and couples."}
    ]'::jsonb,
    '7 Days Maasai Mara and Diani Fly-In Safari',
    '7-day Maasai Mara and Diani fly-in safari with Benroso Safaris, featuring Big Five game drives, scenic flights and three beach nights.',
    '7 Days Maasai Mara and Diani Fly-In Safari',
    '["Maasai Mara Diani safari","Kenya bush and beach fly-in","Diani beach safari","luxury Kenya safari package","Benroso Safaris"]'::jsonb,
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

  if v_park_mara is not null then
    insert into public.tour_national_parks (tour_id, park_id, position)
    values (v_tour_id, v_park_mara, 0);
  end if;

  if v_dest_mara is not null then
    insert into public.tour_destinations (tour_id, destination_id, position)
    values (v_tour_id, v_dest_mara, 0);
  end if;

  if v_dest_diani is not null then
    insert into public.tour_destinations (tour_id, destination_id, position)
    values (v_tour_id, v_dest_diani, 1);
  end if;
end $$;
