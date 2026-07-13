-- Seed draft: Nairobi Wildlife and City Day Tour (no pricing; ready for images + publish).

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
    where locale = 'en' and slug = 'nairobi-wildlife-and-city-day-tour'
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
      {"from":"Nairobi Hotel","to":"David Sheldrick Elephant Orphanage"},
      {"from":"David Sheldrick Elephant Orphanage","to":"Giraffe Centre"},
      {"from":"Giraffe Centre","to":"Lunch Stop"},
      {"from":"Lunch Stop","to":"Nairobi City Tour"},
      {"from":"Nairobi City Tour","to":"Nairobi Hotel"}
    ]'::jsonb,
    $notice$The elephant orphanage operates within specific visiting hours. Advance reservations may be required. Giraffe interactions follow the centre’s operating rules. Attraction entry fees should be confirmed before publishing the final package price. The city landmarks visited may vary depending on traffic, time and local access conditions. The sequence of activities may change to match attraction opening times.$notice$,
    '[
      "Pick-up from your Nairobi hotel",
      "Visit to the David Sheldrick Elephant Orphanage",
      "Visit to the Giraffe Centre",
      "Lunch",
      "Guided Nairobi city tour",
      "Transport between the listed attractions",
      "Return transfer to your Nairobi hotel"
    ]'::jsonb,
    '[
      "International and domestic flights",
      "Visa fees",
      "Travel insurance",
      "Attraction entry fees unless included in the final package",
      "Drinks and personal expenses",
      "Tips and gratuities",
      "Additional activities not listed in the itinerary",
      "Any item not specifically mentioned under \"What Is Included\""
    ]'::jsonb,
    $itinerary$[
      {
        "day": 1,
        "title": "Nairobi Wildlife and City Experience",
        "description": "<p><strong>Activity:</strong> Hotel pick-up, elephant orphanage visit, giraffe encounter, lunch, guided city tour and return transfer</p><p>Your day begins with pick-up from your Nairobi hotel, followed by a visit to the David Sheldrick Elephant Orphanage. Learn about the rescue and rehabilitation of orphaned elephants and the conservation work that supports their eventual return to the wild.</p><p>Continue to the Giraffe Centre, where you can observe and interact with endangered Rothschild’s giraffes. After the wildlife visits, enjoy lunch before beginning a guided tour of Nairobi.</p><p>The city tour introduces you to major landmarks and provides an overview of Nairobi’s history, character and urban development. At the end of the excursion, you will be transferred back to your hotel.</p>",
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
    'nairobi-wildlife-and-city-day-tour',
    'Nairobi Wildlife and City Day Tour',
    'Explore Nairobi’s Elephant Orphanage, Giraffe Centre and major city landmarks on a guided day tour with Benroso Safaris. Enjoy close wildlife encounters, lunch and a practical introduction to Kenya’s capital.',
    jsonb_build_object(
      'html',
      $overview$<p>The Nairobi Wildlife and City Day Tour combines two of the capital’s best-known conservation attractions with a guided introduction to the city itself. The excursion begins with pick-up from your hotel and a visit to the David Sheldrick Elephant Orphanage.</p><p>Guests learn about the rescue and rehabilitation of orphaned elephants before continuing to the Giraffe Centre, where endangered Rothschild’s giraffes can be observed at close range. These two stops provide a meaningful introduction to wildlife conservation without leaving Nairobi.</p><p>After lunch, the itinerary continues with a guided city tour covering major landmarks and key areas of the capital. This gives travelers a broader understanding of Nairobi beyond its wildlife attractions.</p><p>Benroso Safaris recommends this excursion for first-time visitors, families, couples and guests with one free day in the city. It is especially suitable for travelers who want wildlife encounters and city sightseeing in one well-organized experience.</p><h2>Experiences Associated With This Trip</h2><ul><li><p>Elephant orphanage visit</p></li><li><p>Elephant conservation education</p></li><li><p>Rothschild’s giraffe encounter</p></li><li><p>Giraffe conservation experience</p></li><li><p>Guided Nairobi city tour</p></li><li><p>Major landmark sightseeing</p></li><li><p>Selected restaurant lunch</p></li><li><p>Nairobi day excursion</p></li></ul><h2>This Is Suitable For</h2><ul><li><p>First-time visitors to Nairobi</p></li><li><p>Families with children</p></li><li><p>Couples and small private groups</p></li><li><p>Conservation-minded travelers</p></li><li><p>Guests with one free day in the city</p></li><li><p>Visitors interested in wildlife and urban culture</p></li></ul>$overview$
    ),
    '[
      {"question":"Which attractions are included?","answer":"The tour includes the David Sheldrick Elephant Orphanage, Giraffe Centre and a guided Nairobi city tour."},
      {"question":"Is lunch included?","answer":"Yes. Lunch is listed in the source itinerary."},
      {"question":"What does the city tour cover?","answer":"The itinerary states that major Nairobi landmarks are included. The exact route should be confirmed before departure."},
      {"question":"Can children join this tour?","answer":"Yes. The excursion is suitable for families, subject to the attractions’ visitor policies."},
      {"question":"Are attraction entry fees included?","answer":"The source document does not confirm this, so entry fees should be verified before booking."},
      {"question":"Where does the tour start and end?","answer":"The excursion starts and ends at your Nairobi hotel."}
    ]'::jsonb,
    'Nairobi Wildlife and City Day Tour',
    'Nairobi wildlife and city day tour with Benroso Safaris, featuring the Elephant Orphanage, Giraffe Centre, lunch and major landmarks.',
    'Nairobi Wildlife and City Day Tour',
    '["Nairobi city tour","Elephant Orphanage and Giraffe Centre","Nairobi day excursion","family tour Nairobi","Benroso Safaris"]'::jsonb,
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
