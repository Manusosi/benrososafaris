-- Seed draft: 3 Days Solio Ranch Fly-In Safari (no pricing; ready for images + publish).

do $$
declare
  v_tour_id uuid := gen_random_uuid();
  v_exp_fly_in uuid;
  v_exp_big5 uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.tour_translations
    where locale = 'en' and slug = '3-days-solio-ranch-fly-in-safari'
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
    3,
    2,
    array['kenya']::text[],
    'Nairobi / Jomo Kenyatta International Airport',
    'Nairobi / Jomo Kenyatta International Airport',
    '[
      {"from":"Nairobi","to":"Wilson Airport"},
      {"from":"Wilson Airport","to":"Nanyuki Airstrip"},
      {"from":"Nanyuki Airstrip","to":"Solio Ranch"},
      {"from":"Solio Ranch","to":"Nanyuki Airstrip"},
      {"from":"Nanyuki Airstrip","to":"Wilson Airport"},
      {"from":"Wilson Airport","to":"Nairobi"}
    ]'::jsonb,
    $notice$Wildlife sightings occur naturally and cannot be guaranteed. Scheduled flights are subject to weather, availability and operational changes. Small aircraft may enforce strict luggage allowances. The source presents this as a luxury package. Optional activities may attract additional charges. Night game drives, nature walks, horseback safaris and cycling depend on lodge arrangements and local conditions. Some optional activities may have age, fitness or safety restrictions. The Day 3 lunch arrangement should be confirmed against the return flight schedule. Exact accommodation depends on availability and final package selection.$notice$,
    '[
      "Transfers between your Nairobi hotel, residence or airport and Wilson Airport",
      "Scheduled return flights between Nairobi and Nanyuki",
      "Road transfers between Nanyuki Airstrip and Solio Ranch",
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
      "Optional night game drive",
      "Guided nature walk",
      "Horseback safari",
      "Cycling safari",
      "Alcoholic drinks, soft drinks and other beverages",
      "Personal expenses",
      "Tips and gratuities",
      "Any activity not specifically mentioned under \"What Is Included\""
    ]'::jsonb,
    $itinerary$[
      {
        "day": 1,
        "title": "Nairobi to Solio Ranch",
        "description": "<p><strong>Activity:</strong> Nairobi transfer, scheduled flight, road transfer, lunch and afternoon game drive</p><p>Your safari begins with a transfer from your Nairobi hotel or Jomo Kenyatta International Airport to Wilson Airport. Board a scheduled 45-minute flight to Nanyuki, followed by an approximately 45-minute road transfer to Solio Ranch.</p><p>After arriving at your selected lodge, check in and enjoy lunch. Later, depart for your first afternoon game drive through the private conservancy. Solio Ranch is especially known for black and white rhinos, while the itinerary also highlights elephants, lions, buffaloes, giraffes, zebras and numerous bird species.</p><p>An optional night game drive may be available at an additional cost.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected luxury lodge, to be confirmed based on package selection"],
        "mealPlan": "Lunch & Dinner"
      },
      {
        "day": 2,
        "title": "Explore Solio Ranch",
        "description": "<p><strong>Activity:</strong> Morning and afternoon game drives, rhino viewing and optional outdoor activities</p><p>Spend the day exploring Solio Ranch on morning and afternoon game drives. The conservancy is internationally recognized for its rhino conservation program and offers strong opportunities to observe both black and white rhinos in their natural habitat.</p><p>Optional activities may include a guided nature walk, horseback safari or cycling safari. After lunch and time to relax at the lodge, continue your wildlife experience before returning for dinner.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected luxury lodge, to be confirmed based on package selection"],
        "mealPlan": "Breakfast, Lunch & Dinner"
      },
      {
        "day": 3,
        "title": "Solio Ranch to Nairobi",
        "description": "<p><strong>Activity:</strong> Breakfast, morning game drive, road transfer, scheduled flight and Nairobi drop-off</p><p>Enjoy breakfast before departing for a final morning game drive, providing one last opportunity to experience Solio Ranch’s wildlife and landscapes.</p><p>Later, transfer by road to Nanyuki Airstrip, a journey of approximately 45 minutes. Board the scheduled 45-minute flight back to Nairobi. On arrival, a Benroso Safaris representative will transfer you to your hotel or Jomo Kenyatta International Airport.</p>",
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
    '3-days-solio-ranch-fly-in-safari',
    '3 Days Solio Ranch Fly-In Safari',
    'Discover Solio Ranch on a 3-day fly-in safari with Benroso Safaris. Enjoy scenic flights, private conservancy game drives, exceptional black and white rhino viewing, birdlife and optional nature walks, cycling or horseback safaris.',
    jsonb_build_object(
      'html',
      $overview$<p>The 3 Days Solio Ranch Fly-In Safari offers a focused wildlife experience in one of Kenya’s most respected private conservancies. The journey begins with a scheduled flight from Nairobi to Nanyuki, followed by a scenic road transfer to Solio Ranch.</p><p>Guests spend two nights in the conservancy, which is especially known for its successful black and white rhino conservation program. Afternoon, morning and final-day game drives provide opportunities to see rhinos, elephants, lions, buffaloes, giraffes, zebras and a wide variety of birdlife.</p><p>The private conservancy setting also allows access to optional experiences that are not commonly available in national parks. These may include night game drives, guided nature walks, horseback safaris and cycling safaris, subject to lodge arrangements and additional charges.</p><p>Benroso Safaris recommends this package for couples, photographers, conservation enthusiasts and travelers seeking a quieter safari experience away from busier reserves. It is particularly well suited to guests interested in rhino viewing and private conservancy activities within a short itinerary.</p><h2>Experiences Associated With This Trip</h2><ul><li><p>Solio Ranch fly-in safari</p></li><li><p>Black rhino viewing</p></li><li><p>White rhino viewing</p></li><li><p>Private conservancy game drives</p></li><li><p>Big Five viewing opportunities</p></li><li><p>Bird watching</p></li><li><p>Scenic scheduled flights</p></li><li><p>Optional night game drive</p></li><li><p>Optional guided nature walk</p></li><li><p>Optional horseback safari</p></li><li><p>Optional cycling safari</p></li><li><p>Wildlife photography</p></li></ul><h2>This Is Suitable For</h2><ul><li><p>Couples and honeymooners</p></li><li><p>Luxury safari travelers</p></li><li><p>Rhino and conservation enthusiasts</p></li><li><p>Wildlife photographers</p></li><li><p>Birdwatchers</p></li><li><p>Travelers seeking a quieter private conservancy safari</p></li></ul>$overview$
    ),
    '[
      {"question":"Where is Solio Ranch located?","answer":"Solio Ranch is located in Kenya’s Laikipia region and is reached through Nanyuki by scheduled flight and road transfer."},
      {"question":"What is Solio Ranch best known for?","answer":"The conservancy is especially known for its successful black and white rhino conservation program."},
      {"question":"Are game drives included?","answer":"Yes. The itinerary includes an afternoon game drive on Day 1, morning and afternoon game drives on Day 2, and a final morning drive on Day 3."},
      {"question":"Are night game drives included?","answer":"No. Night game drives are optional and should be confirmed separately."},
      {"question":"Can guests go horseback riding or cycling?","answer":"Yes. Horseback and cycling safaris may be available as optional activities, subject to lodge arrangements and additional charges."},
      {"question":"How long does it take to reach Solio Ranch from Nairobi?","answer":"The journey includes an approximately 45-minute flight to Nanyuki and a further 45-minute road transfer to Solio Ranch."}
    ]'::jsonb,
    '3 Days Solio Ranch Fly-In Safari',
    '3-day Solio Ranch fly-in safari with Benroso Safaris, featuring black and white rhinos, private game drives and scenic Nairobi flights.',
    '3 Days Solio Ranch Fly-In Safari',
    '["Solio Ranch safari","rhino fly-in safari Kenya","private conservancy safari","luxury Laikipia safari","Benroso Safaris"]'::jsonb,
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
end $$;
