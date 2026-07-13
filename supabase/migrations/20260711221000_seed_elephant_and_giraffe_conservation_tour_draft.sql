-- Seed draft: Elephant and Giraffe Conservation Tour (no pricing; ready for images + publish).

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
    where locale = 'en' and slug = 'elephant-and-giraffe-conservation-tour-nairobi'
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
      {"from":"David Sheldrick Elephant Orphanage","to":"Lunch Stop"},
      {"from":"Lunch Stop","to":"Giraffe Centre"},
      {"from":"Giraffe Centre","to":"Nairobi Hotel"}
    ]'::jsonb,
    $notice$The elephant orphanage operates within specific visiting hours. Advance booking may be required for the elephant orphanage. Giraffe interactions follow the centre’s visitor rules. Attraction entry fees should be confirmed before publishing the final price. Lunch arrangements depend on the selected restaurant and package. The order of the two attractions may change due to traffic and operating times.$notice$,
    '[
      "Pick-up from your Nairobi hotel",
      "Transfer to the David Sheldrick Elephant Orphanage",
      "Elephant orphanage visit",
      "Lunch",
      "Transfer to the Giraffe Centre",
      "Giraffe Centre visit",
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
        "title": "Elephant and Giraffe Conservation Experience",
        "description": "<p><strong>Activity:</strong> Hotel pick-up, elephant orphanage visit, lunch, Giraffe Centre visit and return transfer</p><p>Your excursion begins with pick-up from your Nairobi hotel, followed by a transfer to the David Sheldrick Elephant Orphanage.</p><p>During the visit, learn about the rescue, care and rehabilitation of orphaned elephants. After the elephant experience, stop for lunch before continuing to the Giraffe Centre.</p><p>At the Giraffe Centre, observe and interact with endangered Rothschild’s giraffes while learning about conservation efforts aimed at protecting the species. After the visit, return to your hotel.</p>",
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
    'elephant-and-giraffe-conservation-tour-nairobi',
    'Elephant and Giraffe Conservation Tour',
    'Visit Nairobi’s Elephant Orphanage and Giraffe Centre on a short conservation tour with Benroso Safaris. Learn about rescued elephants, meet endangered Rothschild’s giraffes and enjoy lunch during a well-paced city excursion.',
    jsonb_build_object(
      'html',
      $overview$<p>The Elephant and Giraffe Conservation Tour brings together two of Nairobi’s best-known wildlife conservation attractions in one convenient day experience. The excursion begins with pick-up from your hotel and a visit to the David Sheldrick Elephant Orphanage.</p><p>Guests learn about the rescue and rehabilitation of orphaned elephants and gain insight into the work involved in preparing them for eventual return to the wild. The tour then pauses for lunch before continuing to the Giraffe Centre.</p><p>At the Giraffe Centre, visitors can see endangered Rothschild’s giraffes at close range and learn about efforts to protect the species. The experience is engaging, educational and suitable for travelers who want meaningful wildlife encounters without leaving Nairobi.</p><p>Benroso Safaris recommends this excursion for families, couples, first-time visitors and conservation-minded travelers. It is also a practical choice for guests with one free day in the city or a limited Nairobi stay.</p><h2>Experiences Associated With This Trip</h2><ul><li><p>Elephant orphanage visit</p></li><li><p>Elephant conservation education</p></li><li><p>Rothschild’s giraffe encounter</p></li><li><p>Giraffe conservation experience</p></li><li><p>Nairobi wildlife excursion</p></li><li><p>Selected restaurant lunch</p></li><li><p>Guided city transfers</p></li></ul><h2>This Is Suitable For</h2><ul><li><p>Families with children</p></li><li><p>Couples and small private groups</p></li><li><p>Conservation enthusiasts</p></li><li><p>First-time visitors to Nairobi</p></li><li><p>Travelers with limited time</p></li><li><p>Wildlife and photography lovers</p></li></ul>$overview$
    ),
    '[
      {"question":"Which attractions are included?","answer":"The tour includes the David Sheldrick Elephant Orphanage and the Giraffe Centre."},
      {"question":"Is lunch included?","answer":"Yes. Lunch is listed in the source itinerary."},
      {"question":"Can children join this excursion?","answer":"Yes. The experience is suitable for families, subject to the attractions’ visitor policies."},
      {"question":"Are entry fees included?","answer":"The source document does not confirm this, so attraction entry fees should be verified before booking."},
      {"question":"How long does the tour take?","answer":"The experience generally occupies most of the day, depending on traffic, hotel location and attraction schedules."},
      {"question":"Where does the tour start and end?","answer":"The excursion starts and ends at your Nairobi hotel."}
    ]'::jsonb,
    'Elephant and Giraffe Conservation Tour',
    'Elephant and giraffe conservation tour with Benroso Safaris, visiting Nairobi’s Elephant Orphanage and Giraffe Centre with lunch.',
    'Elephant and Giraffe Conservation Tour Nairobi',
    '["Nairobi conservation tour","Elephant Orphanage Nairobi","Giraffe Centre tour","family Nairobi excursion","Benroso Safaris"]'::jsonb,
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
