-- Seed draft: 4 Days Masai Mara Fly-In Safari from Nairobi (no pricing; ready for images + publish).

do $$
declare
  v_tour_id uuid := gen_random_uuid();
  v_exp_fly_in uuid;
  v_exp_big5 uuid;
  v_park_mara uuid;
  v_dest_mara uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.tour_translations
    where locale = 'en' and slug = '4-days-masai-mara-fly-in-safari-from-nairobi'
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
    4,
    3,
    array['kenya']::text[],
    'Nairobi / Jomo Kenyatta International Airport',
    'Nairobi / Jomo Kenyatta International Airport',
    '[
      {"from":"Nairobi","to":"Wilson Airport"},
      {"from":"Wilson Airport","to":"Masai Mara National Reserve"},
      {"from":"Masai Mara National Reserve","to":"Wilson Airport"},
      {"from":"Wilson Airport","to":"Nairobi"}
    ]'::jsonb,
    $notice$Wildlife sightings occur naturally and cannot be guaranteed. Scheduled flights are subject to availability and operational changes. Domestic aircraft may have strict luggage limits. Accommodation depends on the selected midrange or luxury package. The hot air balloon safari is optional and charged separately. Other beverages are not included unless stated in the final package. The Day 4 source lists breakfast and lunch, so the lunch arrangement should be confirmed against the return flight schedule.$notice$,
    '[
      "Transfers between your Nairobi hotel, residence or airport and Wilson Airport",
      "Accommodation throughout the safari",
      "Meals indicated in the itinerary",
      "Unlimited drinking water during the tour",
      "Flying Doctors medical, emergency and rescue cover",
      "Scheduled return flights between Nairobi and Masai Mara",
      "Morning and afternoon game drives mentioned in the itinerary",
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
      "Hot air balloon safari",
      "Champagne bush breakfast where connected to the optional balloon safari",
      "Alcoholic drinks, soft drinks and other beverages",
      "Personal expenses",
      "Tips and gratuities",
      "Optional activities not mentioned as included",
      "Any item not specifically mentioned under \"What Is Included\""
    ]'::jsonb,
    $itinerary$[
      {
        "day": 1,
        "title": "Nairobi to Masai Mara National Reserve",
        "description": "<p><strong>Activity:</strong> Nairobi transfer, scheduled flight, airstrip pick-up, lunch and afternoon game drive</p><p>Your safari begins with a transfer from your Nairobi hotel, residence or Jomo Kenyatta International Airport to Wilson Airport. From there, board a scheduled 45-minute flight to the Masai Mara National Reserve.</p><p>Enjoy aerial views of Kenya’s varied landscapes before landing in the reserve. Your safari guide will meet you at the airstrip and transfer you to your selected camp or lodge for check-in and lunch. Later, depart for an afternoon game drive in search of zebras, giraffes, wildebeests, gazelles, baboons and the Big Five.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected midrange or luxury camp/lodge, to be confirmed based on package selection"],
        "mealPlan": "Lunch & Dinner"
      },
      {
        "day": 2,
        "title": "Full-Day Wildlife Exploration",
        "description": "<p><strong>Activity:</strong> Morning and afternoon game drives, wildlife viewing and optional balloon safari</p><p>Spend the day exploring the Masai Mara on morning and afternoon game drives. The reserve supports a wide variety of wildlife, making each game drive different depending on animal movement, weather and the area explored.</p><p>Guests may choose an optional early morning hot air balloon safari at an additional cost. This experience is followed by a champagne bush breakfast. The remainder of the day may be spent on further game drives or relaxing at the lodge.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected midrange or luxury camp/lodge, to be confirmed based on package selection"],
        "mealPlan": "Breakfast, Lunch & Dinner"
      },
      {
        "day": 3,
        "title": "Another Day in the Masai Mara",
        "description": "<p><strong>Activity:</strong> Early morning game drive, wildlife tracking, lodge lunch and afternoon game drive</p><p>Wake early and head out for a morning game drive when many animals are active and temperatures are cooler. Your guide will explore different areas of the reserve in search of predators, elephants, buffaloes, giraffes, cheetahs and other species mentioned in the itinerary.</p><p>Return to the lodge for breakfast and continue exploring the reserve later in the day. After lunch, depart for your final afternoon game drive before returning to the lodge for dinner.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected midrange or luxury camp/lodge, to be confirmed based on package selection"],
        "mealPlan": "Breakfast, Lunch & Dinner"
      },
      {
        "day": 4,
        "title": "Masai Mara to Nairobi",
        "description": "<p><strong>Activity:</strong> Breakfast, airstrip transfer, scheduled flight and Nairobi drop-off</p><p>After breakfast, check out of your camp or lodge and transfer to the airstrip for your scheduled flight back to Nairobi.</p><p>On arrival at Wilson Airport, a Benroso Safaris representative will meet you and transfer you to your hotel, residence or Jomo Kenyatta International Airport for your onward journey.</p>",
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
    '4-days-masai-mara-fly-in-safari-from-nairobi',
    '4 Days Masai Mara Fly-In Safari from Nairobi',
    'Discover the Masai Mara on a 4-day fly-in safari from Nairobi with Benroso Safaris. Enjoy scenic flights, morning and afternoon game drives, Big Five viewing opportunities and three nights in the heart of Kenya’s most famous reserve.',
    jsonb_build_object(
      'html',
      $overview$<p>The 4 Days Masai Mara Fly-In Safari from Nairobi offers more time in the reserve while avoiding the long road journey from the capital. The package begins with a transfer to Wilson Airport, followed by a scheduled 45-minute flight directly into the Masai Mara.</p><p>After landing, guests are met by a safari guide and transferred to a selected midrange or luxury camp or lodge. The first afternoon includes a game drive, while the next two days provide morning and afternoon wildlife-viewing opportunities across different parts of the reserve.</p><p>The itinerary highlights possible sightings of the Big Five, as well as cheetahs, giraffes, zebras, wildebeests, gazelles and other plains wildlife. Guests may also choose an optional sunrise hot air balloon safari followed by a champagne bush breakfast.</p><p>With three nights in the Masai Mara, this itinerary gives travelers more time to follow wildlife movements, revisit productive game-viewing areas and enjoy the camp or lodge between drives. Benroso Safaris recommends this package for couples, families, photographers and first-time visitors seeking a well-paced fly-in safari with more time in Kenya’s best-known wildlife reserve.</p><h2>Experiences Associated With This Trip</h2><ul><li><p>Masai Mara fly-in safari</p></li><li><p>Scenic scheduled flights</p></li><li><p>Private 4x4 game drives</p></li><li><p>Big Five viewing</p></li><li><p>Predator tracking</p></li><li><p>Cheetah sightings</p></li><li><p>Plains wildlife viewing</p></li><li><p>Bird watching</p></li><li><p>Optional hot air balloon safari</p></li><li><p>Lodge relaxation</p></li></ul><h2>This Is Suitable For</h2><ul><li><p>Couples and honeymooners</p></li><li><p>Families and small private groups</p></li><li><p>Wildlife photographers</p></li><li><p>First-time visitors to Kenya</p></li><li><p>Travelers avoiding long road transfers</p></li><li><p>Guests wanting more time in the Masai Mara</p></li></ul>$overview$
    ),
    '[
      {"question":"How long is the flight from Nairobi to Masai Mara?","answer":"The scheduled flight takes approximately 45 minutes each way."},
      {"question":"How many game drives are included?","answer":"The itinerary includes an afternoon game drive on Day 1, morning and afternoon drives on Day 2, and additional morning and afternoon drives on Day 3."},
      {"question":"Are the return flights included?","answer":"Yes. Scheduled flights between Nairobi and the Masai Mara are included based on the shared package inclusions."},
      {"question":"What accommodation options are available?","answer":"The package may be booked with selected midrange or luxury accommodation, subject to availability."},
      {"question":"Is a hot air balloon safari included?","answer":"No. The hot air balloon safari and champagne bush breakfast are optional and available at an additional cost."},
      {"question":"Is this better than the 3-day Masai Mara package?","answer":"It is suitable for travelers who want an additional day for game viewing, photography and relaxation in the reserve."}
    ]'::jsonb,
    '4 Days Masai Mara Fly-In Safari from Nairobi',
    '4-day Masai Mara fly-in safari with Benroso Safaris, including return Nairobi flights, private game drives and Big Five viewing.',
    '4 Days Masai Mara Fly-In Safari from Nairobi',
    '["Masai Mara fly-in package","Nairobi to Masai Mara safari","4-day Kenya safari","Masai Mara flight tour","Benroso Safaris"]'::jsonb,
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
end $$;
