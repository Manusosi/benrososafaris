-- Seed draft: 3 Days Lewa Conservancy Fly-In Safari (no pricing; ready for images + publish).

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
    where locale = 'en' and slug = '3-days-lewa-conservancy-fly-in-safari'
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
      {"from":"Wilson Airport","to":"Lewa Conservancy"},
      {"from":"Lewa Conservancy","to":"Wilson Airport"},
      {"from":"Wilson Airport","to":"Nairobi"}
    ]'::jsonb,
    $notice$Wildlife sightings occur naturally and cannot be guaranteed. Mount Kenya views depend on weather and visibility. Scheduled flights are subject to availability and operational changes. Domestic aircraft may have strict luggage allowances. The itinerary is presented as a luxury package in the source document. The afternoon game drive on Day 2 may depend on lodge scheduling and guest preference. The Day 3 lunch arrangement should be confirmed against the return flight time. Exact accommodation will depend on availability and final package selection.$notice$,
    '[
      "Transfers between your Nairobi hotel, residence or airport and Wilson Airport",
      "Scheduled return flights between Nairobi and Lewa Conservancy",
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
      "Alcoholic drinks, soft drinks and other beverages",
      "Personal expenses",
      "Tips and gratuities",
      "Optional activities not mentioned in the itinerary",
      "Any item not specifically mentioned under \"What Is Included\""
    ]'::jsonb,
    $itinerary$[
      {
        "day": 1,
        "title": "Nairobi to Lewa Conservancy",
        "description": "<p><strong>Activity:</strong> Nairobi transfer, scheduled flight, game-viewing transfer, lunch and afternoon game drive</p><p>Your safari begins with a transfer from your Nairobi hotel or Jomo Kenyatta International Airport to Wilson Airport. Board a scheduled flight to Lewa Conservancy, taking approximately 1 hour and 30 minutes.</p><p>Upon arrival, your safari guide will meet you and transfer you to your selected camp, with wildlife viewing along the way. After lunch and time to relax, depart in an open 4x4 safari vehicle for an afternoon game drive.</p><p>The itinerary highlights opportunities to see elephants, black rhinos, Grevy’s zebras, lions, buffaloes and other wildlife across Lewa’s varied landscapes.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected luxury camp/lodge, to be confirmed based on package selection"],
        "mealPlan": "Lunch & Dinner"
      },
      {
        "day": 2,
        "title": "Explore Lewa Conservancy",
        "description": "<p><strong>Activity:</strong> Morning game drive, wildlife viewing, lodge relaxation and optional afternoon game drive</p><p>Rise early for a morning game drive when wildlife is often more active. Lewa Conservancy is known for its conservation work and provides strong opportunities to see endangered black rhinos and Grevy’s zebras.</p><p>The itinerary also highlights elephants, lions, buffaloes and a variety of birdlife, with Mount Kenya forming a scenic backdrop when visibility is clear. Spend the afternoon relaxing at camp or head out for another game drive.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected luxury camp/lodge, to be confirmed based on package selection"],
        "mealPlan": "Breakfast, Lunch & Dinner"
      },
      {
        "day": 3,
        "title": "Lewa Conservancy to Nairobi",
        "description": "<p><strong>Activity:</strong> Early morning game drive, breakfast, airstrip transfer, scheduled flight and Nairobi drop-off</p><p>Enjoy a final early morning game drive before returning to camp for breakfast. Afterwards, transfer to Lewa Airstrip for the scheduled 1-hour and 30-minute flight back to Nairobi.</p><p>On arrival at Wilson Airport, a Benroso Safaris representative will transfer you to your hotel, residence or Jomo Kenyatta International Airport for your onward journey.</p>",
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
    '3-days-lewa-conservancy-fly-in-safari',
    '3 Days Lewa Conservancy Fly-In Safari',
    'Explore Lewa Conservancy on a 3-day fly-in safari with Benroso Safaris. Enjoy scenic flights, private game drives, black rhino and Grevy’s zebra sightings, Mount Kenya views and a refined stay in one of Kenya’s leading conservancies.',
    jsonb_build_object(
      'html',
      $overview$<p>The 3 Days Lewa Conservancy Fly-In Safari is designed for travelers who want a short, focused wildlife experience in one of Kenya’s leading private conservancies. The journey begins with a transfer to Wilson Airport and a scheduled flight to Lewa, reducing road travel and allowing more time for game viewing.</p><p>After landing, guests enjoy a wildlife-viewing transfer to a selected luxury camp or lodge. The first afternoon includes a game drive in an open 4x4 vehicle, with opportunities to search for elephants, lions, buffaloes, black rhinos and Grevy’s zebras.</p><p>The second day provides further morning and afternoon game-viewing opportunities across Lewa’s varied landscapes. The conservancy is especially valued for its successful rhino and Grevy’s zebra conservation efforts. When weather conditions are favorable, Mount Kenya adds a striking backdrop to the experience.</p><p>The final morning includes one last game drive before the return flight to Nairobi. Benroso Safaris recommends this package for couples, photographers, conservation-minded travelers and guests with limited time who want a private conservancy safari away from busier reserves.</p><h2>Experiences Associated With This Trip</h2><ul><li><p>Lewa fly-in safari</p></li><li><p>Private conservancy game drives</p></li><li><p>Black rhino viewing</p></li><li><p>Grevy’s zebra sightings</p></li><li><p>Elephant viewing</p></li><li><p>Open 4x4 safari experience</p></li><li><p>Mount Kenya views</p></li><li><p>Bird watching</p></li><li><p>Wildlife photography</p></li><li><p>Scenic scheduled flights</p></li></ul><h2>This Is Suitable For</h2><ul><li><p>Couples and honeymooners</p></li><li><p>Luxury safari travelers</p></li><li><p>Wildlife and conservation enthusiasts</p></li><li><p>Rhino and rare-species photographers</p></li><li><p>Small private groups</p></li><li><p>Travelers with limited time in Kenya</p></li></ul>$overview$
    ),
    '[
      {"question":"How long is the flight from Nairobi to Lewa?","answer":"The scheduled flight takes approximately 1 hour and 30 minutes each way."},
      {"question":"What wildlife is Lewa best known for?","answer":"Lewa is particularly known for black rhinos and Grevy’s zebras, as well as elephants, lions and buffaloes."},
      {"question":"Are game drives included?","answer":"Yes. The itinerary includes an afternoon drive on Day 1, game viewing on Day 2 and a final early morning drive on Day 3."},
      {"question":"Can guests see Mount Kenya?","answer":"Mount Kenya may be visible from Lewa, depending on weather and cloud conditions."},
      {"question":"What accommodation category is offered?","answer":"The source presents this as a luxury fly-in package, with the exact camp or lodge confirmed during booking."},
      {"question":"Is this safari suitable for photographers?","answer":"Yes. Lewa offers strong opportunities for wildlife, landscape and conservation photography."}
    ]'::jsonb,
    '3 Days Lewa Conservancy Fly-In Safari',
    '3-day Lewa Conservancy fly-in safari with Benroso Safaris, featuring black rhinos, Grevy’s zebras, Mount Kenya views and game drives.',
    '3 Days Lewa Conservancy Fly-In Safari',
    '["Lewa fly-in safari","black rhino safari Kenya","Grevy’s zebra safari","luxury Lewa safari","Benroso Safaris"]'::jsonb,
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
