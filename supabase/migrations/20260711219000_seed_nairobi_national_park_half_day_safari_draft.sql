-- Seed draft: Nairobi National Park Half-Day Safari (no pricing; ready for images + publish).

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
    where locale = 'en' and slug = 'nairobi-national-park-half-day-safari'
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
      {"from":"Nairobi National Park","to":"Nairobi Hotel or Next Destination"}
    ]'::jsonb,
    $notice$Wildlife sightings occur naturally and cannot be guaranteed. Park entry fees should be confirmed before publishing the final package. The exact duration depends on traffic, pick-up location and park conditions. Morning departures may provide better wildlife-viewing conditions. Photography opportunities depend on weather and visibility. Guests proceeding to another destination should confirm their preferred drop-off point in advance.$notice$,
    '[
      "Pick-up from your Nairobi hotel or residence",
      "Transfer to Nairobi National Park",
      "Guided game drive in Nairobi National Park",
      "Scenic photography stops",
      "Return transfer to your hotel or onward destination"
    ]'::jsonb,
    '[
      "International and domestic flights",
      "Visa fees",
      "Travel insurance",
      "Nairobi National Park entry fees unless included in the final package",
      "Meals and drinks",
      "Personal expenses",
      "Tips and gratuities",
      "Optional activities not listed in the itinerary",
      "Any item not specifically mentioned under \"What Is Included\""
    ]'::jsonb,
    $itinerary$[
      {
        "day": 1,
        "title": "Nairobi National Park Game Drive",
        "description": "<p><strong>Activity:</strong> Hotel pick-up, park transfer, guided game drive, photography stops and return transfer</p><p>Your short safari begins with pick-up from your Nairobi hotel or residence, followed by a drive to Nairobi National Park.</p><p>Enjoy a guided game drive through the park in search of wildlife mentioned in the itinerary, including lions, black rhinos, giraffes, buffaloes, zebras, ostriches and a variety of bird species. The park offers a unique setting where open savannah meets the Nairobi skyline.</p><p>During the game drive, stop at selected viewpoints for photography before exiting the park. You will then return to your hotel or continue to your next destination.</p>",
        "imageId": "",
        "accommodationOptions": [],
        "mealPlan": "No meals included"
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
    'nairobi-national-park-half-day-safari',
    'Nairobi National Park Half-Day Safari',
    'Experience a half-day Nairobi National Park safari with Benroso Safaris. Search for lions, black rhinos, giraffes, buffaloes, zebras and birdlife while enjoying scenic views of Nairobi’s skyline.',
    jsonb_build_object(
      'html',
      $overview$<p>The Nairobi National Park Half-Day Safari is designed for travelers who want a genuine wildlife experience without leaving Kenya’s capital for a full day. The tour begins with pick-up from your Nairobi hotel or residence, followed by a short transfer to the park.</p><p>Once inside, enjoy a guided game drive across open plains, woodland and seasonal wetland areas. The itinerary highlights opportunities to search for lions, black rhinos, giraffes, buffaloes, zebras, ostriches and numerous bird species.</p><p>One of the park’s most distinctive features is the contrast between wildlife and Nairobi’s city skyline. Scenic stops provide time for photography while your guide helps identify animals and explain the surrounding landscape.</p><p>Benroso Safaris recommends this short safari for business travelers, guests with limited time, families, couples and visitors on a Nairobi stopover. It works well as a morning or afternoon activity and can also be combined with another Nairobi attraction, depending on timing.</p><h2>Experiences Associated With This Trip</h2><ul><li><p>Nairobi National Park game drive</p></li><li><p>Black rhino viewing opportunities</p></li><li><p>Lion tracking</p></li><li><p>Giraffe and zebra sightings</p></li><li><p>Bird watching</p></li><li><p>Ostrich sightings</p></li><li><p>Nairobi skyline photography</p></li><li><p>Short city safari</p></li></ul><h2>This Is Suitable For</h2><ul><li><p>Travelers with limited time in Nairobi</p></li><li><p>Business travelers</p></li><li><p>Couples and small groups</p></li><li><p>Families with children</p></li><li><p>Guests on a long airport stopover</p></li><li><p>Wildlife and photography enthusiasts</p></li></ul>$overview$
    ),
    '[
      {"question":"How long is the safari?","answer":"This is a half-day experience. The exact duration depends on traffic, park conditions and your pick-up location."},
      {"question":"What wildlife may be seen?","answer":"The itinerary highlights lions, black rhinos, giraffes, buffaloes, zebras, ostriches and several bird species."},
      {"question":"Are park entry fees included?","answer":"The source document does not confirm this, so entry fees should be verified before booking."},
      {"question":"Is this safari suitable for children?","answer":"Yes. It is suitable for families, subject to vehicle capacity and the park’s child entry requirements."},
      {"question":"Can the safari start in the afternoon?","answer":"The tour may be arranged in the morning or afternoon, depending on park hours and availability."},
      {"question":"Where will guests be dropped off?","answer":"Guests may be returned to their Nairobi hotel or taken to their next destination within the agreed transfer area."}
    ]'::jsonb,
    'Nairobi National Park Half-Day Safari',
    'Nairobi National Park half-day safari with Benroso Safaris, featuring lions, black rhinos, giraffes, zebras and skyline views.',
    'Nairobi National Park Half-Day Safari',
    '["Nairobi half-day safari","Nairobi National Park tour","short safari from Nairobi","black rhino safari Nairobi","Benroso Safaris"]'::jsonb,
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
