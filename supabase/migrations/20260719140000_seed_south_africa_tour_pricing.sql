-- Seed South Africa year-round pricing (1 PAX / 2 - 3 PAX / 4 PAX & ABOVE)
-- for the three draft Cape Town / Winelands / Kruger private tours.

do $$
declare
  v_tour record;
  v_tier_id uuid;
  v_season_id uuid;
begin
  for v_tour in
    select *
    from (
      values
        (
          '10-days-winelands-garden-route-and-cape-town-tour',
          8915::numeric,
          4620::numeric,
          3635::numeric
        ),
        (
          '7-days-best-of-cape-town-private-tour',
          5325::numeric,
          2860::numeric,
          2369::numeric
        ),
        (
          '7-days-cape-town-and-kruger-national-park-tour',
          7010::numeric,
          3810::numeric,
          3105::numeric
        )
    ) as t(slug, pax1, pax2_3, pax4_plus)
  loop
    declare
      v_tour_id uuid;
    begin
      select t.id
      into v_tour_id
      from public.tours t
      join public.tour_translations tt on tt.tour_id = t.id and tt.locale = 'en'
      where tt.slug = v_tour.slug
      limit 1;

      if v_tour_id is null then
        continue;
      end if;

      -- Replace any Kenya-style skeleton with SA year-round matrix.
      delete from public.tour_pricing_tiers where tour_id = v_tour_id;

      insert into public.tour_pricing_tiers (
        tour_id, tier, label, blurb, notes, currency, position
      ) values (
        v_tour_id,
        'mid_range',
        'Mid-Range',
        null,
        null,
        'USD',
        0
      )
      returning id into v_tier_id;

      insert into public.tour_pricing_seasons (tier_id, label, date_start, date_end, position)
      values (v_tier_id, '1st JAN - 31st DEC', '2026-01-01', '2026-12-31', 0)
      returning id into v_season_id;

      insert into public.tour_pricing_cells (season_id, group_band, band_position, price)
      values
        (v_season_id, '1 PAX', 0, v_tour.pax1),
        (v_season_id, '2 - 3 PAX', 1, v_tour.pax2_3),
        (v_season_id, '4 PAX & ABOVE', 2, v_tour.pax4_plus);

      update public.tours
      set
        pricing_table_keys = '["mid_range"]'::jsonb,
        price_from = v_tour.pax4_plus,
        updated_at = now()
      where id = v_tour_id;
    end;
  end loop;
end $$;
