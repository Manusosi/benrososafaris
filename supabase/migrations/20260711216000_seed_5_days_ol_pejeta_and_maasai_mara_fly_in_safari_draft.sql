-- Seed draft: 5 Days Ol Pejeta and Maasai Mara Fly-In Safari (no pricing; ready for images + publish).

do $$
declare
  v_tour_id uuid := gen_random_uuid();
  v_exp_fly_in uuid;
  v_exp_big5 uuid;
  v_park_mara uuid;
  v_dest_ol_pejeta uuid;
  v_dest_mara uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.tour_translations
    where locale = 'en' and slug = '5-days-ol-pejeta-and-maasai-mara-fly-in-safari'
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
  into v_dest_ol_pejeta
  from public.destinations d
  join public.destination_translations dt on dt.destination_id = d.id
  where dt.locale = 'en' and dt.slug = 'ol-pejeta-conservancy'
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
    5,
    4,
    array['kenya']::text[],
    'Nairobi / Jomo Kenyatta International Airport',
    'Nairobi / Jomo Kenyatta International Airport',
    '[
      {"from":"Nairobi","to":"Wilson Airport"},
      {"from":"Wilson Airport","to":"Nanyuki"},
      {"from":"Nanyuki","to":"Ol Pejeta Conservancy"},
      {"from":"Ol Pejeta Conservancy","to":"Maasai Mara National Reserve"},
      {"from":"Maasai Mara National Reserve","to":"Wilson Airport"},
      {"from":"Wilson Airport","to":"Nairobi"}
    ]'::jsonb,
    $notice$Wildlife sightings occur naturally and cannot be guaranteed. Scheduled flights are subject to availability, weather and operational changes. Domestic aircraft may enforce strict luggage allowances. The source presents this as a luxury itinerary. The Maasai village visit is optional and may cost extra. Access to the chimpanzee sanctuary may depend on conservancy schedules and operating conditions. Exact accommodation depends on availability and package selection. The final-day return flight time may affect breakfast and game-drive arrangements.$notice$,
    '[
      "Transfers between your Nairobi hotel, residence or airport and Wilson Airport",
      "Scheduled flight from Nairobi to Nanyuki",
      "Scheduled flight from Ol Pejeta to Maasai Mara",
      "Scheduled return flight from Maasai Mara to Nairobi",
      "Accommodation throughout the safari",
      "Meals indicated in the itinerary",
      "Unlimited drinking water during the tour",
      "Flying Doctors medical, emergency and rescue cover",
      "Game drives and activities mentioned in the itinerary",
      "Visit to the chimpanzee sanctuary",
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
      "Optional activities not mentioned as included",
      "Any item not specifically mentioned under \"What Is Included\""
    ]'::jsonb,
    $itinerary$[
      {
        "day": 1,
        "title": "Nairobi to Ol Pejeta Conservancy",
        "description": "<p><strong>Activity:</strong> Nairobi transfer, scheduled flight, game-viewing transfer, lunch, afternoon game drive and chimpanzee sanctuary visit</p><p>Your safari begins with a transfer from your Nairobi hotel, residence or Jomo Kenyatta International Airport to Wilson Airport. Board the scheduled flight to Nanyuki, taking approximately 1 hour and 30 minutes.</p><p>On arrival, your guide will meet you and transfer you to Ol Pejeta Conservancy, with game viewing along the way. After lunch at your selected lodge, depart for an afternoon game drive before visiting the chimpanzee sanctuary, which provides care for rescued chimpanzees.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected luxury lodge/camp, to be confirmed based on package selection"],
        "mealPlan": "Lunch & Dinner"
      },
      {
        "day": 2,
        "title": "Explore Ol Pejeta Conservancy",
        "description": "<p><strong>Activity:</strong> Morning and afternoon game drives, rhino viewing and conservation-focused wildlife experiences</p><p>Spend the day exploring Ol Pejeta Conservancy on morning and afternoon game drives. The conservancy is known for its wildlife conservation programs and supports both black and white rhinos.</p><p>The itinerary also highlights possible sightings of elephants, lions, giraffes, zebras, buffaloes and other wildlife. Return to the lodge in the evening for dinner and rest.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected luxury lodge/camp, to be confirmed based on package selection"],
        "mealPlan": "Breakfast, Lunch & Dinner"
      },
      {
        "day": 3,
        "title": "Ol Pejeta to Maasai Mara",
        "description": "<p><strong>Activity:</strong> Breakfast, game-viewing transfer, scheduled flight, lunch and afternoon game drive</p><p>After breakfast, enjoy a final game-viewing drive as you transfer to the airstrip. Board the scheduled flight to the Maasai Mara National Reserve, taking approximately 1 hour and 45 minutes.</p><p>Upon arrival, your guide will meet you and transfer you to your selected camp or lodge for lunch. Later, head out for your first afternoon game drive across the reserve.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected luxury lodge/camp, to be confirmed based on package selection"],
        "mealPlan": "Breakfast, Lunch & Dinner"
      },
      {
        "day": 4,
        "title": "Full-Day Maasai Mara Safari",
        "description": "<p><strong>Activity:</strong> Morning and afternoon game drives, Big Five tracking, picnic lunch and optional Maasai village visit</p><p>Spend the day exploring the Maasai Mara on morning and afternoon game drives. Your guide will help you search for the Big Five and other wildlife mentioned in the itinerary, including wildebeests, zebras, gazelles, buffaloes, elephants, lions, leopards and cheetahs.</p><p>Enjoy a picnic lunch inside the reserve before continuing the safari. Guests may also choose an optional visit to a traditional Maasai village at an additional cost.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected luxury lodge/camp, to be confirmed based on package selection"],
        "mealPlan": "Breakfast, Picnic Lunch & Dinner"
      },
      {
        "day": 5,
        "title": "Maasai Mara to Nairobi",
        "description": "<p><strong>Activity:</strong> Early morning game drive, breakfast, airstrip transfer, scheduled flight and Nairobi drop-off</p><p>Begin the day with an early morning game drive, offering one final opportunity to observe wildlife and the sunrise across the savannah.</p><p>After breakfast, transfer to the airstrip for the scheduled flight back to Nairobi, lasting approximately 45 minutes to 1 hour. On arrival, a Benroso Safaris representative will transfer you to your hotel or Jomo Kenyatta International Airport.</p>",
        "imageId": "",
        "accommodationOptions": [],
        "mealPlan": "Breakfast"
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
    '5-days-ol-pejeta-and-maasai-mara-fly-in-safari',
    '5 Days Ol Pejeta and Maasai Mara Fly-In Safari',
    'Explore Ol Pejeta Conservancy and the Maasai Mara on a 5-day fly-in safari with Benroso Safaris. Visit the chimpanzee sanctuary, search for rhinos and the Big Five, enjoy scenic flights and stay in carefully selected safari lodges.',
    jsonb_build_object(
      'html',
      $overview$<p>The 5 Days Ol Pejeta and Maasai Mara Fly-In Safari combines conservation-focused wildlife experiences with classic game viewing in Kenya’s best-known reserve. The journey begins with a scheduled flight from Nairobi to Nanyuki, followed by a game-viewing transfer into Ol Pejeta Conservancy.</p><p>Guests spend two nights in Ol Pejeta, where the itinerary includes morning and afternoon game drives, opportunities to see black and white rhinos, and a visit to the chimpanzee sanctuary. The conservancy also supports elephants, lions, giraffes, zebras and buffaloes.</p><p>The safari then continues by scheduled flight to the Maasai Mara for two nights. An afternoon game drive introduces guests to the reserve, while the following day provides a full safari experience with a picnic lunch and opportunities to search for the Big Five, cheetahs and plains wildlife. An optional Maasai village visit may also be arranged.</p><p>Benroso Safaris recommends this package for couples, photographers, conservation enthusiasts and travelers who want to experience two distinct wildlife areas within a compact itinerary. The flight connections reduce travel time and allow guests to focus on game viewing, conservation and high-quality lodge stays.</p><h2>Experiences Associated With This Trip</h2><ul><li><p>Ol Pejeta fly-in safari</p></li><li><p>Maasai Mara fly-in safari</p></li><li><p>Chimpanzee sanctuary visit</p></li><li><p>Black and white rhino viewing</p></li><li><p>Big Five game drives</p></li><li><p>Cheetah sightings</p></li><li><p>Picnic lunch in the reserve</p></li><li><p>Conservation-focused safari</p></li><li><p>Scenic scheduled flights</p></li><li><p>Optional Maasai village visit</p></li></ul><h2>This Is Suitable For</h2><ul><li><p>Couples and honeymooners</p></li><li><p>Luxury safari travelers</p></li><li><p>Wildlife and conservation enthusiasts</p></li><li><p>Rhino and primate lovers</p></li><li><p>Nature photographers</p></li><li><p>Small private groups</p></li></ul>$overview$
    ),
    '[
      {"question":"Which destinations are included?","answer":"The itinerary includes Ol Pejeta Conservancy and the Maasai Mara National Reserve."},
      {"question":"Is the chimpanzee sanctuary visit included?","answer":"Yes. The itinerary includes a visit to the chimpanzee sanctuary on Day 1."},
      {"question":"Can guests see rhinos in Ol Pejeta?","answer":"Yes. Ol Pejeta is known for both black and white rhinos, although sightings cannot be guaranteed."},
      {"question":"Are the domestic flights included?","answer":"Yes. The package includes the scheduled flights connecting Nairobi, Ol Pejeta and the Maasai Mara, based on the shared inclusions."},
      {"question":"Are game drives included?","answer":"Yes. The itinerary includes game drives in both Ol Pejeta and the Maasai Mara."},
      {"question":"Is the Maasai village visit included?","answer":"No. The Maasai village visit is optional and should be confirmed separately."}
    ]'::jsonb,
    '5 Days Ol Pejeta and Maasai Mara Fly-In Safari',
    '5-day Ol Pejeta and Maasai Mara fly-in safari with Benroso Safaris, featuring rhinos, chimpanzees, Big Five drives and scenic flights.',
    '5 Days Ol Pejeta and Maasai Mara Fly-In Safari',
    '["Ol Pejeta Maasai Mara safari","chimpanzee sanctuary Kenya","rhino fly-in safari","luxury Kenya safari","Benroso Safaris"]'::jsonb,
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

  if v_dest_ol_pejeta is not null then
    insert into public.tour_destinations (tour_id, destination_id, position)
    values (v_tour_id, v_dest_ol_pejeta, 0);
  end if;

  if v_dest_mara is not null then
    insert into public.tour_destinations (tour_id, destination_id, position)
    values (v_tour_id, v_dest_mara, 1);
  end if;
end $$;
