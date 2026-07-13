-- Seed draft: Kiambethu Tea Farm Day Tour from Nairobi (no pricing; ready for images + publish).

do $$
declare
  v_tour_id uuid := gen_random_uuid();
  v_exp_excursions uuid;
  v_dest_nairobi uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.tour_translations
    where locale = 'en' and slug = 'kiambethu-tea-farm-day-tour-from-nairobi'
  ) then
    return;
  end if;

  select e.id
  into v_exp_excursions
  from public.experiences e
  join public.experience_translations et on et.experience_id = e.id
  where et.locale = 'en' and et.slug = 'excursions'
  limit 1;

  select d.id
  into v_dest_nairobi
  from public.destinations d
  join public.destination_translations dt on dt.destination_id = d.id
  where dt.locale = 'en' and dt.slug = 'nairobi'
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
    1,
    0,
    array['kenya']::text[],
    'Nairobi',
    'Nairobi',
    '[
      {"from":"Nairobi Hotel","to":"Kiambethu Tea Farm"},
      {"from":"Kiambethu Tea Farm","to":"Nairobi Hotel"}
    ]'::jsonb,
    $notice$Farm entry arrangements should be confirmed before booking. The exact duration depends on traffic and the selected pick-up location. Forest walks may depend on weather and ground conditions. Guests should wear comfortable walking shoes. Lunch arrangements may vary according to the farm’s menu and dietary requests. The order of activities may change depending on farm operations.$notice$,
    '[
      "Pick-up from your Nairobi hotel",
      "Return transport between Nairobi and Kiambethu Tea Farm",
      "Guided tea farm tour",
      "Tea tasting experience",
      "Guided walk through the indigenous forest",
      "Traditional lunch at the farm",
      "Return transfer to Nairobi"
    ]'::jsonb,
    '[
      "International and domestic flights",
      "Visa fees",
      "Travel insurance",
      "Farm entry fees unless included in the final package",
      "Additional drinks",
      "Personal expenses",
      "Tips and gratuities",
      "Activities not listed in the itinerary",
      "Any item not specifically mentioned under \"What Is Included\""
    ]'::jsonb,
    $itinerary$[
      {
        "day": 1,
        "title": "Kiambethu Tea Farm Experience",
        "description": "<p><strong>Activity:</strong> Hotel pick-up, scenic drive, guided tea tour, tasting, forest walk, lunch and return transfer</p><p>Your day begins with pick-up from your Nairobi hotel, followed by a scenic drive to Kiambethu Tea Farm.</p><p>On arrival, enjoy a guided tour of the farm and learn about tea growing, harvesting and the wider history of tea production in Kenya. The experience also includes a tea tasting session and a guided walk through the surrounding indigenous forest.</p><p>After the activities, enjoy a traditional lunch at the farm before beginning the return journey to Nairobi.</p>",
        "imageId": "",
        "accommodationOptions": [],
        "mealPlan": "Lunch"
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
    'kiambethu-tea-farm-day-tour-from-nairobi',
    'Kiambethu Tea Farm Day Tour from Nairobi',
    'Discover Kiambethu Tea Farm on a day tour from Nairobi with Benroso Safaris. Enjoy a scenic drive, guided tea farm walk, tea tasting, indigenous forest experience and a traditional farm lunch.',
    jsonb_build_object(
      'html',
      $overview$<p>The Kiambethu Tea Farm Day Tour from Nairobi offers a peaceful countryside experience focused on Kenyan tea, local history and nature. The journey begins with pick-up from your Nairobi hotel and a scenic drive to the farm.</p><p>During the guided visit, guests learn how tea is grown and harvested while exploring the farm’s cultivated landscapes. The itinerary also includes a tea tasting session, giving visitors an opportunity to sample Kenyan tea and better understand the production process.</p><p>A guided walk through the indigenous forest adds a natural element to the day, offering time away from the city in a quieter setting. The experience concludes with a traditional lunch served at the farm before the return transfer to Nairobi.</p><p>Benroso Safaris recommends this excursion for couples, families, food and culture enthusiasts, and travelers looking for a relaxed alternative to a wildlife safari. It is also suitable for guests interested in agriculture, Kenyan heritage and countryside experiences close to Nairobi.</p><h2>Experiences Associated With This Trip</h2><ul><li><p>Kiambethu Tea Farm visit</p></li><li><p>Guided tea farm tour</p></li><li><p>Kenyan tea tasting</p></li><li><p>Indigenous forest walk</p></li><li><p>Traditional farm lunch</p></li><li><p>Scenic countryside drive</p></li><li><p>Agricultural heritage experience</p></li><li><p>Nairobi day excursion</p></li></ul><h2>This Is Suitable For</h2><ul><li><p>Couples and small private groups</p></li><li><p>Families with children</p></li><li><p>Tea and food enthusiasts</p></li><li><p>Culture and heritage travelers</p></li><li><p>Guests seeking a relaxed countryside experience</p></li><li><p>Visitors interested in Kenyan agriculture</p></li></ul>$overview$
    ),
    '[
      {"question":"How far is Kiambethu Tea Farm from Nairobi?","answer":"The farm is reached by road from Nairobi. Travel time depends on traffic and the pick-up location."},
      {"question":"Is lunch included?","answer":"Yes. The itinerary includes a traditional lunch at the farm."},
      {"question":"Does the tour include tea tasting?","answer":"Yes. A guided tea tasting experience is included."},
      {"question":"Is there much walking involved?","answer":"The itinerary includes a guided farm tour and an indigenous forest walk, so comfortable shoes are recommended."},
      {"question":"Is the tour suitable for children?","answer":"Yes. It can be suitable for families, subject to the farm’s visitor policies and the children’s comfort with walking."},
      {"question":"Where does the excursion start and end?","answer":"The tour starts at your Nairobi hotel and ends with a return transfer to Nairobi."}
    ]'::jsonb,
    'Kiambethu Tea Farm Day Tour from Nairobi',
    'Kiambethu Tea Farm day tour with Benroso Safaris, featuring tea tasting, a guided farm visit, indigenous forest walk and traditional lunch.',
    'Kiambethu Tea Farm Day Tour from Nairobi',
    '["Kiambethu Tea Farm tour","Nairobi tea farm excursion","Kenya tea tasting tour","countryside day trip Nairobi","Benroso Safaris"]'::jsonb,
    null,
    v_now
  );

  if v_exp_excursions is not null then
    insert into public.tour_experiences (tour_id, experience_id, position)
    values (v_tour_id, v_exp_excursions, 0);
  end if;

  if v_dest_nairobi is not null then
    insert into public.tour_destinations (tour_id, destination_id, position)
    values (v_tour_id, v_dest_nairobi, 0);
  end if;
end $$;
