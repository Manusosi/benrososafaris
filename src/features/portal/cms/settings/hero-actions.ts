'use server';

import { revalidatePath } from 'next/cache';

import { requireSuperAdmin } from '@/lib/auth/portal';
import { createClient } from '@/lib/supabase/server';
import { normalizeHeroSlides } from '@/lib/public/hero-slides';
import type { HeroSlide } from '@/lib/public/types';

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
