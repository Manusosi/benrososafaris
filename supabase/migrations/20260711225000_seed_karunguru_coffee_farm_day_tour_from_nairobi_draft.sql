-- Seed draft: Karunguru Coffee Farm Day Tour from Nairobi (no pricing; ready for images + publish).

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
    where locale = 'en' and slug = 'karunguru-coffee-farm-day-tour-from-nairobi'
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
      {"from":"Nairobi Hotel or Residence","to":"Karunguru Coffee Estate, Kiambu"},
      {"from":"Karunguru Coffee Estate, Kiambu","to":"Nairobi Hotel or Residence"}
    ]'::jsonb,
    $notice$Estate access and tour times should be confirmed before booking. The exact duration depends on traffic and the Nairobi pick-up location. Comfortable walking shoes are recommended. Coffee purchases are not included in the tour price unless stated otherwise. Lunch arrangements may vary according to the estate’s menu and dietary requirements. Plantation activities may be affected by weather and farm operations.$notice$,
    '[
      "Pick-up from your Nairobi hotel or residence",
      "Return transport between Nairobi and Karunguru Coffee Estate",
      "Welcome and introduction to the estate",
      "Guided coffee plantation walk",
      "Visit to the coffee processing facilities",
      "Coffee roasting and brewing demonstration",
      "Guided coffee tasting",
      "Lunch at the estate",
      "Free time to explore the gardens and take photographs",
      "Return transfer to Nairobi"
    ]'::jsonb,
    '[
      "International and domestic flights",
      "Visa fees",
      "Travel insurance",
      "Estate entry fees unless included in the final package",
      "Additional drinks",
      "Coffee purchases and souvenirs",
      "Personal expenses",
      "Tips and gratuities",
      "Any activity not specifically mentioned under \"What Is Included\""
    ]'::jsonb,
    $itinerary$[
      {
        "day": 1,
        "title": "Karunguru Coffee Estate Experience",
        "description": "<p><strong>Activity:</strong> Nairobi pick-up, scenic drive, plantation walk, processing tour, roasting demonstration, coffee tasting, lunch and return transfer</p><p>Your day begins with pick-up from your Nairobi hotel or residence, followed by a scenic drive to Karunguru Coffee Estate in Kiambu County.</p><p>On arrival, receive an introduction to the history of the estate and the wider story of Kenyan coffee. Continue with a guided walk through the plantation, learning how coffee is cultivated and harvested.</p><p>The tour then visits the processing facilities, where you will follow the journey from coffee cherry to roasted bean. Enjoy a coffee roasting and brewing demonstration before participating in a guided tasting of freshly prepared premium Kenyan coffee.</p><p>After the tour, relax and enjoy lunch at the estate. There will also be time to explore the gardens, take photographs and purchase freshly roasted coffee before returning to Nairobi.</p>",
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
    'karunguru-coffee-farm-day-tour-from-nairobi',
    'Karunguru Coffee Farm Day Tour from Nairobi',
    'Discover Karunguru Coffee Estate on a day tour from Nairobi with Benroso Safaris. Walk through the plantation, learn how Kenyan coffee is processed, enjoy roasting and brewing demonstrations, taste fresh coffee and relax over lunch.',
    jsonb_build_object(
      'html',
      $overview$<p>The Karunguru Coffee Farm Day Tour from Nairobi offers a detailed introduction to one of Kenya’s best-known agricultural products. The journey begins with pick-up from your hotel or residence and a scenic drive into Kiambu County.</p><p>At Karunguru Coffee Estate, guests are introduced to the history of the farm and the development of Kenyan coffee. A guided plantation walk explains how coffee plants are cultivated and harvested, while the processing tour follows the crop from freshly picked cherry to finished roasted bean.</p><p>The experience also includes a roasting and brewing demonstration, followed by a guided tasting of freshly prepared Kenyan coffee. After lunch, guests have time to enjoy the gardens, take photographs and purchase coffee directly from the estate.</p><p>Benroso Safaris recommends this excursion for couples, families, food and culture enthusiasts, coffee lovers and travelers seeking a relaxed countryside experience close to Nairobi. It is especially suitable for visitors who want a practical, educational and enjoyable look at Kenya beyond its wildlife attractions.</p><h2>Experiences Associated With This Trip</h2><ul><li><p>Karunguru Coffee Estate visit</p></li><li><p>Guided plantation walk</p></li><li><p>Coffee cultivation experience</p></li><li><p>Coffee processing tour</p></li><li><p>Roasting demonstration</p></li><li><p>Brewing demonstration</p></li><li><p>Kenyan coffee tasting</p></li><li><p>Farm lunch</p></li><li><p>Garden photography</p></li><li><p>Coffee shopping</p></li></ul><h2>This Is Suitable For</h2><ul><li><p>Coffee and food enthusiasts</p></li><li><p>Couples and small private groups</p></li><li><p>Families and educational travelers</p></li><li><p>Culture and agriculture enthusiasts</p></li><li><p>Guests seeking a relaxed countryside tour</p></li><li><p>Visitors looking for a non-wildlife experience</p></li></ul>$overview$
    ),
    '[
      {"question":"Where is Karunguru Coffee Estate located?","answer":"The estate is in Kiambu County and is reached by road from Nairobi."},
      {"question":"Is coffee tasting included?","answer":"Yes. The itinerary includes a guided tasting of freshly brewed Kenyan coffee."},
      {"question":"Does the tour explain coffee processing?","answer":"Yes. Guests visit the processing facilities and learn how coffee moves from cherry to roasted bean."},
      {"question":"Is lunch included?","answer":"Yes. Lunch at the estate is included in the itinerary."},
      {"question":"Can guests buy coffee at the farm?","answer":"Yes. The itinerary provides time to purchase freshly roasted coffee."},
      {"question":"Is this tour suitable for children?","answer":"Yes. It can suit families, although children may enjoy the experience more if they are comfortable with walking and educational farm tours."}
    ]'::jsonb,
    'Karunguru Coffee Farm Day Tour from Nairobi',
    'Karunguru Coffee Farm day tour with Benroso Safaris, featuring plantation walks, processing, roasting, tasting and lunch near Nairobi.',
    'Karunguru Coffee Farm Day Tour from Nairobi',
    '["Karunguru Coffee Estate tour","Nairobi coffee farm excursion","Kenyan coffee tasting","Kiambu farm tour","Benroso Safaris"]'::jsonb,
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
