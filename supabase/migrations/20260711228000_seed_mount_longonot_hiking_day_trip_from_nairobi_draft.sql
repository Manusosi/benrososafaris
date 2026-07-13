-- Seed draft: Mount Longonot Hiking Day Trip from Nairobi (no pricing; ready for images + publish).

do $$
declare
  v_tour_id uuid := gen_random_uuid();
  v_exp_excursions uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.tour_translations
    where locale = 'en' and slug = 'mount-longonot-hiking-day-trip-from-nairobi'
  ) then
    return;
  end if;

  select e.id
  into v_exp_excursions
  from public.experiences e
  join public.experience_translations et on et.experience_id = e.id
  where et.locale = 'en' and et.slug = 'excursions'
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
      {"from":"Nairobi","to":"Mount Longonot National Park"},
      {"from":"Mount Longonot National Park","to":"Lunch Stop"},
      {"from":"Lunch Stop","to":"Nairobi"}
    ]'::jsonb,
    $notice$The hike requires a reasonable level of physical fitness. Comfortable hiking shoes, water and sun protection are recommended. The trail can be steep, dusty or slippery depending on weather conditions. Park entry and guide fees should be confirmed before publishing the final price. The crater-rim circuit is not specifically included in the source itinerary. The trip may be affected by heavy rain, poor visibility or park restrictions. Guests with medical concerns should assess their suitability before booking.$notice$,
    '[
      "Departure from Nairobi",
      "Return road transport between Nairobi and Mount Longonot National Park",
      "Mount Longonot crater-rim hike",
      "Time for panoramic viewing and photography",
      "Lunch",
      "Return transfer to Nairobi"
    ]'::jsonb,
    '[
      "International and domestic flights",
      "Visa fees",
      "Travel insurance",
      "Mount Longonot National Park entry fees unless included in the final package",
      "Hiking guide fees unless included",
      "Walking poles or personal hiking equipment",
      "Drinks and personal expenses",
      "Tips and gratuities",
      "Any item not specifically mentioned under \"What Is Included\""
    ]'::jsonb,
    $itinerary$[
      {
        "day": 1,
        "title": "Mount Longonot Hiking Adventure",
        "description": "<p><strong>Activity:</strong> Nairobi departure, road transfer, crater-rim hike, photography, lunch and return journey</p><p>Your day begins with departure from Nairobi for Mount Longonot National Park. Travel through the Great Rift Valley before arriving at the base of the mountain.</p><p>Begin the hike toward the crater rim, following the established trail through the park. On reaching the rim, take time to enjoy panoramic views across the crater and surrounding Rift Valley landscapes.</p><p>The excursion allows time for photography before the descent. After completing the hike, enjoy lunch and then begin the return journey to Nairobi.</p>",
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
    'mount-longonot-hiking-day-trip-from-nairobi',
    'Mount Longonot Hiking Day Trip from Nairobi',
    'Hike Mount Longonot on a full-day adventure from Nairobi with Benroso Safaris. Climb to the crater rim, enjoy sweeping Rift Valley views, stop for photography and have lunch before returning to the city.',
    jsonb_build_object(
      'html',
      $overview$<p>The Mount Longonot Hiking Day Trip from Nairobi is an active Great Rift Valley excursion designed for travelers who enjoy walking, scenery and outdoor challenges. The journey begins with a road transfer from Nairobi to Mount Longonot National Park.</p><p>The main experience is a hike from the park entrance to the crater rim. The trail climbs steadily and rewards hikers with broad views of the volcanic crater and surrounding Rift Valley landscapes. Time is provided at the rim for rest, sightseeing and photography before beginning the descent.</p><p>After completing the hike, guests stop for lunch before traveling back to Nairobi. The route is straightforward, but the climb requires a reasonable level of fitness and preparation.</p><p>Benroso Safaris recommends this day trip for active couples, small groups, solo travelers and nature photographers. It is especially suitable for guests who want a physically engaging excursion within easy reach of Nairobi.</p><h2>Experiences Associated With This Trip</h2><ul><li><p>Mount Longonot hike</p></li><li><p>Crater-rim climb</p></li><li><p>Great Rift Valley views</p></li><li><p>Volcanic landscape exploration</p></li><li><p>Panoramic photography</p></li><li><p>Outdoor fitness adventure</p></li><li><p>Scenic road travel</p></li><li><p>Nairobi day trip</p></li></ul><h2>This Is Suitable For</h2><ul><li><p>Active travelers</p></li><li><p>Couples and small groups</p></li><li><p>Solo hikers</p></li><li><p>Nature and landscape photographers</p></li><li><p>Adventure enthusiasts</p></li><li><p>Guests with a full free day in Nairobi</p></li></ul>$overview$
    ),
    '[
      {"question":"How difficult is the Mount Longonot hike?","answer":"The climb to the crater rim is moderately demanding and requires a reasonable level of fitness."},
      {"question":"Does the itinerary include walking around the crater rim?","answer":"The source document confirms a hike to the crater rim but does not specifically include the full rim circuit."},
      {"question":"What should guests bring?","answer":"Comfortable hiking shoes, drinking water, sun protection and suitable outdoor clothing are recommended."},
      {"question":"Is lunch included?","answer":"Yes. Lunch is listed in the itinerary."},
      {"question":"Is the trip suitable for children?","answer":"It may suit active older children, depending on their fitness and hiking experience."},
      {"question":"Where does the trip start and end?","answer":"The day trip starts and ends in Nairobi."}
    ]'::jsonb,
    'Mount Longonot Hiking Day Trip from Nairobi',
    'Mount Longonot hiking day trip with Benroso Safaris, featuring a crater-rim climb, panoramic Rift Valley views, photography and lunch.',
    'Mount Longonot Hiking Day Trip from Nairobi',
    '["Mount Longonot hike","Nairobi hiking day trip","Longonot crater rim tour","Rift Valley hiking Kenya","Benroso Safaris"]'::jsonb,
    null,
    v_now
  );

  if v_exp_excursions is not null then
    insert into public.tour_experiences (tour_id, experience_id, position)
    values (v_tour_id, v_exp_excursions, 0);
  end if;
end $$;
