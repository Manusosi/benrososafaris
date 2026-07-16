-- Seed draft: 2 Days Amboseli Safari from Nairobi (no pricing; ready for images + publish).

do $$
declare
  v_tour_id uuid := gen_random_uuid();
  v_exp_big5 uuid;
  v_dest_amboseli uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.tour_translations
    where locale = 'en' and slug = '2-days-amboseli-safari-from-nairobi'
  ) then
    return;
  end if;

  select e.id
  into v_exp_big5
  from public.experiences e
  join public.experience_translations et on et.experience_id = e.id
  where et.locale = 'en' and et.slug = 'big-5-safaris'
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
    'Nairobi',
    'Nairobi',
    '[
      {"from":"Nairobi","to":"Amboseli National Park"},
      {"from":"Amboseli National Park","to":"Nairobi"}
    ]'::jsonb,
    $notice$Wildlife sightings occur naturally and cannot be guaranteed. Mount Kilimanjaro views depend on weather and cloud conditions. Accommodation names are not provided in the source document. Park entry fees and meal arrangements should be confirmed before publishing the final package. The exact game-drive schedule may change depending on traffic and park conditions. The road journey between Nairobi and Amboseli may take several hours.$notice$,
    '[
      "Road transport from Nairobi to Amboseli and back",
      "Afternoon game drive in Amboseli National Park",
      "Morning game drive in Amboseli National Park",
      "Elephant viewing and wildlife photography opportunities",
      "Possible Mount Kilimanjaro views",
      "One night''s accommodation in Amboseli"
    ]'::jsonb,
    '[
      "International and domestic flights",
      "Visa fees",
      "Travel insurance",
      "Amboseli National Park entry fees unless included in the final package",
      "Meals not clearly stated in the itinerary",
      "Drinks and personal expenses",
      "Tips and gratuities",
      "Optional activities not listed in the itinerary",
      "Any item not specifically mentioned under \"What Is Included\""
    ]'::jsonb,
    $itinerary$[
      {
        "day": 1,
        "title": "Nairobi to Amboseli National Park",
        "description": "<p><strong>Activity:</strong> Road transfer, afternoon game drive, wildlife viewing and Mount Kilimanjaro views</p><p>Your short safari begins with departure from Nairobi for Amboseli National Park. Travel south toward the park and enjoy the changing scenery along the route.</p><p>On arrival, head out for an afternoon game drive across Amboseli''s open landscapes. The park is especially known for elephant viewing, while Mount Kilimanjaro may be visible in the background when weather conditions are favorable.</p><p>After the game drive, proceed to your selected camp or lodge for dinner and an overnight stay.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected lodge/camp, to be confirmed based on package selection"],
        "mealPlan": "Dinner"
      },
      {
        "day": 2,
        "title": "Amboseli to Nairobi",
        "description": "<p><strong>Activity:</strong> Morning game drive, elephant viewing, photography and return journey</p><p>Begin the day with a morning game drive in Amboseli National Park. The cooler hours provide another opportunity to observe elephants and other wildlife while enjoying the park''s scenery.</p><p>Take time for wildlife photography before leaving Amboseli and beginning the return journey to Nairobi.</p>",
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
    '2-days-amboseli-safari-from-nairobi',
    '2 Days Amboseli Safari from Nairobi',
    'Explore Amboseli on a 2-day safari from Nairobi with Benroso Safaris. Enjoy afternoon and morning game drives, elephant viewing, wildlife photography and possible views of Mount Kilimanjaro.',
    jsonb_build_object(
      'html',
      $overview$<p>The 2 Days Amboseli Safari from Nairobi is a compact wildlife experience designed for travelers who want to visit one of Kenya's best-known elephant destinations within a short itinerary. The journey begins in Nairobi and continues by road to Amboseli National Park.</p><p>An afternoon game drive on the first day introduces guests to the park's open plains and wildlife. Amboseli is particularly associated with large elephant herds, while Mount Kilimanjaro may provide a striking backdrop when weather and visibility are favorable.</p><p>After an overnight stay in the park area, the second day begins with a morning game drive. This offers another opportunity for elephant viewing, wildlife photography and appreciation of Amboseli's landscapes before returning to Nairobi.</p><p>Benroso Safaris recommends this short safari for couples, families, photographers, first-time visitors and travelers with limited time. It is especially suitable for guests whose main interests are elephants, scenery and a quick safari from Nairobi.</p><h2>Experiences Associated With This Trip</h2><ul><li><p>Amboseli game drives</p></li><li><p>Elephant viewing</p></li><li><p>Mount Kilimanjaro views</p></li><li><p>Wildlife photography</p></li><li><p>Morning game drive</p></li><li><p>Afternoon game drive</p></li><li><p>Scenic road travel</p></li><li><p>Overnight in Amboseli</p></li></ul><h2>This Is Suitable For</h2><ul><li><p>Travelers with limited time in Kenya</p></li><li><p>Couples and small private groups</p></li><li><p>Families with children</p></li><li><p>Elephant and wildlife enthusiasts</p></li><li><p>Nature photographers</p></li><li><p>First-time safari guests</p></li></ul>$overview$
    ),
    '[
      {"question":"How many game drives are included?","answer":"The itinerary includes an afternoon game drive on Day 1 and a morning game drive on Day 2."},
      {"question":"Can guests see Mount Kilimanjaro?","answer":"Yes, weather permitting. Cloud cover may affect visibility."},
      {"question":"Is Amboseli good for elephant viewing?","answer":"Yes. Amboseli is especially known for elephant sightings, although wildlife encounters cannot be guaranteed."},
      {"question":"Is accommodation included?","answer":"Yes. The itinerary includes one overnight stay in Amboseli, with the exact lodge or camp confirmed during booking."},
      {"question":"Is this safari suitable for families?","answer":"Yes. It can suit families, subject to the selected accommodation''s child policy and comfort with the road journey."},
      {"question":"Where does the safari start and end?","answer":"The safari starts and ends in Nairobi."}
    ]'::jsonb,
    '2 Days Amboseli Safari from Nairobi',
    '2-day Amboseli safari with Benroso Safaris, featuring elephant viewing, morning and afternoon game drives and Kilimanjaro views.',
    '2 Days Amboseli Safari from Nairobi',
    '["Amboseli short safari","Nairobi to Amboseli safari","elephant safari Kenya","Kilimanjaro safari views","Benroso Safaris"]'::jsonb,
    null,
    v_now
  );

  if v_exp_big5 is not null then
    insert into public.tour_experiences (tour_id, experience_id, position)
    values (v_tour_id, v_exp_big5, 0);
  end if;

  if v_dest_amboseli is not null then
    insert into public.tour_destinations (tour_id, destination_id, position)
    values (v_tour_id, v_dest_amboseli, 0);
  end if;
end $$;
