-- Seed draft: Sagana Adventure Day Trip from Nairobi (no pricing; ready for images + publish).

do $$
declare
  v_tour_id uuid := gen_random_uuid();
  v_exp_excursions uuid;
  v_now timestamptz := now();
begin
  if exists (
    select 1
    from public.tour_translations
    where locale = 'en' and slug = 'sagana-adventure-day-trip-from-nairobi'
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
      {"from":"Nairobi","to":"Sagana"},
      {"from":"Sagana","to":"Nairobi"}
    ]'::jsonb,
    $notice$White-water rafting depends on river levels, weather and operator safety conditions. Guests should disclose relevant medical conditions before participating. Age, fitness and swimming requirements should be confirmed before booking. Safety equipment and instructor arrangements should be confirmed in the final package. Alternative adventure activities depend on availability. Guests should carry suitable clothing, secure footwear and a change of clothes. The exact schedule depends on Nairobi traffic and activity duration.$notice$,
    '[
      "Departure from Nairobi",
      "Return road transport between Nairobi and Sagana",
      "White-water rafting or another selected adventure activity",
      "Lunch",
      "Time to relax before departure",
      "Return transfer to Nairobi"
    ]'::jsonb,
    '[
      "International and domestic flights",
      "Visa fees",
      "Travel insurance",
      "Activity fees unless included in the final package",
      "Additional adventure activities",
      "Drinks and personal expenses",
      "Tips and gratuities",
      "Any item not specifically mentioned under \"What Is Included\""
    ]'::jsonb,
    $itinerary$[
      {
        "day": 1,
        "title": "Sagana Adventure Experience",
        "description": "<p><strong>Activity:</strong> Nairobi departure, road transfer, white-water rafting or alternative activity, lunch, relaxation and return journey</p><p>Your day begins with departure from Nairobi for Sagana, a popular destination for river-based and outdoor adventures.</p><p>On arrival, take part in white-water rafting or another available adventure activity, depending on the selected package and local conditions. The experience is designed for guests looking for an active day outside the city.</p><p>After the activity, enjoy lunch and take time to relax before beginning the return journey to Nairobi.</p>",
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
    'sagana-adventure-day-trip-from-nairobi',
    'Sagana Adventure Day Trip from Nairobi',
    'Travel to Sagana for a full-day adventure with Benroso Safaris. Enjoy white-water rafting or another outdoor activity, have lunch, relax by the river and return to Nairobi after an active day in central Kenya.',
    jsonb_build_object(
      'html',
      $overview$<p>The Sagana Adventure Day Trip from Nairobi is designed for travelers looking for an active outdoor experience within easy reach of the capital. The journey begins with a road transfer from Nairobi to Sagana, a destination known for river activities and adventure experiences.</p><p>The main activity is white-water rafting, although another adventure option may be arranged depending on the selected package, guest preference and local operating conditions. This makes the trip flexible for groups seeking either a high-energy river experience or another outdoor challenge.</p><p>After the activity, guests enjoy lunch and have time to relax before traveling back to Nairobi. The day combines adventure, scenery and a break from the city without requiring an overnight stay.</p><p>Benroso Safaris recommends this excursion for groups of friends, couples, corporate teams, active families and travelers seeking something different from a traditional wildlife safari. It is particularly suitable for guests who enjoy outdoor activities and are comfortable with a physically engaging day.</p><h2>Experiences Associated With This Trip</h2><ul><li><p>White-water rafting</p></li><li><p>Sagana river adventure</p></li><li><p>Outdoor activities</p></li><li><p>Scenic road travel</p></li><li><p>Group adventure experience</p></li><li><p>Riverside relaxation</p></li><li><p>Lunch in Sagana</p></li><li><p>Nairobi day trip</p></li></ul><h2>This Is Suitable For</h2><ul><li><p>Groups of friends</p></li><li><p>Couples and small private groups</p></li><li><p>Corporate teams</p></li><li><p>Active families with older children</p></li><li><p>Adventure enthusiasts</p></li><li><p>Travelers seeking a non-wildlife excursion</p></li></ul>$overview$
    ),
    '[
      {"question":"Is white-water rafting included?","answer":"The itinerary lists white-water rafting or another adventure activity. The exact activity and fee should be confirmed during booking."},
      {"question":"Is prior rafting experience required?","answer":"This depends on the selected route and operator. Beginner-friendly options may be available with professional guidance."},
      {"question":"Is this trip suitable for children?","answer":"It may suit older children, subject to the operator''s age, height, fitness and safety requirements."},
      {"question":"Is lunch included?","answer":"Yes. Lunch is listed in the source itinerary."},
      {"question":"What should guests bring?","answer":"Guests should bring comfortable outdoor clothing, secure footwear, sun protection and a change of clothes."},
      {"question":"Where does the trip start and end?","answer":"The day trip starts and ends in Nairobi."}
    ]'::jsonb,
    'Sagana Adventure Day Trip from Nairobi',
    'Sagana adventure day trip with Benroso Safaris, featuring white-water rafting or outdoor activities, lunch and return transport from Nairobi.',
    'Sagana Adventure Day Trip from Nairobi',
    '["Sagana rafting trip","Nairobi adventure day trip","white-water rafting Kenya","Sagana outdoor activities","Benroso Safaris"]'::jsonb,
    null,
    v_now
  );

  if v_exp_excursions is not null then
    insert into public.tour_experiences (tour_id, experience_id, position)
    values (v_tour_id, v_exp_excursions, 0);
  end if;
end $$;
