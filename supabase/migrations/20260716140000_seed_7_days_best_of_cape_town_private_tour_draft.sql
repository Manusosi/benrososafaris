-- Seed draft: 7 Days Best of Cape Town Private Tour (South Africa; no pricing; ready for images + publish).

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
    where locale = 'en' and slug = '7-days-best-of-cape-town-private-tour'
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
    'Cape Town',
    '[
      {"from":"Cape Town","to":"Cape Peninsula"},
      {"from":"Cape Peninsula","to":"Cape Town City"},
      {"from":"Cape Town City","to":"Karoo Game Reserve"},
      {"from":"Karoo Game Reserve","to":"Kirstenbosch"},
      {"from":"Kirstenbosch","to":"Paarl"},
      {"from":"Paarl","to":"Franschhoek"},
      {"from":"Franschhoek","to":"Stellenbosch"},
      {"from":"Stellenbosch","to":"Robben Island"},
      {"from":"Robben Island","to":"Table Mountain"},
      {"from":"Table Mountain","to":"Cape Town"}
    ]'::jsonb,
    $notice$The itinerary is operated privately and may be customised. All listed private tours are conducted in English, with other languages available on request. Wildlife sightings during the Big Five safari are natural and cannot be guaranteed. Table Mountain cableway operations depend on weather and wind conditions. Robben Island ferry services may be affected by sea conditions. The optional Seal Island visit and activities at the game reserve cost extra. Wine tasting participants must meet applicable age requirements. The exact order of activities may change due to weather, availability or operating schedules. The source rates should be reconfirmed before publication or quotation.$notice$,
    '[
      "Private transportation",
      "Registered and qualified driver",
      "Six nights'' accommodation in a 4-star Cape Town hotel",
      "Six breakfasts",
      "Entrance to Cape Point Nature Reserve",
      "Entrance to Boulders Beach Penguin Colony",
      "Guided Cape Town city tour",
      "Full-day Big Five safari",
      "Entrance to Kirstenbosch National Botanical Garden",
      "Return Table Mountain cableway ride",
      "Return ferry to Robben Island",
      "One wine tasting in Franschhoek",
      "One wine tasting in Stellenbosch",
      "One wine and cheese pairing in Paarl"
    ]'::jsonb,
    '[
      "International and domestic flights",
      "Optional activities",
      "Meals and drinks not specifically mentioned",
      "Personal expenses",
      "Tips and gratuities",
      "Telephone charges and souvenirs",
      "Travel insurance",
      "Any item not specifically listed under \"What Is Included\""
    ]'::jsonb,
    $itinerary$[
      {
        "day": 1,
        "title": "Cape Peninsula, Cape Point and Boulders Beach",
        "description": "<p><strong>Activity:</strong> Private coastal drive, Cape Point, Cape of Good Hope, penguin colony and scenic stops</p><p>Begin with a full-day journey around the Cape Peninsula. Travel along the Atlantic Seaboard past Clifton, Camps Bay, the Twelve Apostles and Hout Bay before continuing along Chapman's Peak Drive.</p><p>Visit Cape Point and the Cape of Good Hope Nature Reserve, then continue to Boulders Beach to see the African penguin colony. The route may also pass through Simon's Town, Kalk Bay and Muizenberg before returning to Cape Town. An optional Seal Island visit may be arranged from Hout Bay.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected 4-star Cape Town hotel"],
        "mealPlan": "Breakfast"
      },
      {
        "day": 2,
        "title": "Cape Town Mother City Tour",
        "description": "<p><strong>Activity:</strong> Guided city tour, historic landmarks, Bo-Kaap, Company's Garden and Atlantic beaches</p><p>Explore Cape Town's city centre on a guided private tour covering its history, architecture and major landmarks. Highlights may include the Castle of Good Hope, the colourful Bo-Kaap district and Company's Garden.</p><p>The day also introduces the City Bowl and coastal neighbourhoods such as Clifton and Camps Bay, with views of Table Mountain and the Twelve Apostles forming part of the experience.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected 4-star Cape Town hotel"],
        "mealPlan": "Breakfast"
      },
      {
        "day": 3,
        "title": "Full-Day Big Five Safari",
        "description": "<p><strong>Activity:</strong> Game reserve transfer, breakfast, guided game drive, lunch and leisure time</p><p>Depart Cape Town early for a full-day safari at a private game reserve in the Karoo. On arrival, enjoy a welcome drink and breakfast before setting out on a guided game drive lasting approximately two to three hours.</p><p>Search for the Big Five, including lion, leopard, elephant, rhino and buffalo. After the game drive, enjoy lunch and leisure time at the reserve before returning to Cape Town in the late afternoon. Additional activities may be available at extra cost.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected 4-star Cape Town hotel"],
        "mealPlan": "Breakfast & Lunch"
      },
      {
        "day": 4,
        "title": "Kirstenbosch National Botanical Garden",
        "description": "<p><strong>Activity:</strong> Botanical garden visit, nature walk and leisure time</p><p>Visit Kirstenbosch National Botanical Garden on the eastern slopes of Table Mountain. Explore its cultivated gardens, natural forest areas, fynbos landscapes, protea collections and scenic walking routes.</p><p>The day is more relaxed, allowing time to enjoy the garden at your own pace and appreciate the natural setting.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected 4-star Cape Town hotel"],
        "mealPlan": "Breakfast"
      },
      {
        "day": 5,
        "title": "Cape Winelands Tour",
        "description": "<p><strong>Activity:</strong> Paarl, Franschhoek and Stellenbosch wine experiences</p><p>Travel into the Cape Winelands for a full-day private tour of Paarl, Franschhoek and Stellenbosch. The itinerary includes wine tasting experiences in Franschhoek and Stellenbosch, together with a wine and cheese pairing in Paarl.</p><p>The route may also include a brief stop near Drakenstein Prison and time to enjoy the architecture, vineyards and historic character of the Winelands towns.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected 4-star Cape Town hotel"],
        "mealPlan": "Breakfast"
      },
      {
        "day": 6,
        "title": "Robben Island and Table Mountain",
        "description": "<p><strong>Activity:</strong> Return ferry, Robben Island tour, cableway ride and summit exploration</p><p>Travel from the V&amp;A Waterfront by ferry to Robben Island for a guided historical tour. The route includes key sites connected to the island's political history and concludes with a visit to the Maximum Security Prison and Nelson Mandela's former cell.</p><p>Later, return to Cape Town and take the cableway to the top of Table Mountain. Enjoy panoramic views across the city, Table Bay and surrounding mountain ranges, with time to explore the summit.</p>",
        "imageId": "",
        "accommodationOptions": ["Selected 4-star Cape Town hotel"],
        "mealPlan": "Breakfast"
      },
      {
        "day": 7,
        "title": "Cape Town at Leisure",
        "description": "<p><strong>Activity:</strong> Free time, shopping, markets and personal exploration</p><p>Spend the final day at leisure with no scheduled activities. You may visit local markets, shop for souvenirs, explore nearby neighbourhoods or simply relax before departure.</p><p>The package concludes in Cape Town.</p>",
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
    '7-days-best-of-cape-town-private-tour',
    '7 Days Best of Cape Town Private Tour',
    'Discover Cape Town on a 7-day private tour with Benroso Safaris. Explore Cape Point, Boulders Beach, the Winelands, Robben Island, Table Mountain, Kirstenbosch and a full-day Big Five safari.',
    jsonb_build_object(
      'html',
      $overview$<p>The 7 Days Best of Cape Town Private Tour brings together the city's coastline, history, wildlife, gardens and Winelands in one balanced itinerary. The journey begins with a full-day Cape Peninsula tour covering Cape Point, the Cape of Good Hope, Chapman's Peak Drive and the African penguin colony at Boulders Beach.</p><p>A guided Mother City tour then introduces Cape Town's historic centre, Bo-Kaap, Company's Garden and Atlantic-facing neighbourhoods. The itinerary also includes a full-day Big Five safari in the Karoo, offering a wildlife experience within reach of Cape Town.</p><p>The second half of the tour focuses on Kirstenbosch National Botanical Garden, the Cape Winelands, Robben Island and Table Mountain. Guests enjoy wine tastings across Paarl, Franschhoek and Stellenbosch, followed by a historical visit to Robben Island and a cableway journey to Table Mountain's summit.</p><p>Benroso Safaris recommends this private South Africa tour for couples, families, small groups and first-time visitors who want a broad Cape Town experience without changing hotels. It combines structured touring with a final leisure day and can be adjusted to suit individual interests.</p><h2>Experiences Associated With This Trip</h2><ul><li><p>Cape Peninsula private tour</p></li><li><p>Cape Point and Cape of Good Hope</p></li><li><p>Boulders Beach penguin colony</p></li><li><p>Chapman's Peak Drive</p></li><li><p>Cape Town city tour</p></li><li><p>Bo-Kaap visit</p></li><li><p>Big Five safari</p></li><li><p>Kirstenbosch Botanical Garden</p></li><li><p>Cape Winelands tastings</p></li><li><p>Robben Island tour</p></li><li><p>Table Mountain cableway</p></li><li><p>Cape Town leisure day</p></li></ul><h2>This Is Suitable For</h2><ul><li><p>First-time visitors to South Africa</p></li><li><p>Couples and honeymooners</p></li><li><p>Families and small private groups</p></li><li><p>History and culture enthusiasts</p></li><li><p>Wildlife and nature lovers</p></li><li><p>Travelers seeking a private Cape Town itinerary</p></li></ul>$overview$
    ),
    '[
      {"question":"Which major attractions are included?","answer":"The tour includes Cape Point, Boulders Beach, a Cape Town city tour, a Big Five safari, Kirstenbosch, the Winelands, Robben Island and Table Mountain."},
      {"question":"Is accommodation included?","answer":"Yes. The package includes six nights in a selected 4-star Cape Town hotel."},
      {"question":"Is the Big Five safari a multi-day safari?","answer":"No. It is a full-day excursion from Cape Town to a private game reserve in the Karoo."},
      {"question":"Are the wine tastings included?","answer":"Yes. The package includes tastings in Franschhoek and Stellenbosch, plus a wine and cheese pairing in Paarl."},
      {"question":"Is Robben Island included?","answer":"Yes. The return ferry ride and guided Robben Island tour are included."},
      {"question":"Can the itinerary be customised?","answer":"Yes. The source confirms that the private itinerary can be tailored to suit the guests'' needs."}
    ]'::jsonb,
    '7 Days Best of Cape Town Private Tour',
    '7-day Cape Town private tour with Benroso Safaris, featuring Cape Point, Big Five safari, Winelands, Robben Island and Table Mountain.',
    '7 Days Best of Cape Town Private Tour',
    '["Cape Town 7-day tour","South Africa private tour","Cape Peninsula safari","Cape Winelands tour","Benroso Safaris"]'::jsonb,
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
