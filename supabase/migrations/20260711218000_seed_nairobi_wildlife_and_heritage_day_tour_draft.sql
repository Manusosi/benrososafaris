-- Seed draft: Nairobi Wildlife and Heritage Day Tour (no pricing; ready for images + publish).

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
    where locale = 'en' and slug = 'nairobi-wildlife-and-heritage-day-tour'
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
      {"from":"Nairobi Hotel or Residence","to":"Nairobi National Park"},
      {"from":"Nairobi National Park","to":"Sheldrick Elephant Orphanage"},
      {"from":"Sheldrick Elephant Orphanage","to":"Selected Restaurant"},
      {"from":"Selected Restaurant","to":"Giraffe Centre"},
      {"from":"Giraffe Centre","to":"Karen Blixen Museum"},
      {"from":"Karen Blixen Museum","to":"Nairobi Hotel or Residence"}
    ]'::jsonb,
    $notice$Wildlife sightings are natural and cannot be guaranteed. The elephant orphanage operates within specific visiting hours. Entry fees should be confirmed before the final package is published. Giraffe interactions depend on the centre’s operating rules. The sequence of attractions may change based on traffic and opening times. Lunch location will depend on the selected package and availability.$notice$,
    '[
      "Pick-up from your Nairobi hotel or residence",
      "Transport between all attractions listed in the itinerary",
      "Guided game drive in Nairobi National Park",
      "Visit to the David Sheldrick Elephant Orphanage",
      "Lunch at a selected restaurant",
      "Visit to the Giraffe Centre",
      "Visit to the Karen Blixen Museum",
      "Drop-off at your Nairobi hotel or residence"
    ]'::jsonb,
    '[
      "International and domestic flights",
      "Visa fees",
      "Travel insurance",
      "Entry fees unless included in the final package",
      "Drinks and personal expenses",
      "Tips and gratuities",
      "Additional activities not listed in the itinerary",
      "Any item not specifically mentioned under \"What Is Included\""
    ]'::jsonb,
    $itinerary$[
      {
        "day": 1,
        "title": "Nairobi Wildlife and Heritage Experience",
        "description": "<p><strong>Activity:</strong> Hotel pick-up, game drive, elephant orphanage visit, lunch, giraffe encounter and museum tour</p><p>Your full-day excursion begins with pick-up from your Nairobi hotel or residence. Travel to Nairobi National Park for a guided game drive, enjoying the rare experience of viewing wildlife against the backdrop of the city skyline.</p><p>Continue to the David Sheldrick Elephant Orphanage to learn about elephant rescue, rehabilitation and conservation. After the visit, enjoy lunch at a selected restaurant before proceeding to the Giraffe Centre, where you can see and interact with endangered Rothschild’s giraffes.</p><p>The final stop is the Karen Blixen Museum, where you will explore the former home of the renowned author and learn about Nairobi’s early history. After the tour, you will be dropped off at your hotel or residence.</p>",
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
    'nairobi-wildlife-and-heritage-day-tour',
    'Nairobi Wildlife and Heritage Day Tour',
    'Explore Nairobi National Park, the Sheldrick Elephant Orphanage, Giraffe Centre and Karen Blixen Museum on a full-day excursion with Benroso Safaris, combining wildlife, conservation, culture and history without leaving Nairobi.',
    jsonb_build_object(
      'html',
      $overview$<p>The Nairobi Wildlife and Heritage Day Tour offers a convenient way to experience wildlife, conservation and history within Kenya’s capital. The day begins with pick-up from your Nairobi hotel or residence, followed by a guided game drive in Nairobi National Park.</p><p>The park provides opportunities to observe wildlife while enjoying the unusual contrast of open savannah and the Nairobi skyline. The route then continues to the David Sheldrick Elephant Orphanage, where guests learn about rescued elephants and ongoing conservation work.</p><p>After lunch at a selected restaurant, the tour proceeds to the Giraffe Centre for a close encounter with endangered Rothschild’s giraffes. The final visit is the Karen Blixen Museum, which introduces guests to the author’s former home and an important part of Nairobi’s colonial history.</p><p>Benroso Safaris recommends this excursion for travelers with one free day in Nairobi, families, couples, first-time visitors and guests with a long airport layover. It combines several of the city’s best-known attractions in one practical and well-paced experience.</p><h2>Experiences Associated With This Trip</h2><ul><li><p>Nairobi National Park game drive</p></li><li><p>City skyline wildlife photography</p></li><li><p>Elephant conservation experience</p></li><li><p>Rothschild’s giraffe encounter</p></li><li><p>Karen Blixen Museum visit</p></li><li><p>Nairobi sightseeing</p></li><li><p>Wildlife and heritage tour</p></li><li><p>Guided city excursion</p></li></ul><h2>This Is Suitable For</h2><ul><li><p>Travelers with one free day in Nairobi</p></li><li><p>Families with children</p></li><li><p>Couples and small groups</p></li><li><p>First-time visitors to Kenya</p></li><li><p>Guests on a Nairobi stopover</p></li><li><p>Wildlife, conservation and history enthusiasts</p></li></ul>$overview$
    ),
    '[
      {"question":"How long does the tour take?","answer":"This is a full-day Nairobi excursion, with the exact duration depending on traffic, attraction schedules and your pick-up location."},
      {"question":"Is a Nairobi National Park game drive included?","answer":"Yes. The itinerary includes a guided game drive in Nairobi National Park."},
      {"question":"Is lunch included?","answer":"Yes. Lunch at a selected restaurant is included in the itinerary."},
      {"question":"Can children join this tour?","answer":"Yes. The tour is suitable for families, although attraction rules and child rates should be confirmed."},
      {"question":"Are entry fees included?","answer":"The source document does not confirm this, so entry fees should be verified before booking."},
      {"question":"Where does the tour start and end?","answer":"The excursion starts and ends at your Nairobi hotel or residence."}
    ]'::jsonb,
    'Nairobi Wildlife and Heritage Day Tour',
    'Nairobi wildlife and heritage day tour with Benroso Safaris, featuring Nairobi National Park, elephant orphanage, giraffes and Karen Blixen Museum.',
    'Nairobi Wildlife and Heritage Day Tour',
    '["Nairobi day tour","Nairobi National Park safari","Sheldrick Elephant Orphanage tour","Giraffe Centre Nairobi","Karen Blixen Museum tour"]'::jsonb,
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
