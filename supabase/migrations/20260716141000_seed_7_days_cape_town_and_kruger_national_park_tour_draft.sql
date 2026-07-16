-- Seed draft: 7 Days Cape Town and Kruger National Park Tour (South Africa; no pricing; ready for images + publish).

do $$
declare
  v_tour_id uuid := gen_random_uuid();
  v_exp_big5 uuid;
  v_exp_tailor uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.tour_translations
    where locale = 'en' and slug = '7-days-cape-town-and-kruger-national-park-tour'
  ) then
    return;
  end if;

  select e.id
  into v_exp_big5
  from public.experiences e
  join public.experience_translations et on et.experience_id = e.id
  where et.locale = 'en' and et.slug = 'big-5-safaris'
  limit 1;

  select e.id
  into v_exp_tailor
  from public.experiences e
  join public.experience_translations et on et.experience_id = e.id
  where et.locale = 'en' and et.slug = 'tailor-made-safaris'
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
    7,
    6,
    array['south-africa']::text[],
    'Cape Town',
    'Johannesburg',
    '[
      {"from":"Cape Town","to":"Cape Peninsula"},
      {"from":"Cape Peninsula","to":"Cape Winelands"},
      {"from":"Cape Winelands","to":"Robben Island"},
      {"from":"Robben Island","to":"Table Mountain"},
      {"from":"Table Mountain","to":"Kruger National Park"},
      {"from":"Kruger National Park","to":"Panorama Route"},
      {"from":"Panorama Route","to":"Johannesburg"}
    ]'::jsonb,
    $notice$The itinerary is private and may be customised. Tours are conducted in English, with other languages available on request. The domestic flight between Cape Town and the Kruger region is not included. The source does not identify the exact airports used on Day 4, so these must be confirmed before booking. Wildlife sightings are natural and cannot be guaranteed. Table Mountain cableway operations depend on wind and weather conditions. Robben Island ferries may be delayed or cancelled due to sea conditions. Wine tasting participants must meet South Africa's legal drinking-age requirements. The exact order and timing of activities may change because of weather, flight schedules or local operating conditions. Optional Johannesburg activities are not included. Source pricing should be reconfirmed before publication or quotation.$notice$,
    '[
      "Private transportation",
      "Registered and qualified driver",
      "Three nights'' accommodation in a 4-star Cape Town hotel",
      "Two nights'' accommodation at a 4-star lodge near Kruger National Park",
      "One night''s 4-star accommodation along the Panorama Route",
      "Six breakfasts",
      "Entrance to Cape Point Nature Reserve",
      "Entrance to Boulders Beach Penguin Colony",
      "One wine and pairing experience in Paarl",
      "One wine tasting in Franschhoek",
      "One wine tasting in Stellenbosch",
      "Return Table Mountain cableway ride",
      "Return ferry ride to Robben Island",
      "Sunset safari drive in Kruger",
      "Sunrise safari drive in Kruger",
      "Entrance to the Blyde River Canyon viewpoint",
      "Entrance to Bourke''s Luck Potholes"
    ]'::jsonb,
    '[
      "International flights",
      "Domestic flight from Cape Town to the Kruger region",
      "Optional activities",
      "Meals and drinks not specifically mentioned",
      "Personal expenses",
      "Tips and gratuities",
      "Telephone charges and souvenirs",
      "Travel insurance",
      "Optional Seal Island excursion",
      "Optional Johannesburg sightseeing",
      "Any item not specifically listed under \"What Is Included\""
    ]'::jsonb,
    $itinerary$[
      {
        "day": 1,
        "title": "Cape Peninsula, Cape Point and Boulders Beach",
        "description": "<p><strong>Activity:</strong> Private coastal drive, Cape Point, Cape of Good Hope, penguin colony and scenic stops</p><p>Begin with a private journey around the Cape Peninsula. Travel along the Atlantic Seaboard past Clifton, Camps Bay and the Twelve Apostles before continuing through Hout Bay and Chapman's Peak Drive.</p><p>Visit Cape Point and the Cape of Good Hope Nature Reserve, then continue to Boulders Beach to see the African penguin colony. The return route may pass through Simon's Town, Kalk Bay and Muizenberg. A Seal Island excursion from Hout Bay may be arranged as an optional activity.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected 4-star Cape Town hotel"],
        "mealPlan": "Breakfast"
      },
      {
        "day": 2,
        "title": "Cape Winelands Tour",
        "description": "<p><strong>Activity:</strong> Wine tastings, Paarl, Franschhoek, Stellenbosch and heritage stops</p><p>Travel into the Cape Winelands for a private tour through Paarl, Franschhoek and Stellenbosch. Enjoy a wine and pairing experience in Paarl, followed by wine tastings in Franschhoek and Stellenbosch.</p><p>The journey also introduces the region's vineyards, historic towns and Cape Dutch architecture. A short stop near Drakenstein Prison may be included while travelling between Paarl and Franschhoek.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected 4-star Cape Town hotel"],
        "mealPlan": "Breakfast"
      },
      {
        "day": 3,
        "title": "Robben Island and Table Mountain",
        "description": "<p><strong>Activity:</strong> Return ferry, guided Robben Island tour, cableway ride and summit exploration</p><p>Depart from the V&amp;A Waterfront by ferry for Robben Island. A specialist guide will lead the historical tour, covering key sites around the island and the Maximum Security Prison where Nelson Mandela and other political prisoners were held.</p><p>After returning to Cape Town, take the cableway to the top of Table Mountain. Enjoy panoramic views of the city, Table Bay and surrounding mountain landscapes, with time to explore the summit before returning to your hotel.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected 4-star Cape Town hotel"],
        "mealPlan": "Breakfast"
      },
      {
        "day": 4,
        "title": "Cape Town to Kruger National Park",
        "description": "<p><strong>Activity:</strong> Domestic travel, airport transfer, lodge check-in and sunset safari</p><p>Travel from Cape Town to the Kruger region. The source itinerary refers to an airport arrival and road transfer into Kruger National Park, but the domestic flight is excluded and should be booked separately.</p><p>After arriving and transferring to your selected accommodation, head out for a sunset safari. Explore the park during the cooler evening hours while your guide explains the wildlife and habitats encountered along the way.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected 4-star lodge near Kruger National Park"],
        "mealPlan": "Breakfast"
      },
      {
        "day": 5,
        "title": "Kruger National Park 4x4 Safari",
        "description": "<p><strong>Activity:</strong> Sunrise safari, guided open-vehicle game drive and wildlife viewing</p><p>Begin the day with a sunrise safari in an open 4x4 vehicle. Early morning conditions provide opportunities to observe animals as they become active and move through the park.</p><p>Your experienced guide will help search for the Big Five and other wildlife while sharing information about Kruger's ecosystems, animal behaviour and conservation. The remainder of the day may be spent resting at the lodge or enjoying additional activities, depending on the final schedule.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected 4-star lodge near Kruger National Park"],
        "mealPlan": "Breakfast"
      },
      {
        "day": 6,
        "title": "Kruger to the Panorama Route",
        "description": "<p><strong>Activity:</strong> Scenic road journey, Blyde River Canyon and Bourke's Luck Potholes</p><p>Leave the Kruger region and continue along the Panorama Route, one of South Africa's best-known scenic drives.</p><p>Visit the Blyde River Canyon viewpoint and Bourke's Luck Potholes, where centuries of water erosion have shaped distinctive rock formations. The route showcases canyon scenery, waterfalls, cliffs and highland landscapes before arrival at your selected accommodation.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected 4-star hotel/lodge along the Panorama Route"],
        "mealPlan": "Breakfast"
      },
      {
        "day": 7,
        "title": "Panorama Route to Johannesburg",
        "description": "<p><strong>Activity:</strong> Road transfer, optional Johannesburg activities and tour conclusion</p><p>After breakfast, travel to Johannesburg. Depending on your onward schedule, you may relax or arrange optional city experiences.</p><p>Suggested activities mentioned in the source include the Apartheid Museum, Constitution Hill, local markets, shopping centres or the Cradle of Humankind. These are not included unless added to the final package.</p><p>The journey concludes in Johannesburg.</p>",
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
    '7-days-cape-town-and-kruger-national-park-tour',
    '7 Days Cape Town and Kruger National Park Tour',
    'Explore Cape Town, the Cape Winelands and Kruger National Park on a 7-day South Africa tour with Benroso Safaris. Enjoy penguins, Table Mountain, Robben Island, sunset and sunrise safaris, the Panorama Route and Johannesburg.',
    jsonb_build_object(
      'html',
      $overview$<p>The 7 Days Cape Town and Kruger National Park Tour combines South Africa's coastal scenery, cultural history, wine country and classic wildlife viewing. The journey begins in Cape Town with a private Cape Peninsula tour covering Chapman's Peak Drive, Cape Point, the Cape of Good Hope and the penguin colony at Boulders Beach.</p><p>The next two days feature the Cape Winelands, Robben Island and Table Mountain. Guests enjoy tastings across Paarl, Franschhoek and Stellenbosch before exploring South Africa's political history and one of Cape Town's most recognisable natural landmarks.</p><p>The itinerary then continues to Kruger National Park for two nights. A sunset safari and sunrise 4x4 game drive provide opportunities to search for the Big Five and other wildlife with an experienced guide. From Kruger, the route follows the Panorama Route to Blyde River Canyon and Bourke's Luck Potholes before ending in Johannesburg.</p><p>Benroso Safaris recommends this itinerary for couples, families, small groups and first-time visitors who want to combine Cape Town and a major South African safari within one week. The package is private and can be adjusted to suit different interests and travel schedules.</p><h2>Experiences Associated With This Trip</h2><ul><li><p>Cape Peninsula private tour</p></li><li><p>Cape Point and Cape of Good Hope</p></li><li><p>Boulders Beach penguin colony</p></li><li><p>Chapman's Peak Drive</p></li><li><p>Cape Winelands tastings</p></li><li><p>Robben Island tour</p></li><li><p>Table Mountain cableway</p></li><li><p>Kruger sunset safari</p></li><li><p>Kruger sunrise safari</p></li><li><p>Open 4x4 game drive</p></li><li><p>Big Five viewing opportunities</p></li><li><p>Blyde River Canyon</p></li><li><p>Bourke's Luck Potholes</p></li><li><p>Panorama Route drive</p></li></ul><h2>This Is Suitable For</h2><ul><li><p>First-time visitors to South Africa</p></li><li><p>Couples and honeymooners</p></li><li><p>Families and small private groups</p></li><li><p>Wildlife and safari enthusiasts</p></li><li><p>History, scenery and wine lovers</p></li><li><p>Travelers wanting Cape Town and Kruger in one itinerary</p></li></ul>$overview$
    ),
    '[
      {"question":"Which destinations are included?","answer":"The tour includes Cape Town, the Cape Peninsula, Cape Winelands, Robben Island, Table Mountain, Kruger National Park, the Panorama Route and Johannesburg."},
      {"question":"Is the flight from Cape Town to Kruger included?","answer":"No. Flights are specifically excluded from the source package and must be arranged separately."},
      {"question":"How many Kruger game drives are included?","answer":"The package includes one sunset safari and one sunrise safari in Kruger National Park."},
      {"question":"Is accommodation included?","answer":"Yes. The package includes three nights in Cape Town, two nights near Kruger and one night along the Panorama Route."},
      {"question":"Are the Winelands tastings included?","answer":"Yes. The package includes experiences in Paarl, Franschhoek and Stellenbosch."},
      {"question":"Does the tour include Johannesburg sightseeing?","answer":"No scheduled Johannesburg tour is included. Optional activities may be arranged depending on the departure schedule."}
    ]'::jsonb,
    '7 Days Cape Town and Kruger National Park Tour',
    '7-day Cape Town and Kruger tour with Benroso Safaris, featuring Cape Point, Winelands, Robben Island, Big Five safaris and Panorama Route.',
    '7 Days Cape Town and Kruger National Park Tour',
    '["Cape Town Kruger safari","South Africa 7-day tour","Kruger Big Five safari","Cape Winelands package","Benroso Safaris"]'::jsonb,
    null,
    v_now
  );

  if v_exp_big5 is not null then
    insert into public.tour_experiences (tour_id, experience_id, position)
    values (v_tour_id, v_exp_big5, 0);
  end if;

  if v_exp_tailor is not null then
    insert into public.tour_experiences (tour_id, experience_id, position)
    values (v_tour_id, v_exp_tailor, 1);
  end if;
end $$;
