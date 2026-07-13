-- Seed draft: 6 Days Lewa and Maasai Mara Fly-In Safari (no pricing; ready for images + publish).

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
    where locale = 'en' and slug = '6-days-lewa-and-maasai-mara-fly-in-safari'
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
    6,
    5,
    array['kenya']::text[],
    'Nairobi / Jomo Kenyatta International Airport',
    'Nairobi / Jomo Kenyatta International Airport',
    '[
      {"from":"Nairobi","to":"Wilson Airport"},
      {"from":"Wilson Airport","to":"Lewa Conservancy"},
      {"from":"Lewa Conservancy","to":"Maasai Mara National Reserve"},
      {"from":"Maasai Mara National Reserve","to":"Wilson Airport"},
      {"from":"Wilson Airport","to":"Nairobi"}
    ]'::jsonb,
    $notice$Wildlife sightings occur naturally and cannot be guaranteed. Scheduled flights are subject to availability, weather and operational changes. Domestic aircraft may enforce strict luggage limits. The package is presented as a luxury itinerary in the source document. Guided nature walks depend on lodge arrangements and local conditions. The Maasai village visit is optional and may attract an additional charge. The Day 6 lunch arrangement should be confirmed against the return flight schedule. Ngare Ndare Forest is mentioned as part of the wider Lewa landscape, but a dedicated forest excursion is not clearly confirmed.$notice$,
    '[
      "Transfers between your Nairobi hotel, residence or airport and Wilson Airport",
      "Scheduled flight from Nairobi to Lewa Conservancy",
      "Scheduled flight from Lewa Conservancy to Maasai Mara",
      "Scheduled return flight from Maasai Mara to Nairobi",
      "Accommodation throughout the safari",
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
      "Optional Maasai village visit",
      "Alcoholic drinks, soft drinks and other beverages",
      "Personal expenses",
      "Tips and gratuities",
      "Optional activities not listed as included",
      "Any item not specifically mentioned under \"What Is Included\""
    ]'::jsonb,
    $itinerary$[
      {
        "day": 1,
        "title": "Nairobi to Lewa Conservancy",
        "description": "<p><strong>Activity:</strong> Nairobi transfer, scheduled flight, game-viewing transfer, lunch and afternoon game drive</p><p>Your safari begins with a transfer to Wilson Airport for the scheduled flight to Lewa Conservancy, lasting approximately 1 hour and 30 minutes.</p><p>Upon arrival, your guide will meet you for a game-viewing transfer to your selected lodge. After check-in and lunch, head out for an afternoon game drive across the conservancy. Lewa is known for black rhinos, Grevy’s zebras, elephants, lions, leopards and other wildlife.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected luxury lodge/camp, to be confirmed based on package selection"],
        "mealPlan": "Lunch & Dinner"
      },
      {
        "day": 2,
        "title": "Discover Lewa Conservancy",
        "description": "<p><strong>Activity:</strong> Early morning game drive, wildlife viewing, guided nature walk and lodge relaxation</p><p>Begin the day with an early morning game drive before breakfast. Continue exploring Lewa Conservancy and its varied landscapes, with opportunities to view rhinos, Grevy’s zebras and other wildlife.</p><p>The itinerary also highlights the wider scenery around Lewa, including the beautiful Ngare Ndare Forest. In the afternoon, enjoy a guided nature walk or relax at the lodge.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected luxury lodge/camp, to be confirmed based on package selection"],
        "mealPlan": "Breakfast, Lunch & Dinner"
      },
      {
        "day": 3,
        "title": "Lewa Conservancy to Maasai Mara",
        "description": "<p><strong>Activity:</strong> Early morning game drive, breakfast, scheduled flight, lunch and afternoon game drive</p><p>After an early morning game drive and breakfast, transfer to the airstrip for the scheduled flight from Lewa Conservancy to the Maasai Mara. The flight takes approximately 1 hour and 25 minutes.</p><p>On arrival, your guide will meet you and transfer you to your selected camp or lodge with game viewing along the way. After lunch, depart for your first afternoon game drive across the Maasai Mara’s open plains.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected luxury lodge/camp, to be confirmed based on package selection"],
        "mealPlan": "Breakfast, Lunch & Dinner"
      },
      {
        "day": 4,
        "title": "Full-Day Maasai Mara Safari",
        "description": "<p><strong>Activity:</strong> Morning and afternoon game drives, Big Five viewing and optional Maasai village visit</p><p>Spend the day exploring the Maasai Mara on morning and afternoon game drives. Your guide will help you search for the Big Five and the many plains animals found across the reserve.</p><p>Guests may also choose an optional visit to a traditional Maasai village to learn about local customs, dances and community life. This experience should be confirmed separately before booking.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected luxury lodge/camp, to be confirmed based on package selection"],
        "mealPlan": "Breakfast, Lunch & Dinner"
      },
      {
        "day": 5,
        "title": "Another Day in the Maasai Mara",
        "description": "<p><strong>Activity:</strong> Early morning game drive, reserve exploration, lodge relaxation and afternoon game drive</p><p>Start the day with an early morning game drive when wildlife is often more active. After breakfast, continue exploring different sections of the reserve or spend time relaxing at the camp.</p><p>Later in the afternoon, head out for another game drive before returning for dinner and your final overnight stay in the Maasai Mara.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected luxury lodge/camp, to be confirmed based on package selection"],
        "mealPlan": "Breakfast, Lunch & Dinner"
      },
      {
        "day": 6,
        "title": "Maasai Mara to Nairobi",
        "description": "<p><strong>Activity:</strong> Breakfast, airstrip transfer, scheduled flight and Nairobi drop-off</p><p>After breakfast, enjoy your final moments in the Maasai Mara before transferring to the airstrip.</p><p>Board the scheduled return flight to Wilson Airport, lasting approximately 45 minutes to 1 hour. On arrival, a Benroso Safaris representative will transfer you to Jomo Kenyatta International Airport or your Nairobi hotel.</p>",
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
    '6-days-lewa-and-maasai-mara-fly-in-safari',
    '6 Days Lewa and Maasai Mara Fly-In Safari',
    'Discover Lewa Conservancy and the Maasai Mara on a 6-day fly-in safari with Benroso Safaris. Enjoy scenic flights, rhino and Grevy’s zebra sightings, Big Five game drives, guided nature experiences and luxury lodge stays.',
    jsonb_build_object(
      'html',
      $overview$<p>The 6 Days Lewa and Maasai Mara Fly-In Safari combines two of Kenya’s most rewarding wildlife destinations in one efficient itinerary. The journey begins with a scheduled flight from Nairobi to Lewa Conservancy, where guests spend two nights exploring a private conservation area known for black rhinos, Grevy’s zebras and a strong record of wildlife protection.</p><p>Game drives in Lewa offer opportunities to see elephants, lions, leopards and other species across varied landscapes. The itinerary also includes the option of a guided nature walk and time to enjoy the lodge surroundings.</p><p>From Lewa, guests fly directly to the Maasai Mara for three nights of game viewing. Morning and afternoon drives provide opportunities to search for the Big Five and follow the reserve’s abundant plains wildlife. An optional Maasai village visit may also be arranged.</p><p>Benroso Safaris recommends this itinerary for couples, honeymooners, photographers and travelers seeking a refined fly-in experience. It is especially suitable for guests who want to combine rhino conservation, private conservancy game viewing and the classic wildlife landscapes of the Maasai Mara without spending long hours on the road.</p><h2>Experiences Associated With This Trip</h2><ul><li><p>Lewa Conservancy fly-in safari</p></li><li><p>Maasai Mara fly-in safari</p></li><li><p>Black rhino viewing</p></li><li><p>Grevy’s zebra sightings</p></li><li><p>Big Five game drives</p></li><li><p>Private conservancy experience</p></li><li><p>Guided nature walk</p></li><li><p>Scenic scheduled flights</p></li><li><p>Bird watching</p></li><li><p>Optional Maasai village visit</p></li><li><p>Luxury lodge experience</p></li></ul><h2>This Is Suitable For</h2><ul><li><p>Couples and honeymooners</p></li><li><p>Luxury safari travelers</p></li><li><p>Wildlife and conservation enthusiasts</p></li><li><p>Rhino and rare-species photographers</p></li><li><p>Small private groups</p></li><li><p>Guests avoiding long road transfers</p></li></ul>$overview$
    ),
    '[
      {"question":"Which destinations are included?","answer":"The itinerary includes Lewa Conservancy and the Maasai Mara National Reserve."},
      {"question":"How long are the flights?","answer":"The Nairobi to Lewa flight takes about 1 hour and 30 minutes, Lewa to Maasai Mara about 1 hour and 25 minutes, and Maasai Mara to Nairobi about 45 minutes to 1 hour."},
      {"question":"What special wildlife can guests see in Lewa?","answer":"Lewa is especially known for black rhinos and Grevy’s zebras, alongside elephants, lions, leopards and other wildlife."},
      {"question":"Are game drives included?","answer":"Yes. The itinerary includes game drives in both Lewa Conservancy and the Maasai Mara."},
      {"question":"Is the guided nature walk included?","answer":"The itinerary mentions a guided nature walk in Lewa, but the exact arrangement should be confirmed with the selected lodge."},
      {"question":"Is the Maasai village visit included?","answer":"No. The Maasai village visit is optional and should be confirmed separately."}
    ]'::jsonb,
    '6 Days Lewa and Maasai Mara Fly-In Safari',
    '6-day Lewa and Maasai Mara fly-in safari with Benroso Safaris, featuring rhinos, Grevy’s zebras, Big Five game drives and scenic flights.',
    '6 Days Lewa and Maasai Mara Fly-In Safari',
    '["Lewa Maasai Mara safari","luxury Kenya fly-in safari","black rhino safari Kenya","Grevy’s zebra safari","Benroso Safaris"]'::jsonb,
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
