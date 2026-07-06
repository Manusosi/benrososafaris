'use server';

import { revalidatePath } from 'next/cache';

import { backfillPublishedTranslations } from '@/lib/i18n/auto-translate-content';
import { isAutoTranslateEnabled } from '@/lib/i18n/auto-translate-config';
import { requireSuperAdmin } from '@/lib/auth/portal';

export async function runPublishedContentBackfill(): Promise<{
  ok: true;
  totals: Awaited<ReturnType<typeof backfillPublishedTranslations>>;
}> {
  await requireSuperAdmin();

  if (!isAutoTranslateEnabled()) {
    throw new Error(
      'Auto-translation is disabled. Set AUTO_TRANSLATE_ENABLED=true and GOOGLE_TRANSLATE_API_KEY in Vercel.'
    );
  }

  const totals = await backfillPublishedTranslations();

  revalidatePath('/', 'layout');

  return { ok: true, totals };
}
