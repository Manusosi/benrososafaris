-- Seed draft: 3 Days Masai Mara Fly-In Safari from Nairobi (no pricing; ready for images + publish).

do $$
declare
  v_tour_id uuid := gen_random_uuid();
  v_exp_fly_in uuid;
  v_exp_big5 uuid;
  v_park_mara uuid;
  v_dest_mara uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.tour_translations
    where locale = 'en' and slug = '3-days-masai-mara-fly-in-safari-from-nairobi'
  ) then
    return;
  end if;

  select e.id
  into v_exp_fly_in
  from public.experiences e
  join public.experience_translations et on et.experience_id = e.id
  where et.locale = 'en' and et.slug = 'fly-in-safaris'
  limit 1;

  select e.id
  into v_exp_big5
  from public.experiences e
  join public.experience_translations et on et.experience_id = e.id
  where et.locale = 'en' and et.slug = 'big-5-safaris'
  limit 1;

  select np.id
  into v_park_mara
  from public.national_parks np
  join public.national_park_translations npt on npt.park_id = np.id
  where npt.locale = 'en' and npt.slug = 'maasai-mara'
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
    3,
    2,
    array['kenya']::text[],
    'Nairobi / Jomo Kenyatta International Airport',
    'Nairobi / Jomo Kenyatta International Airport',
    '[
      {"from":"Nairobi","to":"Wilson Airport"},
      {"from":"Wilson Airport","to":"Masai Mara National Reserve"},
      {"from":"Masai Mara National Reserve","to":"Wilson Airport"},
      {"from":"Wilson Airport","to":"Nairobi"}
    ]'::jsonb,
    $notice$Wildlife sightings occur naturally and cannot be guaranteed. Flights operate according to scheduled departure times and availability. Luggage allowances on small domestic aircraft may be limited. Exact camp or lodge selection depends on whether the midrange or luxury package is booked. The hot air balloon safari and Maasai village visit are optional and cost extra. Drinking water is included, while other beverages are charged separately. Flight times may be adjusted by the airline due to operational or weather conditions.$notice$,
    '[
      "Transfers to and from your Nairobi hotel, residence or airport",
      "Accommodation during the safari",
      "Meals indicated in the itinerary",
      "Unlimited drinking water during the tour",
      "Flying Doctors medical, emergency and rescue cover",
      "Return scheduled flights between Nairobi and Masai Mara",
      "Game drives and activities mentioned in the itinerary",
      "Private 4x4 Safari Land Cruiser transport within the reserve",
      "Experienced English-speaking driver-guide",
      "Applicable government taxes, levies and entry fees",
      "Eco-friendly stainless steel safari water bottle",
      "Personalized private service"
    ]'::jsonb,
    '[
      "International flights",
      "Visa fees",
      "Travel insurance beyond the stated emergency and rescue cover",
      "Hot air balloon safari",
      "Champagne bush breakfast where tied to the optional balloon safari",
      "Maasai village visit",
      "Alcoholic drinks, soft drinks and other beverages",
      "Personal expenses",
      "Tips and gratuities",
      "Activities not specifically mentioned under \"What Is Included\""
    ]'::jsonb,
    $itinerary$[
      {
        "day": 1,
        "title": "Nairobi to Masai Mara National Reserve",
        "description": "<p><strong>Activity:</strong> Nairobi transfer, scheduled flight, airstrip pick-up, lunch and afternoon game drive</p><p>Your safari begins with a transfer from your Nairobi hotel, residence or Jomo Kenyatta International Airport to Wilson Airport. Board a scheduled flight to the Masai Mara, lasting approximately 40 to 45 minutes, with aerial views of Kenya’s changing landscapes along the way.</p><p>Upon arrival at the Masai Mara airstrip, your driver-guide will meet you and transfer you to your selected camp or lodge in time for lunch. After check-in and time to settle in, depart for your first afternoon game drive, with opportunities to see the Big Five and other wildlife across the reserve.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected midrange or luxury camp/lodge, to be confirmed based on package selection"],
        "mealPlan": "Lunch & Dinner"
      },
      {
        "day": 2,
        "title": "Full-Day Masai Mara Safari",
        "description": "<p><strong>Activity:</strong> Morning and afternoon game drives, wildlife viewing and optional experiences</p><p>Spend the day exploring the Masai Mara on morning and afternoon game drives. Your guide will help you search for wildlife mentioned in the itinerary, including lions, elephants, leopards, buffaloes, rhinos, giraffes, zebras, wildebeests, gazelles and hippos.</p><p>An early morning hot air balloon safari followed by a champagne bush breakfast may be arranged at an additional cost. Guests may also choose an optional visit to a traditional Maasai village to learn about local culture and traditions. Return to the camp or lodge in the evening.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected midrange or luxury camp/lodge, to be confirmed based on package selection"],
        "mealPlan": "Breakfast, Lunch & Dinner"
      },
      {
        "day": 3,
        "title": "Masai Mara to Nairobi",
        "description": "<p><strong>Activity:</strong> Breakfast, airstrip transfer, scheduled flight and Nairobi drop-off</p><p>Enjoy breakfast at your camp or lodge before checking out. You will then be transferred to the Masai Mara airstrip, with another opportunity to spot wildlife during the drive through the reserve.</p><p>Board your scheduled return flight to Wilson Airport in Nairobi. On arrival, a Benroso Safaris representative will meet you and transfer you to your hotel, residence or Jomo Kenyatta International Airport for your onward journey.</p>",
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
    '3-days-masai-mara-fly-in-safari-from-nairobi',
    '3 Days Masai Mara Fly-In Safari from Nairobi',
    'Experience the Masai Mara on a 3-day fly-in safari from Nairobi with Benroso Safaris. Enjoy scenic flights, private 4x4 game drives, Big Five viewing opportunities and more time exploring Kenya’s leading wildlife reserve.',
    jsonb_build_object(
      'html',
      $overview$<p>The 3 Days Masai Mara Fly-In Safari from Nairobi is designed for travelers who want to spend more time viewing wildlife and less time on long road transfers. The journey begins with a transfer to Wilson Airport, followed by a scheduled 40 to 45-minute flight into the Masai Mara National Reserve.</p><p>After landing, guests are met by a driver-guide and transferred to a selected midrange or luxury camp or lodge. The safari includes an afternoon game drive on the first day, followed by morning and afternoon wildlife drives on the second day. The itinerary offers opportunities to search for the Big Five, as well as giraffes, zebras, wildebeests, gazelles and hippos.</p><p>Guests may enhance the experience with an optional sunrise hot air balloon safari or a visit to a traditional Maasai village, both available at an additional cost. The final day includes breakfast, a wildlife-viewing transfer to the airstrip and a return flight to Nairobi.</p><p>Benroso Safaris recommends this package for couples, families, business travelers and guests with limited time in Kenya. It provides a convenient and well-paced introduction to one of Africa’s best-known safari destinations.</p><h2>Experiences Associated With This Trip</h2><ul><li><p>Masai Mara fly-in safari</p></li><li><p>Scenic scheduled flights</p></li><li><p>Private 4x4 game drives</p></li><li><p>Big Five viewing</p></li><li><p>Predator tracking</p></li><li><p>Plains wildlife viewing</p></li><li><p>Bird watching</p></li><li><p>Optional hot air balloon safari</p></li><li><p>Optional Maasai village visit</p></li><li><p>Scenic airstrip transfers</p></li></ul><h2>This Is Suitable For</h2><ul><li><p>Travelers with limited time in Kenya</p></li><li><p>Couples and honeymooners</p></li><li><p>Families and small private groups</p></li><li><p>Business travelers adding a short safari</p></li><li><p>First-time safari guests</p></li><li><p>Wildlife and nature photographers</p></li></ul>$overview$
    ),
    '[
      {"question":"How long is the flight from Nairobi to Masai Mara?","answer":"The scheduled flight takes approximately 40 to 45 minutes each way."},
      {"question":"Are return flights included?","answer":"Yes. Scheduled return flights between Nairobi and the Masai Mara are included in the package."},
      {"question":"Are game drives included?","answer":"Yes. The itinerary includes an afternoon game drive on Day 1 and morning and afternoon game drives on Day 2."},
      {"question":"What accommodation categories are available?","answer":"Guests may select either a midrange or luxury camp or lodge, subject to availability."},
      {"question":"Is the hot air balloon safari included?","answer":"No. The balloon safari and champagne bush breakfast are optional and available at an additional cost."},
      {"question":"Where does the safari start and end?","answer":"The package starts and ends in Nairobi, with transfers available from a hotel, residence or Jomo Kenyatta International Airport."}
    ]'::jsonb,
    '3 Days Masai Mara Fly-In Safari from Nairobi',
    '3-day Masai Mara fly-in safari with Benroso Safaris, including return Nairobi flights, private 4x4 game drives and Big Five viewing.',
    '3 Days Masai Mara Fly-In Safari from Nairobi',
    '["Masai Mara flight safari","Nairobi to Masai Mara flight","short Kenya fly-in safari","Masai Mara 3-day safari","Benroso Safaris"]'::jsonb,
    null,
    v_now
  );

  if v_exp_fly_in is not null then
    insert into public.tour_experiences (tour_id, experience_id, position)
    values (v_tour_id, v_exp_fly_in, 0);
  end if;

  if v_exp_big5 is not null then
    insert into public.tour_experiences (tour_id, experience_id, position)
    values (v_tour_id, v_exp_big5, 1);
  end if;

  if v_park_mara is not null then
    insert into public.tour_national_parks (tour_id, park_id, position)
    values (v_tour_id, v_park_mara, 0);
  end if;

  if v_dest_mara is not null then
    insert into public.tour_destinations (tour_id, destination_id, position)
    values (v_tour_id, v_dest_mara, 0);
  end if;
end $$;
