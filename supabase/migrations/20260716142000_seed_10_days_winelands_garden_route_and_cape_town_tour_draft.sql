-- Seed draft: 10 Days Winelands, Garden Route and Cape Town Tour (South Africa; no pricing; ready for images + publish).

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
    where locale = 'en' and slug = '10-days-winelands-garden-route-and-cape-town-tour'
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
    10,
    9,
    array['south-africa']::text[],
    'Cape Town',
    'Cape Town',
    '[
      {"from":"Cape Town","to":"Paarl"},
      {"from":"Paarl","to":"Stellenbosch"},
      {"from":"Stellenbosch","to":"Franschhoek"},
      {"from":"Franschhoek","to":"Garden Route Game Reserve"},
      {"from":"Garden Route Game Reserve","to":"Mossel Bay"},
      {"from":"Mossel Bay","to":"Oudtshoorn"},
      {"from":"Oudtshoorn","to":"Cape Agulhas"},
      {"from":"Cape Agulhas","to":"Cape Town"},
      {"from":"Cape Town","to":"Robben Island"},
      {"from":"Robben Island","to":"Table Mountain"},
      {"from":"Table Mountain","to":"V&A Waterfront"},
      {"from":"V&A Waterfront","to":"Cape Peninsula"},
      {"from":"Cape Peninsula","to":"Cape Town"}
    ]'::jsonb,
    $notice$The itinerary is private and may be customised. Tours are conducted in English, with other languages available on request. Wine tasting participants must meet South Africa's legal drinking-age requirements. Wildlife sightings during the safari drives are natural and cannot be guaranteed. The source mentions crawling and narrow passages at Cango Caves, but the exact cave route should be confirmed before booking. Elephant activities should follow the operating facility's welfare and safety guidelines. Robben Island ferries may be affected by sea and weather conditions. Table Mountain cableway operations depend on wind, visibility and maintenance schedules. Optional Waterfront, Seal Island and additional Winelands activities cost extra. The exact sequence may change due to weather, availability and travel conditions. Source rates should be reconfirmed before publication or quotation.$notice$,
    '[
      "Private transportation",
      "Registered and qualified driver",
      "Two nights'' accommodation in a 4-star Winelands hotel",
      "Three nights'' accommodation along the Garden Route",
      "Four nights'' accommodation in a 4-star Cape Town hotel",
      "Nine breakfasts",
      "One wine tasting in Paarl",
      "One wine tasting in Stellenbosch",
      "Franschhoek Wine Tram experience",
      "Sunset safari drive",
      "Sunrise safari drive",
      "Entrance to the Cango Caves",
      "Entrance to the ostrich farm",
      "Elephant walk and interaction",
      "Return Table Mountain cableway ride",
      "Return ferry ride to Robben Island",
      "Entrance to Cape Point Nature Reserve",
      "Entrance to Boulders Beach Penguin Colony",
      "Fourteen-dish African culinary experience"
    ]'::jsonb,
    '[
      "International and domestic flights",
      "Optional activities",
      "Meals and drinks not specifically mentioned",
      "Personal expenses",
      "Tips and gratuities",
      "Telephone charges and souvenirs",
      "Travel insurance",
      "Optional activities at the V&A Waterfront",
      "Optional Seal Island excursion",
      "Additional wine purchases and tastings not listed",
      "Any item not specifically listed under \"What Is Included\""
    ]'::jsonb,
    $itinerary$[
      {
        "day": 1,
        "title": "Cape Town to the Cape Winelands",
        "description": "<p><strong>Activity:</strong> Private transfer, Paarl and Stellenbosch wine tastings, scenic touring and heritage stops</p><p>Begin the journey in Cape Town and travel into the Cape Winelands. Explore Paarl and Stellenbosch, enjoying one wine tasting in each region while taking in vineyard scenery and historic Cape Dutch architecture.</p><p>The route may also include a brief stop near Drakenstein Prison, where Nelson Mandela spent the final period of his imprisonment before his release.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected 4-star Winelands hotel"],
        "mealPlan": "Breakfast"
      },
      {
        "day": 2,
        "title": "Franschhoek Wine Tram Experience",
        "description": "<p><strong>Activity:</strong> Wine tram journey, vineyard visits and leisure time in Franschhoek</p><p>Spend the day exploring Franschhoek using the Wine Tram. The experience allows guests to visit a selection of wine estates and decide how long to spend at each stop.</p><p>Enjoy vineyard scenery, mountain views and time to explore the restaurants, shops and estates of the Franschhoek Valley.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected 4-star Winelands hotel"],
        "mealPlan": "Breakfast"
      },
      {
        "day": 3,
        "title": "Winelands to the Garden Route",
        "description": "<p><strong>Activity:</strong> Scenic transfer, lodge check-in, sunset 4x4 safari and buffet dinner</p><p>Leave the Cape Winelands and travel toward the Garden Route. After arriving at the selected game reserve, prepare for an evening safari in an open 4x4 vehicle.</p><p>The sunset drive lasts approximately two to three hours and may offer sightings of lion, elephant, rhino, buffalo, cheetah and other wildlife. End the day with a buffet dinner at the reserve.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected 4-star Garden Route game lodge"],
        "mealPlan": "Breakfast & Dinner"
      },
      {
        "day": 4,
        "title": "Sunrise Safari and Mossel Bay",
        "description": "<p><strong>Activity:</strong> Sunrise game drive, coastal transfer, sightseeing and leisure time</p><p>Begin the day with a sunrise safari as the reserve becomes active in the cooler morning hours.</p><p>Later, continue to Mossel Bay, where time may be spent exploring the coastline, historic landmarks, museums and local restaurants. The exact sightseeing route can be adjusted according to timing and guest interests.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected 4-star Garden Route hotel/lodge"],
        "mealPlan": "Breakfast"
      },
      {
        "day": 5,
        "title": "Oudtshoorn, Cango Caves and Ostrich Farm",
        "description": "<p><strong>Activity:</strong> Cave tour, ostrich farm visit and Oudtshoorn exploration</p><p>Travel to Oudtshoorn for a guided visit to the Cango Caves. Explore the underground chambers and limestone formations, following the selected cave route.</p><p>Continue to an ostrich farm to learn about the birds, their behaviour and their importance to the region. The experience includes opportunities to observe and interact with ostriches under staff supervision.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected 4-star Garden Route hotel/lodge"],
        "mealPlan": "Breakfast"
      },
      {
        "day": 6,
        "title": "Elephant Experience and Cape Agulhas",
        "description": "<p><strong>Activity:</strong> Elephant walk and interaction, scenic transfer, Cape Agulhas and lighthouse visit</p><p>Begin with an elephant experience at a nearby game lodge. The itinerary includes a short 4x4 transfer, an informative session, walking with elephants, feeding and supervised interaction.</p><p>Continue to Cape Agulhas, the southernmost point of Africa. Visit the coastline and historic lighthouse, with time to appreciate the meeting point associated with the Atlantic and Indian Oceans before travelling onward to Cape Town.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected 4-star Cape Town hotel"],
        "mealPlan": "Breakfast"
      },
      {
        "day": 7,
        "title": "Cape Town at Leisure",
        "description": "<p><strong>Activity:</strong> Free time, markets, shopping and personal exploration</p><p>Enjoy a day at leisure in Cape Town with no scheduled activities.</p><p>Guests may relax at the hotel, visit local markets, shop for souvenirs or explore nearby neighbourhoods independently.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected 4-star Cape Town hotel"],
        "mealPlan": "Breakfast"
      },
      {
        "day": 8,
        "title": "Robben Island and Table Mountain",
        "description": "<p><strong>Activity:</strong> Return ferry, guided prison tour, cableway ride and summit exploration</p><p>Depart from the V&amp;A Waterfront by ferry for Robben Island. A specialist guide will lead the tour through key historical sites, concluding at the Maximum Security Prison and Nelson Mandela's former cell.</p><p>After returning to Cape Town, take the cableway to the top of Table Mountain. Enjoy panoramic city and ocean views, with time to explore the summit before returning to the hotel.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected 4-star Cape Town hotel"],
        "mealPlan": "Breakfast"
      },
      {
        "day": 9,
        "title": "V&amp;A Waterfront and African Culinary Experience",
        "description": "<p><strong>Activity:</strong> Waterfront exploration, Silo District, African dinner, drumming and cultural activities</p><p>Spend time exploring the V&amp;A Waterfront and the nearby Silo District, known for shopping, dining, museums, galleries and waterfront views. Optional attractions such as a boat ride or Two Oceans Aquarium visit may be arranged separately.</p><p>In the evening, enjoy a 14-dish African culinary experience featuring dishes from different parts of the continent. The experience also includes a djembe drumming session and traditional face painting.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected 4-star Cape Town hotel"],
        "mealPlan": "Breakfast & Dinner"
      },
      {
        "day": 10,
        "title": "Cape Peninsula, Cape Point and Boulders Beach",
        "description": "<p><strong>Activity:</strong> Private coastal drive, Cape Point, Cape of Good Hope and penguin colony</p><p>Conclude the journey with a full-day Cape Peninsula tour. Travel along the Atlantic Seaboard past Clifton, Camps Bay, the Twelve Apostles, Hout Bay and Chapman's Peak Drive.</p><p>Visit Cape Point and the Cape of Good Hope Nature Reserve before continuing to Boulders Beach to see the African penguin colony. The return route may pass through Simon's Town, Kalk Bay and Muizenberg.</p><p>The tour ends in Cape Town.</p>",
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
    '10-days-winelands-garden-route-and-cape-town-tour',
    '10 Days Winelands, Garden Route and Cape Town Tour',
    'Explore South Africa on a 10-day private tour with Benroso Safaris. Enjoy Cape Winelands tastings, Garden Route safaris, Cango Caves, Cape Agulhas, Robben Island, Table Mountain and the Cape Peninsula.',
    jsonb_build_object(
      'html',
      $overview$<p>The 10 Days Winelands, Garden Route and Cape Town Tour offers a broad introduction to South Africa's Western Cape. The journey begins in the Cape Winelands with tastings in Paarl and Stellenbosch, followed by a flexible Franschhoek Wine Tram experience.</p><p>The route then continues along the Garden Route for sunset and sunrise safaris, coastal time in Mossel Bay and visits to Oudtshoorn's Cango Caves and an ostrich farm. An elephant interaction and visit to Cape Agulhas complete the Garden Route section before the journey returns to Cape Town.</p><p>The final four days combine leisure with some of the city's strongest cultural and scenic experiences. Guests visit Robben Island, take the Table Mountain cableway, explore the V&amp;A Waterfront and enjoy a 14-dish African dinner with drumming. The tour concludes with Cape Point, the Cape of Good Hope and the penguins at Boulders Beach.</p><p>Benroso Safaris recommends this private itinerary for couples, families, small groups and first-time South Africa visitors who want wine, wildlife, coast, culture and history in one well-paced journey.</p><h2>Experiences Associated With This Trip</h2><ul><li><p>Paarl and Stellenbosch wine tastings</p></li><li><p>Franschhoek Wine Tram</p></li><li><p>Garden Route sunset safari</p></li><li><p>Garden Route sunrise safari</p></li><li><p>Mossel Bay sightseeing</p></li><li><p>Cango Caves tour</p></li><li><p>Ostrich farm visit</p></li><li><p>Elephant walk and interaction</p></li><li><p>Cape Agulhas</p></li><li><p>Robben Island tour</p></li><li><p>Table Mountain cableway</p></li><li><p>V&amp;A Waterfront</p></li><li><p>African culinary experience</p></li><li><p>Djembe drumming</p></li><li><p>Cape Peninsula tour</p></li><li><p>Boulders Beach penguins</p></li></ul><h2>This Is Suitable For</h2><ul><li><p>First-time visitors to South Africa</p></li><li><p>Couples and honeymooners</p></li><li><p>Families and small private groups</p></li><li><p>Wine, food and culture enthusiasts</p></li><li><p>Wildlife and nature lovers</p></li><li><p>Travelers seeking a longer Western Cape itinerary</p></li></ul>$overview$
    ),
    '[
      {"question":"Which regions are included?","answer":"The tour covers the Cape Winelands, Garden Route, Oudtshoorn, Cape Agulhas and Cape Town."},
      {"question":"How many safari drives are included?","answer":"The package includes one sunset safari and one sunrise safari along the Garden Route."},
      {"question":"Is the Franschhoek Wine Tram included?","answer":"Yes. The Wine Tram experience is included in the package."},
      {"question":"Are Robben Island and Table Mountain included?","answer":"Yes. The package includes the return Robben Island ferry and the return Table Mountain cableway ride."},
      {"question":"Is the African culinary experience included?","answer":"Yes. Day 9 includes a 14-dish African dinner, drumming and a traditional cultural experience."},
      {"question":"Can the itinerary be customised?","answer":"Yes. The source confirms that the private itinerary can be tailored for couples, families, friends or private groups."}
    ]'::jsonb,
    '10 Days Winelands, Garden Route and Cape Town Tour',
    '10-day Winelands, Garden Route and Cape Town tour with Benroso Safaris, featuring safaris, Cango Caves, Robben Island and Cape Point.',
    '10 Days Winelands, Garden Route and Cape Town Tour',
    '["Garden Route South Africa tour","Cape Winelands package","Cape Town 10-day itinerary","Western Cape private tour","Benroso Safaris"]'::jsonb,
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
