-- Seed draft: 2 Days Maasai Mara Safari from Nairobi (no pricing; ready for images + publish).

do $$
declare
  v_tour_id uuid := gen_random_uuid();
  v_exp_big5 uuid;
  v_dest_mara uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.tour_translations
    where locale = 'en' and slug = '2-days-maasai-mara-safari-from-nairobi'
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
    2,
    1,
    array['kenya']::text[],
    'Nairobi',
    'Nairobi',
    '[
      {"from":"Nairobi","to":"Great Rift Valley"},
      {"from":"Great Rift Valley","to":"Maasai Mara National Reserve"},
      {"from":"Maasai Mara National Reserve","to":"Nairobi"}
    ]'::jsonb,
    $notice$Wildlife sightings occur naturally and cannot be guaranteed. Accommodation names are not provided in the source document. Park entry fees and meal arrangements should be confirmed before publishing the final package. The road journey between Nairobi and Maasai Mara can be long. Game-drive timing may change depending on traffic, weather and park conditions. The short itinerary provides limited time in the reserve compared with longer Maasai Mara safaris.$notice$,
    '[
      "Road transport from Nairobi to Maasai Mara and back",
      "Scenic travel through the Great Rift Valley",
      "Afternoon game drive in Maasai Mara",
      "Morning game drive in Maasai Mara",
      "Big Five and general wildlife viewing opportunities",
      "One night''s accommodation in Maasai Mara"
    ]'::jsonb,
    '[
      "International and domestic flights",
      "Visa fees",
      "Travel insurance",
      "Maasai Mara park entry fees unless included in the final package",
      "Meals not clearly stated in the itinerary",
      "Drinks and personal expenses",
      "Tips and gratuities",
      "Optional activities not listed in the itinerary",
      "Any item not specifically mentioned under \"What Is Included\""
    ]'::jsonb,
    $itinerary$[
      {
        "day": 1,
        "title": "Nairobi to Maasai Mara National Reserve",
        "description": "<p><strong>Activity:</strong> Scenic road transfer, Great Rift Valley views, afternoon game drive and overnight stay</p><p>Your short safari begins with departure from Nairobi for the Maasai Mara National Reserve. Travel through the Great Rift Valley, enjoying the changing landscapes along the way.</p><p>On arrival in the Maasai Mara, prepare for an afternoon game drive across the reserve. The experience provides an introduction to the Mara''s open plains and wildlife before you return to your selected camp or lodge for the evening.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected lodge/camp, to be confirmed based on package selection"],
        "mealPlan": "Dinner"
      },
      {
        "day": 2,
        "title": "Maasai Mara to Nairobi",
        "description": "<p><strong>Activity:</strong> Morning game drive, Big Five search, wildlife viewing and return journey</p><p>Begin the day with a morning game drive in the Maasai Mara. Your guide will help you search for the Big Five and other wildlife found across the reserve.</p><p>After the game drive, leave the Maasai Mara and begin the road journey back to Nairobi, marking the end of the 2-day safari.</p>",
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
    '2-days-maasai-mara-safari-from-nairobi',
    '2 Days Maasai Mara Safari from Nairobi',
    'Explore the Maasai Mara on a 2-day safari from Nairobi with Benroso Safaris. Travel through the Great Rift Valley, enjoy afternoon and morning game drives, search for the Big Five and spend one night in Kenya''s most famous reserve.',
    jsonb_build_object(
      'html',
      $overview$<p>The 2 Days Maasai Mara Safari from Nairobi is designed for travelers who want a quick introduction to Kenya's best-known wildlife reserve. The journey begins in Nairobi and follows the road through the Great Rift Valley toward the Maasai Mara.</p><p>An afternoon game drive on the first day provides the first opportunity to explore the reserve and search for wildlife across its open plains. After an overnight stay in the Mara, the second day begins with another game drive before the return journey to Nairobi.</p><p>The itinerary is short and straightforward, making it suitable for guests with limited time who still want to experience the atmosphere and wildlife of the Maasai Mara. Benroso Safaris recommends this package for couples, families, small groups, business travelers and first-time safari guests.</p><h2>Experiences Associated With This Trip</h2><ul><li><p>Maasai Mara game drives</p></li><li><p>Big Five viewing opportunities</p></li><li><p>Great Rift Valley scenery</p></li><li><p>Wildlife photography</p></li><li><p>Morning game drive</p></li><li><p>Afternoon game drive</p></li><li><p>Scenic road safari</p></li><li><p>Overnight in Maasai Mara</p></li></ul><h2>This Is Suitable For</h2><ul><li><p>Travelers with limited time in Kenya</p></li><li><p>Couples and small private groups</p></li><li><p>Families with children</p></li><li><p>Business travelers adding a short safari</p></li><li><p>First-time safari guests</p></li><li><p>Wildlife and photography enthusiasts</p></li></ul>$overview$
    ),
    '[
      {"question":"How long is the drive from Nairobi to Maasai Mara?","answer":"The exact duration depends on traffic, road conditions and the location of the selected accommodation."},
      {"question":"How many game drives are included?","answer":"The itinerary includes an afternoon game drive on Day 1 and a morning game drive on Day 2."},
      {"question":"Can guests see the Big Five?","answer":"The safari includes a search for the Big Five, although sightings cannot be guaranteed."},
      {"question":"Is accommodation included?","answer":"Yes. The itinerary includes one overnight stay in Maasai Mara, with the exact lodge or camp confirmed during booking."},
      {"question":"Is this safari suitable for families?","answer":"Yes. It can suit families, subject to the selected accommodation''s child policy and comfort with the road journey."},
      {"question":"Where does the safari start and end?","answer":"The safari starts and ends in Nairobi."}
    ]'::jsonb,
    '2 Days Maasai Mara Safari from Nairobi',
    '2-day Maasai Mara safari with Benroso Safaris, featuring Rift Valley travel, morning and afternoon game drives and Big Five viewing.',
    '2 Days Maasai Mara Safari from Nairobi',
    '["Maasai Mara short safari","Nairobi to Maasai Mara safari","Big Five safari Kenya","2-day Kenya safari","Benroso Safaris"]'::jsonb,
    null,
    v_now
  );

  if v_exp_big5 is not null then
    insert into public.tour_experiences (tour_id, experience_id, position)
    values (v_tour_id, v_exp_big5, 0);
  end if;

  if v_dest_mara is not null then
    insert into public.tour_destinations (tour_id, destination_id, position)
    values (v_tour_id, v_dest_mara, 0);
  end if;
end $$;
