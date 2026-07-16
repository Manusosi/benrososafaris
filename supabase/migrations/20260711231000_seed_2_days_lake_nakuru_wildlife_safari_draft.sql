-- Seed draft: 2 Days Lake Nakuru Wildlife Safari (no pricing; ready for images + publish).

do $$
declare
  v_tour_id uuid := gen_random_uuid();
  v_exp_big5 uuid;
  v_dest_nakuru uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.tour_translations
    where locale = 'en' and slug = '2-days-lake-nakuru-wildlife-safari'
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
      {"from":"Nairobi","to":"Great Rift Valley Viewpoint"},
      {"from":"Great Rift Valley Viewpoint","to":"Lake Nakuru National Park"},
      {"from":"Lake Nakuru National Park","to":"Nairobi"}
    ]'::jsonb,
    $notice$Wildlife sightings occur naturally and cannot be guaranteed. Flamingo sightings vary according to season and water conditions. Accommodation names are not provided in the source document. Park entry fees and meal arrangements should be confirmed before publishing the final package. The exact timing of game drives may change depending on park conditions and traffic. Photography conditions depend on weather and visibility.$notice$,
    '[
      "Road transport from Nairobi to Lake Nakuru and back",
      "Stop at a Great Rift Valley viewpoint",
      "Afternoon game drive in Lake Nakuru National Park",
      "Morning game drive in Lake Nakuru National Park",
      "Wildlife viewing and photography opportunities",
      "One night''s accommodation near Lake Nakuru"
    ]'::jsonb,
    '[
      "International and domestic flights",
      "Visa fees",
      "Travel insurance",
      "Park entry fees unless included in the final package",
      "Meals not clearly stated in the itinerary",
      "Drinks and personal expenses",
      "Tips and gratuities",
      "Optional activities not listed in the itinerary",
      "Any item not specifically mentioned under \"What Is Included\""
    ]'::jsonb,
    $itinerary$[
      {
        "day": 1,
        "title": "Nairobi to Lake Nakuru National Park",
        "description": "<p><strong>Activity:</strong> Scenic road transfer, Rift Valley viewpoint stop, afternoon game drive and overnight stay</p><p>Your safari begins with departure from Nairobi for Lake Nakuru National Park. Travel through the Great Rift Valley and stop at a viewpoint to take in the surrounding landscapes and enjoy photography.</p><p>Continue to Lake Nakuru and prepare for an afternoon game drive. Explore the park in search of its wildlife and birdlife before heading to your selected accommodation near the park for the evening.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected lodge/hotel, to be confirmed based on package selection"],
        "mealPlan": "Dinner"
      },
      {
        "day": 2,
        "title": "Lake Nakuru to Nairobi",
        "description": "<p><strong>Activity:</strong> Morning game drive, wildlife viewing, photography and return journey</p><p>Begin the day with a morning game drive in Lake Nakuru National Park. The cooler morning hours offer another opportunity to search for wildlife and photograph the park''s scenery.</p><p>After the game drive, leave Lake Nakuru and begin the return journey to Nairobi, marking the end of the short safari.</p>",
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
    '2-days-lake-nakuru-wildlife-safari',
    '2 Days Lake Nakuru Wildlife Safari',
    'Discover Lake Nakuru on a 2-day wildlife safari with Benroso Safaris. Enjoy scenic Rift Valley travel, afternoon and morning game drives, rhino and birdlife viewing, photography opportunities and an overnight stay near the park.',
    jsonb_build_object(
      'html',
      $overview$<p>The 2 Days Lake Nakuru Wildlife Safari is a short Rift Valley escape designed for travelers who want focused wildlife viewing within easy reach of Nairobi. The journey begins with a scenic drive through the Great Rift Valley, including a stop at a viewpoint before continuing to Lake Nakuru National Park.</p><p>An afternoon game drive provides the first opportunity to explore the park and observe its wildlife and birdlife. After an overnight stay near Lake Nakuru, the second day begins with another game drive, giving guests more time for photography and wildlife sightings before returning to Nairobi.</p><p>The itinerary is simple and well paced, making it ideal for visitors who want a short safari without covering several destinations. Benroso Safaris recommends this package for couples, families, photographers, birdwatchers and first-time safari guests with limited time in Kenya.</p><h2>Experiences Associated With This Trip</h2><ul><li><p>Lake Nakuru game drives</p></li><li><p>Great Rift Valley scenery</p></li><li><p>Rhino viewing opportunities</p></li><li><p>Bird watching</p></li><li><p>Wildlife photography</p></li><li><p>Morning game drive</p></li><li><p>Afternoon game drive</p></li><li><p>Scenic road travel</p></li></ul><h2>This Is Suitable For</h2><ul><li><p>Travelers with limited time in Kenya</p></li><li><p>Couples and small groups</p></li><li><p>Families with children</p></li><li><p>Rhino and bird-watching enthusiasts</p></li><li><p>Wildlife photographers</p></li><li><p>First-time safari guests</p></li></ul>$overview$
    ),
    '[
      {"question":"Which destination is included?","answer":"The safari focuses entirely on Lake Nakuru National Park."},
      {"question":"How many game drives are included?","answer":"The itinerary includes an afternoon game drive on Day 1 and a morning game drive on Day 2."},
      {"question":"Can guests see rhinos?","answer":"Lake Nakuru is known for rhino viewing opportunities, although sightings are not guaranteed."},
      {"question":"Is this safari good for bird watching?","answer":"Yes. Lake Nakuru supports a wide variety of birdlife, with sightings varying by season."},
      {"question":"Is accommodation included?","answer":"Yes. The itinerary includes one overnight stay near Lake Nakuru, with the exact lodge or hotel confirmed during booking."},
      {"question":"Where does the safari start and end?","answer":"The safari starts and ends in Nairobi."}
    ]'::jsonb,
    '2 Days Lake Nakuru Wildlife Safari',
    '2-day Lake Nakuru wildlife safari with Benroso Safaris, featuring Rift Valley views, morning and afternoon game drives, rhinos and birdlife.',
    '2 Days Lake Nakuru Wildlife Safari',
    '["Lake Nakuru short safari","rhino safari Kenya","Lake Nakuru game drive","Rift Valley wildlife safari","Benroso Safaris"]'::jsonb,
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
end $$;
