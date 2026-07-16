-- Seed draft: 2 Days Lake Naivasha and Hell's Gate Safari (no pricing; ready for images + publish).

do $$
declare
  v_tour_id uuid := gen_random_uuid();
  v_exp_big5 uuid;
  v_dest_naivasha uuid;
  v_dest_hells_gate uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.tour_translations
    where locale = 'en' and slug = '2-days-lake-naivasha-and-hells-gate-safari'
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
  into v_dest_naivasha
  from public.destinations d
  join public.destination_translations dt on dt.destination_id = d.id
  where dt.locale = 'en' and dt.slug = 'lake-naivasha'
  limit 1;

  select d.id
  into v_dest_hells_gate
  from public.destinations d
  join public.destination_translations dt on dt.destination_id = d.id
  where dt.locale = 'en' and dt.slug = 'hells-gate-national-park'
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
      {"from":"Nairobi","to":"Lake Naivasha"},
      {"from":"Lake Naivasha","to":"Hell''s Gate National Park"},
      {"from":"Hell''s Gate National Park","to":"Nairobi"}
    ]'::jsonb,
    $notice$Boat rides depend on weather, water and safety conditions. Crescent Island is optional and should be confirmed separately. Cycling and nature walks in Hell''s Gate are optional unless added to the package. Bicycle hire may attract an additional charge. Gorge access may depend on park restrictions and safety conditions. Accommodation names are not provided in the source document. Park entry fees and meal arrangements should be confirmed before publishing the final package.$notice$,
    '[
      "Road transport from Nairobi to Lake Naivasha",
      "Scenic travel through the Great Rift Valley",
      "One night''s accommodation in Naivasha",
      "Transfer from Lake Naivasha to Hell''s Gate National Park",
      "Morning visit to Hell''s Gate National Park",
      "Game viewing in Hell''s Gate",
      "Exploration of the park''s cliffs, gorges and geothermal landscapes",
      "Return road transport to Nairobi"
    ]'::jsonb,
    '[
      "International and domestic flights",
      "Visa fees",
      "Travel insurance",
      "Park and attraction entry fees unless included in the final package",
      "Lake Naivasha boat ride",
      "Crescent Island visit",
      "Bicycle hire",
      "Guided nature walks",
      "Meals not clearly stated in the itinerary",
      "Drinks and personal expenses",
      "Tips and gratuities",
      "Any item not specifically mentioned under \"What Is Included\""
    ]'::jsonb,
    $itinerary$[
      {
        "day": 1,
        "title": "Nairobi to Lake Naivasha",
        "description": "<p><strong>Activity:</strong> Scenic Rift Valley drive, arrival in Naivasha, optional boat ride, optional Crescent Island visit and overnight stay</p><p>Your short safari begins with departure from Nairobi and a scenic drive through the Great Rift Valley toward Lake Naivasha.</p><p>On arrival, settle into your selected accommodation and enjoy the lakeside surroundings. Guests may choose an optional boat ride on Lake Naivasha or an optional visit to Crescent Island for a walking safari experience.</p><p>The remainder of the day is spent in Naivasha before dinner and an overnight stay.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected lodge/hotel, to be confirmed based on package selection"],
        "mealPlan": "Dinner"
      },
      {
        "day": 2,
        "title": "Hell''s Gate National Park to Nairobi",
        "description": "<p><strong>Activity:</strong> Hell''s Gate visit, game viewing, optional cycling, optional nature walk, scenic exploration and return journey</p><p>After breakfast, travel to Hell''s Gate National Park for a morning of exploration. The park is known for its dramatic cliffs, gorges and geothermal landscapes.</p><p>Enjoy game viewing within the park, with cycling and nature walks available as optional activities. Take time to appreciate the scenery before leaving Hell''s Gate and beginning the return journey to Nairobi in the afternoon or evening.</p>",
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
    '2-days-lake-naivasha-and-hells-gate-safari',
    '2 Days Lake Naivasha and Hell''s Gate Safari',
    'Explore Lake Naivasha and Hell''s Gate on a 2-day short safari with Benroso Safaris. Enjoy Rift Valley scenery, optional boat and Crescent Island experiences, plus cycling, game viewing and nature walks in Hell''s Gate.',
    jsonb_build_object(
      'html',
      $overview$<p>The 2 Days Lake Naivasha and Hell's Gate Safari offers a varied Rift Valley experience combining lakeside relaxation with outdoor adventure. The journey begins in Nairobi and follows a scenic route to Lake Naivasha, where guests spend the first day enjoying the peaceful surroundings.</p><p>Optional activities may include a boat ride on the lake or a visit to Crescent Island for a walking safari. These experiences can be added according to guest preference and the final package arrangement.</p><p>The second day focuses on Hell's Gate National Park, a destination known for its cliffs, gorges and geothermal scenery. Guests can enjoy game viewing and may also choose cycling or a guided nature walk, depending on park conditions and availability.</p><p>Benroso Safaris recommends this short safari for couples, families, small groups and active travelers. It is particularly suitable for guests looking for a compact itinerary that combines nature, scenery and light adventure close to Nairobi.</p><h2>Experiences Associated With This Trip</h2><ul><li><p>Lake Naivasha stay</p></li><li><p>Great Rift Valley scenery</p></li><li><p>Optional Lake Naivasha boat ride</p></li><li><p>Optional Crescent Island visit</p></li><li><p>Hell's Gate game viewing</p></li><li><p>Optional cycling safari</p></li><li><p>Optional nature walk</p></li><li><p>Gorge and cliff scenery</p></li><li><p>Geothermal landscapes</p></li><li><p>Scenic road travel</p></li></ul><h2>This Is Suitable For</h2><ul><li><p>Couples and small private groups</p></li><li><p>Families with older children</p></li><li><p>Active travelers</p></li><li><p>Nature and landscape photographers</p></li><li><p>Guests seeking a short Rift Valley safari</p></li><li><p>Travelers combining relaxation and outdoor adventure</p></li></ul>$overview$
    ),
    '[
      {"question":"Which destinations are included?","answer":"The safari includes Lake Naivasha and Hell''s Gate National Park."},
      {"question":"Is the Lake Naivasha boat ride included?","answer":"No. The boat ride is listed as optional and should be confirmed separately."},
      {"question":"Is Crescent Island included?","answer":"No. The Crescent Island visit is optional."},
      {"question":"Can guests cycle in Hell''s Gate?","answer":"Yes. Cycling is listed as an optional activity and may require separate bicycle hire."},
      {"question":"Are nature walks included?","answer":"Nature walks are optional and should be confirmed before booking."},
      {"question":"Where does the safari start and end?","answer":"The safari starts and ends in Nairobi."}
    ]'::jsonb,
    '2 Days Lake Naivasha and Hell''s Gate Safari',
    '2-day Lake Naivasha and Hell''s Gate safari with Benroso Safaris, featuring Rift Valley scenery, optional boat rides, cycling and nature walks.',
    '2 Days Lake Naivasha and Hell''s Gate Safari',
    '["Lake Naivasha Hell''s Gate safari","short Rift Valley safari","Hell''s Gate cycling safari","Naivasha boat safari","Benroso Safaris"]'::jsonb,
    null,
    v_now
  );

  if v_exp_big5 is not null then
    insert into public.tour_experiences (tour_id, experience_id, position)
    values (v_tour_id, v_exp_big5, 0);
  end if;

  if v_dest_naivasha is not null then
    insert into public.tour_destinations (tour_id, destination_id, position)
    values (v_tour_id, v_dest_naivasha, 0);
  end if;

  if v_dest_hells_gate is not null then
    insert into public.tour_destinations (tour_id, destination_id, position)
    values (v_tour_id, v_dest_hells_gate, 1);
  end if;
end $$;
