-- Seed draft: Nairobi Museum and City Discovery Tour (no pricing; ready for images + publish).

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
    where locale = 'en' and slug = 'nairobi-museum-and-city-discovery-tour'
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
      {"from":"Nairobi Hotel","to":"Nairobi National Museum"},
      {"from":"Nairobi National Museum","to":"Optional Snake Park"},
      {"from":"Optional Snake Park","to":"Lunch Stop"},
      {"from":"Lunch Stop","to":"Nairobi City Tour"},
      {"from":"Nairobi City Tour","to":"Nairobi Hotel"}
    ]'::jsonb,
    $notice$The Snake Park is optional and may require a separate entry fee. Museum and attraction entry fees should be confirmed before publishing the final package. The city tour route may vary due to traffic, time and local access conditions. Some museum sections may operate under different opening hours. Lunch arrangements depend on the selected restaurant. The order of activities may change depending on traffic and attraction schedules.$notice$,
    '[
      "Pick-up from your Nairobi hotel",
      "Transfer to the Nairobi National Museum",
      "Visit to the Nairobi National Museum",
      "Lunch",
      "Guided Nairobi city tour",
      "Transport between the listed attractions",
      "Return transfer to your Nairobi hotel"
    ]'::jsonb,
    '[
      "International and domestic flights",
      "Visa fees",
      "Travel insurance",
      "Nairobi National Museum entry fees unless included in the final package",
      "Snake Park entry fees",
      "Drinks and personal expenses",
      "Tips and gratuities",
      "Additional attractions not listed in the itinerary",
      "Any item not specifically mentioned under \"What Is Included\""
    ]'::jsonb,
    $itinerary$[
      {
        "day": 1,
        "title": "Nairobi Museum and City Experience",
        "description": "<p><strong>Activity:</strong> Hotel pick-up, museum visit, optional Snake Park, lunch, guided city tour and return transfer</p><p>Your day begins with pick-up from your Nairobi hotel, followed by a visit to the Nairobi National Museum.</p><p>Explore exhibitions covering Kenya’s history, culture, natural heritage and archaeology. You may also choose to visit the adjoining Snake Park, which is optional and should be confirmed before the tour.</p><p>After the museum experience, enjoy lunch before continuing with a guided Nairobi city tour. The final part of the day introduces you to major landmarks and key areas of the capital before you are transferred back to your hotel.</p>",
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
    'nairobi-museum-and-city-discovery-tour',
    'Nairobi Museum and City Discovery Tour',
    'Discover Nairobi’s history, culture and major landmarks on a guided day tour with Benroso Safaris. Visit the Nairobi National Museum, explore the optional Snake Park, enjoy lunch and continue with a city sightseeing experience.',
    jsonb_build_object(
      'html',
      $overview$<p>The Nairobi Museum and City Discovery Tour is designed for travelers who want to understand Kenya’s capital through history, culture and urban sightseeing. The day begins with pick-up from your hotel and a visit to the Nairobi National Museum.</p><p>The museum introduces guests to Kenya’s cultural heritage, archaeology, natural history and national story through a range of exhibitions. Visitors may also choose to explore the adjoining Snake Park, which is optional and available depending on interest and time.</p><p>After lunch, the excursion continues with a guided Nairobi city tour. This section provides a broader view of the capital, including major landmarks and notable areas that help explain Nairobi’s growth and character.</p><p>Benroso Safaris recommends this tour for first-time visitors, families, students, culture enthusiasts and travelers who want a break from wildlife-focused activities. It is a practical full-day experience that combines education, sightseeing and a deeper understanding of Nairobi.</p><h2>Experiences Associated With This Trip</h2><ul><li><p>Nairobi National Museum visit</p></li><li><p>Kenyan history and culture</p></li><li><p>Archaeology exhibitions</p></li><li><p>Natural heritage displays</p></li><li><p>Optional Snake Park visit</p></li><li><p>Guided Nairobi city tour</p></li><li><p>Major landmark sightseeing</p></li><li><p>Selected restaurant lunch</p></li></ul><h2>This Is Suitable For</h2><ul><li><p>First-time visitors to Nairobi</p></li><li><p>Families and students</p></li><li><p>Culture and history enthusiasts</p></li><li><p>Couples and small groups</p></li><li><p>Guests with one free day in the city</p></li><li><p>Travelers seeking a non-wildlife excursion</p></li></ul>$overview$
    ),
    '[
      {"question":"Which attractions are included?","answer":"The excursion includes the Nairobi National Museum and a guided Nairobi city tour."},
      {"question":"Is the Snake Park included?","answer":"The Snake Park is optional and may attract a separate entry fee."},
      {"question":"Is lunch included?","answer":"Yes. Lunch is listed in the itinerary."},
      {"question":"Is this tour suitable for children?","answer":"Yes. The museum and city tour can be suitable for families and school-age children."},
      {"question":"How long does the tour take?","answer":"This is a full-day excursion, with the exact duration depending on traffic, attraction schedules and the hotel location."},
      {"question":"Where does the tour start and end?","answer":"The experience starts and ends at your Nairobi hotel."}
    ]'::jsonb,
    'Nairobi Museum and City Discovery Tour',
    'Nairobi Museum and city discovery tour with Benroso Safaris, featuring the National Museum, optional Snake Park, lunch and landmark sightseeing.',
    'Nairobi Museum and City Discovery Tour',
    '["Nairobi National Museum tour","Nairobi city excursion","Snake Park Nairobi","cultural tour Nairobi","Benroso Safaris"]'::jsonb,
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
