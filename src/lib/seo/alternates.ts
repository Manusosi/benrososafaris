import type { SupabaseClient } from '@supabase/supabase-js';

import { createEnquiryPublicClient } from '@/lib/supabase/service-role';

type TranslationAlternate = {
  locale: string;
  slug: string;
};

type BuildAlternatesInput = {
  table: string;
  parentId: string;
  parentKey?: string;
  pathBuilder: (item: TranslationAlternate) => string;
};

export async function buildAlternates({
  table,
  parentId,
  parentKey = 'post_id',
  pathBuilder
}: BuildAlternatesInput) {
  // Generic, runtime-driven table name: use the untyped client surface since the
  // typed client only accepts literal table names.
  const supabase = createEnquiryPublicClient() as unknown as SupabaseClient;
  const { data } = await supabase
    .from(table)
    .select('locale, slug')
    .eq(parentKey, parentId)
    .not('published_at', 'is', null);

  return Object.fromEntries(
    ((data as TranslationAlternate[] | null) ?? []).map((item) => [item.locale, pathBuilder(item)])
  );
}
