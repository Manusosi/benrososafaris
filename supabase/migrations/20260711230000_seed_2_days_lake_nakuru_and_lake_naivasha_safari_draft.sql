-- Seed draft: 2 Days Lake Nakuru and Lake Naivasha Safari (no pricing; ready for images + publish).

do $$
declare
  v_tour_id uuid := gen_random_uuid();
  v_exp_big5 uuid;
  v_dest_nakuru uuid;
  v_dest_naivasha uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.tour_translations
    where locale = 'en' and slug = '2-days-lake-nakuru-and-lake-naivasha-safari'
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
  into v_dest_nakuru
  from public.destinations d
  join public.destination_translations dt on dt.destination_id = d.id
  where dt.locale = 'en' and dt.slug = 'lake-nakuru-national-park'
  limit 1;

  select d.id
  into v_dest_naivasha
  from public.destinations d
  join public.destination_translations dt on dt.destination_id = d.id
  where dt.locale = 'en' and dt.slug = 'lake-naivasha'
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
      {"from":"Nairobi","to":"Lake Nakuru National Park"},
      {"from":"Lake Nakuru National Park","to":"Lake Naivasha"},
      {"from":"Lake Naivasha","to":"Nairobi"}
    ]'::jsonb,
    $notice$Wildlife sightings occur naturally and cannot be guaranteed. Flamingo numbers vary according to season, water levels and feeding conditions. The Lake Naivasha boat ride is optional and may cost extra. The Crescent Island visit is optional and should be confirmed separately. Accommodation names are not provided in the source document. Park entry fees and meals should be confirmed before publishing the final package price. The exact schedule may change depending on traffic and park conditions.$notice$,
    '[
      "Road transport from Nairobi to Lake Nakuru",
      "Scenic travel through the Great Rift Valley",
      "Game drive in Lake Nakuru National Park",
      "Wildlife viewing mentioned in the itinerary",
      "Transfer from Lake Nakuru to Lake Naivasha",
      "One night''s accommodation in Naivasha",
      "Return road transport to Nairobi"
    ]'::jsonb,
    '[
      "International and domestic flights",
      "Visa fees",
      "Travel insurance",
      "Park entry fees unless included in the final package",
      "Lake Naivasha boat ride",
      "Crescent Island visit",
      "Meals not clearly stated in the itinerary",
      "Drinks and personal expenses",
      "Tips and gratuities",
      "Optional activities not included in the final quotation",
      "Any item not specifically mentioned under \"What Is Included\""
    ]'::jsonb,
    $itinerary$[
      {
        "day": 1,
        "title": "Nairobi to Lake Nakuru and Naivasha",
        "description": "<p><strong>Activity:</strong> Scenic Rift Valley drive, Lake Nakuru game drive, wildlife viewing and transfer to Naivasha</p><p>Your short safari begins with departure from Nairobi and a scenic drive through the Great Rift Valley toward Lake Nakuru National Park.</p><p>On arrival, enjoy a game drive through the park with opportunities to see wildlife mentioned in the itinerary, including rhinos, giraffes, buffaloes, zebras and flamingos when they are present. The park also offers rewarding scenery and photography opportunities.</p><p>After the game drive, continue to Lake Naivasha for check-in and your overnight stay.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected lodge/hotel, to be confirmed based on package selection"],
        "mealPlan": "Dinner"
      },
      {
        "day": 2,
        "title": "Lake Naivasha to Nairobi",
        "description": "<p><strong>Activity:</strong> Optional boat ride, optional Crescent Island visit and return journey</p><p>Begin the day in Lake Naivasha. Guests may choose an optional boat ride on the lake, offering a chance to enjoy the waterside scenery and observe birdlife.</p><p>An optional visit to Crescent Island may also be arranged for guests interested in a walking safari experience. Both activities should be confirmed separately before booking.</p><p>Later, begin the return journey to Nairobi, marking the end of the 2-day safari.</p>",
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
    '2-days-lake-nakuru-and-lake-naivasha-safari',
    '2 Days Lake Nakuru and Lake Naivasha Safari',
    'Explore Lake Nakuru and Lake Naivasha on a 2-day Rift Valley safari with Benroso Safaris. Enjoy rhino and birdlife viewing, scenic drives, an overnight stay in Naivasha and optional boat and Crescent Island experiences.',
    jsonb_build_object(
      'html',
      $overview$<p>The 2 Days Lake Nakuru and Lake Naivasha Safari is a compact Rift Valley journey designed for travelers who want to experience two well-known destinations within a short itinerary. The trip begins in Nairobi and follows a scenic route through the Great Rift Valley to Lake Nakuru National Park.</p><p>A game drive in Lake Nakuru provides opportunities to search for rhinos, giraffes, buffaloes, zebras and flamingos when seasonal conditions are favorable. The park is also suited to bird watching and wildlife photography.</p><p>After the game drive, the journey continues to Lake Naivasha for an overnight stay. The following morning may include an optional boat ride or a visit to Crescent Island, depending on the selected package and guest preference.</p><p>Benroso Safaris recommends this short safari for couples, families, first-time visitors and travelers with limited time in Kenya. It offers a practical mix of wildlife viewing, Rift Valley scenery and optional lake experiences before returning to Nairobi.</p><h2>Experiences Associated With This Trip</h2><ul><li><p>Lake Nakuru game drive</p></li><li><p>Rhino viewing opportunities</p></li><li><p>Flamingo sightings when present</p></li><li><p>Giraffe and buffalo viewing</p></li><li><p>Great Rift Valley scenery</p></li><li><p>Lake Naivasha stay</p></li><li><p>Optional boat ride</p></li><li><p>Optional Crescent Island visit</p></li><li><p>Wildlife photography</p></li><li><p>Short Kenya safari</p></li></ul><h2>This Is Suitable For</h2><ul><li><p>Travelers with limited time in Kenya</p></li><li><p>Couples and small groups</p></li><li><p>Families with children</p></li><li><p>Rhino and bird-watching enthusiasts</p></li><li><p>First-time safari guests</p></li><li><p>Visitors seeking a short trip from Nairobi</p></li></ul>$overview$
    ),
    '[
      {"question":"Which destinations are included?","answer":"The safari includes Lake Nakuru National Park and Lake Naivasha."},
      {"question":"Are game drives included?","answer":"Yes. The itinerary includes a game drive in Lake Nakuru National Park."},
      {"question":"Can guests see rhinos?","answer":"Lake Nakuru offers opportunities to see rhinos, although sightings cannot be guaranteed."},
      {"question":"Is the Lake Naivasha boat ride included?","answer":"No. The boat ride is listed as optional and should be confirmed separately."},
      {"question":"Is Crescent Island included?","answer":"No. The Crescent Island visit is optional and may attract an additional cost."},
      {"question":"Where does the safari start and end?","answer":"The safari starts and ends in Nairobi."}
    ]'::jsonb,
    '2 Days Lake Nakuru and Lake Naivasha Safari',
    '2-day Lake Nakuru and Lake Naivasha safari with Benroso Safaris, featuring rhino viewing, Rift Valley scenery and optional lake activities.',
    '2 Days Lake Nakuru and Lake Naivasha Safari',
    '["Lake Nakuru safari","Lake Naivasha safari","Rift Valley short safari","rhino safari Kenya","Benroso Safaris"]'::jsonb,
    null,
    v_now
  );

  if v_exp_big5 is not null then
    insert into public.tour_experiences (tour_id, experience_id, position)
    values (v_tour_id, v_exp_big5, 0);
  end if;

  if v_dest_nakuru is not null then
    insert into public.tour_destinations (tour_id, destination_id, position)
    values (v_tour_id, v_dest_nakuru, 0);
  end if;

  if v_dest_naivasha is not null then
    insert into public.tour_destinations (tour_id, destination_id, position)
    values (v_tour_id, v_dest_naivasha, 1);
  end if;
end $$;
