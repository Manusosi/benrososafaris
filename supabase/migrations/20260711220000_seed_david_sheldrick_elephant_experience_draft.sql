-- Seed draft: David Sheldrick Elephant Experience (no pricing; ready for images + publish).

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
    where locale = 'en' and slug = 'david-sheldrick-elephant-experience'
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
      {"from":"David Sheldrick Elephant Orphanage","to":"Optional Lunch Stop"},
      {"from":"Optional Lunch Stop","to":"Nairobi Hotel"}
    ]'::jsonb,
    $notice$The elephant orphanage operates within specific visiting hours. Advance reservations may be required. Elephant viewing depends on the centre’s daily program and operating conditions. Entry or donation fees should be confirmed before booking. Lunch is optional and not included unless added to the final package. Pick-up and drop-off arrangements should be confirmed according to the guest’s hotel location.$notice$,
    '[
      "Pick-up from your Nairobi hotel",
      "Transfer to the David Sheldrick Elephant Orphanage",
      "Visit to the elephant orphanage",
      "Conservation and rehabilitation learning experience",
      "Return transfer to your Nairobi hotel"
    ]'::jsonb,
    '[
      "International and domestic flights",
      "Visa fees",
      "Travel insurance",
      "Elephant orphanage entry or donation fees unless included in the final package",
      "Optional lunch",
      "Drinks and personal expenses",
      "Tips and gratuities",
      "Additional attractions not listed in the itinerary",
      "Any item not specifically mentioned under \"What Is Included\""
    ]'::jsonb,
    $itinerary$[
      {
        "day": 1,
        "title": "David Sheldrick Elephant Conservation Visit",
        "description": "<p><strong>Activity:</strong> Hotel pick-up, elephant orphanage visit, conservation learning, optional lunch and return transfer</p><p>Your excursion begins with pick-up from your Nairobi hotel, followed by a transfer to the David Sheldrick Elephant Orphanage.</p><p>During the visit, learn about the rescue, care and rehabilitation of orphaned elephants. The experience offers a closer look at elephant conservation and the work involved in preparing rescued animals for eventual return to the wild.</p><p>After the visit, you may choose to stop for lunch at a selected restaurant before returning to your hotel.</p>",
        "imageId": "",
        "accommodationOptions": [],
        "mealPlan": "No meals included. Lunch is optional."
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
    'david-sheldrick-elephant-experience',
    'David Sheldrick Elephant Experience',
    'Visit the David Sheldrick Elephant Orphanage with Benroso Safaris and learn how rescued elephants are cared for and rehabilitated. This short Nairobi excursion includes hotel transfers and an optional lunch after the visit.',
    jsonb_build_object(
      'html',
      $overview$<p>The David Sheldrick Elephant Experience is a short Nairobi excursion centered on elephant conservation and rehabilitation. The tour begins with pick-up from your Nairobi hotel and a transfer to the David Sheldrick Elephant Orphanage.</p><p>During the visit, guests learn how orphaned elephants are rescued, cared for and gradually prepared for life back in the wild. The experience provides useful insight into the challenges facing elephants and the long-term conservation work required to protect them.</p><p>This short safari is especially suitable for travelers who want a meaningful wildlife experience without committing to a full-day itinerary. An optional lunch may be arranged after the visit before the return transfer to your hotel.</p><p>Benroso Safaris recommends this excursion for families, couples, conservation enthusiasts, first-time visitors and travelers with a limited amount of time in Nairobi. It can also be combined with another nearby attraction, subject to operating times and availability.</p><h2>Experiences Associated With This Trip</h2><ul><li><p>Elephant orphanage visit</p></li><li><p>Elephant conservation education</p></li><li><p>Wildlife rehabilitation experience</p></li><li><p>Rescued elephant viewing</p></li><li><p>Nairobi conservation excursion</p></li><li><p>Optional restaurant lunch</p></li><li><p>Short guided city transfer</p></li></ul><h2>This Is Suitable For</h2><ul><li><p>Families with children</p></li><li><p>Couples and small groups</p></li><li><p>Conservation-minded travelers</p></li><li><p>First-time visitors to Nairobi</p></li><li><p>Guests with limited time</p></li><li><p>Wildlife and elephant enthusiasts</p></li></ul>$overview$
    ),
    '[
      {"question":"How long does the experience take?","answer":"This is a short excursion. The total duration depends on traffic, hotel location and the orphanage’s visiting schedule."},
      {"question":"Is hotel pick-up included?","answer":"Yes. The itinerary includes pick-up from and return to your Nairobi hotel."},
      {"question":"Is lunch included?","answer":"No. Lunch is optional and can be arranged separately."},
      {"question":"Can children join the tour?","answer":"Yes. The experience is suitable for families, subject to the orphanage’s visitor policies."},
      {"question":"Are entry fees included?","answer":"The source document does not confirm this, so entry or donation fees should be verified before booking."},
      {"question":"Can this tour be combined with another Nairobi attraction?","answer":"Yes. It may be combined with a nearby attraction depending on timing, availability and the final package arrangement."}
    ]'::jsonb,
    'David Sheldrick Elephant Experience',
    'Visit the David Sheldrick Elephant Orphanage with Benroso Safaris and learn about rescued elephants, conservation and rehabilitation in Nairobi.',
    'David Sheldrick Elephant Experience',
    '["Sheldrick Elephant Orphanage tour","Nairobi elephant experience","elephant conservation Nairobi","short Nairobi excursion","Benroso Safaris"]'::jsonb,
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
