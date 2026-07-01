'use server';

import { revalidatePath } from 'next/cache';

import { requireSuperAdmin } from '@/lib/auth/portal';
import { createClient } from '@/lib/supabase/server';
import { normalizeHeroSlides } from '@/lib/public/hero-slides';
import { DEFAULT_HERO_OVERLAY, isPageHeroKey } from '@/lib/public/page-heroes';
import type { Json } from '@/types/database.types';
import type { HeroSlide, PageHero } from '@/lib/public/types';

export async function saveHeroSlides(slides: HeroSlide[]): Promise<{ ok: true }> {
  await requireSuperAdmin();

  // Re-normalize on the server so we only ever persist well-formed entries,
  // re-stamping sortOrder from array position.
  const cleaned = normalizeHeroSlides(slides).map((slide, index) => ({
    ...slide,
    sortOrder: index
  }));

  const supabase = await createClient();
  const { error } = await supabase
    // hero_slides is added by migration 20260626120000 and may not be in
    // generated types yet, so we cast the payload.
    .from('site_settings')
    .update({ hero_slides: cleaned } as never)
    .eq('singleton_key', 'default');

  if (error) {
    throw new Error(`Could not save hero slides: ${error.message}`);
  }

  revalidatePath('/', 'layout');
  revalidatePath('/portal/settings');

  return { ok: true };
}

function cleanHero(input: PageHero): PageHero {
  const slides = normalizeHeroSlides(input.slides).map((slide, index) => ({
    ...slide,
    sortOrder: index
  }));
  const text = (value: string | null) => {
    const trimmed = (value ?? '').trim();
    return trimmed.length > 0 ? trimmed : null;
  };
  return {
    type: input.type === 'slider' || input.type === 'youtube' ? input.type : 'image',
    slides,
    youtubeUrl: text(input.youtubeUrl),
    eyebrow: text(input.eyebrow),
    heading: text(input.heading),
    subheading: text(input.subheading),
    ctaLabel: text(input.ctaLabel),
    ctaHref: text(input.ctaHref),
    overlayOpacity:
      typeof input.overlayOpacity === 'number'
        ? Math.min(1, Math.max(0, input.overlayOpacity))
        : DEFAULT_HERO_OVERLAY
  };
}

/** Persist the hero configuration for a single page into page_heroes[pageKey]. */
export async function savePageHero(pageKey: string, hero: PageHero): Promise<{ ok: true }> {
  await requireSuperAdmin();

  if (!isPageHeroKey(pageKey)) {
    throw new Error(`Unknown page: ${pageKey}`);
  }

  const supabase = await createClient();

  // Read-merge-write: page_heroes is a single jsonb map keyed by page.
  const { data, error: readError } = await supabase
    .from('site_settings')
    .select('page_heroes')
    .eq('singleton_key', 'default')
    .maybeSingle();

  if (readError) {
    throw new Error(`Could not load hero settings: ${readError.message}`);
  }

  const current = ((data?.page_heroes as Record<string, unknown> | null) ?? {}) as Record<
    string,
    unknown
  >;
  const next = { ...current, [pageKey]: cleanHero(hero) } as unknown as Json;

  const { error } = await supabase
    .from('site_settings')
    .update({ page_heroes: next })
    .eq('singleton_key', 'default');

  if (error) {
    throw new Error(`Could not save hero: ${error.message}`);
  }

  revalidatePath('/', 'layout');
  revalidatePath('/portal/settings/heroes');

  return { ok: true };
}
