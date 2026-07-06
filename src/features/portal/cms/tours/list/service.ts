'use server';

import { revalidatePath } from 'next/cache';

import type { SupabaseClient } from '@supabase/supabase-js';

import { requirePortalSession } from '@/lib/auth/portal';
import { createClient } from '@/lib/supabase/server';
import { revalidateTourPublicPaths } from '@/features/portal/cms/tours/revalidate-public-paths';
import {
  TOURS_PAGE_SIZE,
  type TourListItem,
  type TourListParams,
  type TourListResult,
  type TourQuickEditInput,
  type TourStatusCounts
} from './types';

/** Editors and super admins only. */
const WRITE_ROLES = new Set(['owner', 'admin', 'editor']);

async function assertCanWrite() {
  const session = await requirePortalSession();
  if (!WRITE_ROLES.has(session.role)) {
    throw new Error('You do not have permission to manage tours.');
  }
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Tours use `archived` in the DB; the list UI labels that as trash. */
function displayStatus(status: string): string {
  return status === 'archived' ? 'trash' : status;
}

/** `YYYY-MM` → ISO range [start, nextMonthStart). */
function monthRange(month: string): { start: string; end: string } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) return null;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const start = new Date(Date.UTC(year, monthIndex, 1));
  const end = new Date(Date.UTC(year, monthIndex + 1, 1));
  return { start: start.toISOString(), end: end.toISOString() };
}

function monthLabel(value: string): string {
  const range = monthRange(value);
  if (!range) return value;
  return new Date(range.start).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

export async function listTours(params: TourListParams): Promise<TourListResult> {
  const supabase = (await createClient()) as unknown as SupabaseClient;
  const page = Math.max(1, params.page);
  const from = (page - 1) * TOURS_PAGE_SIZE;
  const to = from + TOURS_PAGE_SIZE - 1;

  let tourIdsFilter: string[] | null = null;

  if (params.search.trim()) {
    const term = `%${params.search.trim()}%`;
    const { data: searchRows } = await supabase
      .from('tour_translations')
      .select('tour_id')
      .eq('locale', 'en')
      .or(`title.ilike.${term},slug.ilike.${term}`);
    tourIdsFilter = [...new Set((searchRows ?? []).map((row) => row.tour_id as string))];
    if (!tourIdsFilter.length) {
      const [counts, months] = await Promise.all([getStatusCounts(), getMonthOptions()]);
      return {
        items: [],
        total: 0,
        page,
        pageSize: TOURS_PAGE_SIZE,
        counts,
        months
      };
    }
  }

  const range = monthRange(params.month);
  if (range && (params.status === 'published' || params.status === 'all')) {
    const { data: monthRows } = await supabase
      .from('tour_translations')
      .select('tour_id')
      .eq('locale', 'en')
      .gte('published_at', range.start)
      .lt('published_at', range.end);
    const monthIds = [...new Set((monthRows ?? []).map((row) => row.tour_id as string))];
    tourIdsFilter = tourIdsFilter ? tourIdsFilter.filter((id) => monthIds.includes(id)) : monthIds;
    if (!tourIdsFilter.length) {
      const [counts, months] = await Promise.all([getStatusCounts(), getMonthOptions()]);
      return {
        items: [],
        total: 0,
        page,
        pageSize: TOURS_PAGE_SIZE,
        counts,
        months
      };
    }
  }

  let query = supabase
    .from('tours')
    .select(
      'id, status, days, nights, updated_at, tour_translations(title, slug, published_at, locale)',
      { count: 'exact' }
    );

  if (params.status === 'trash') {
    query = query.eq('status', 'archived');
  } else {
    query = query.neq('status', 'archived');
    if (params.status === 'published') query = query.eq('status', 'published');
    if (params.status === 'draft') query = query.eq('status', 'draft');
  }

  if (tourIdsFilter) query = query.in('id', tourIdsFilter);

  query = query.order('updated_at', { ascending: false }).range(from, to);

  const { data, count } = await query;

  type Row = {
    id: string;
    status: string;
    days: number | null;
    nights: number | null;
    updated_at: string;
    tour_translations: Array<{
      title: string | null;
      slug: string | null;
      published_at: string | null;
      locale: string | null;
    }> | null;
  };

  const items: TourListItem[] = ((data as Row[] | null) ?? []).map((row) => {
    const translation =
      row.tour_translations?.find((entry) => entry.locale === 'en') ??
      row.tour_translations?.[0] ??
      null;

    return {
      id: row.id,
      title: translation?.title ?? 'Untitled draft',
      slug: translation?.slug ?? '',
      status: displayStatus(row.status),
      days: row.days,
      nights: row.nights,
      publishedAt: translation?.published_at ?? null,
      updatedAt: row.updated_at,
      trashed: row.status === 'archived'
    };
  });

  const [counts, months] = await Promise.all([getStatusCounts(), getMonthOptions()]);

  return {
    items,
    total: count ?? 0,
    page,
    pageSize: TOURS_PAGE_SIZE,
    counts,
    months
  };
}

async function getStatusCounts(): Promise<TourStatusCounts> {
  const supabase = await createClient();
  const head = () => supabase.from('tours').select('id', { count: 'exact', head: true });

  const [all, published, draft, trash] = await Promise.all([
    head().neq('status', 'archived'),
    head().eq('status', 'published'),
    head().eq('status', 'draft'),
    head().eq('status', 'archived')
  ]);

  return {
    all: all.count ?? 0,
    published: published.count ?? 0,
    draft: draft.count ?? 0,
    trash: trash.count ?? 0
  };
}

async function getMonthOptions(): Promise<Array<{ value: string; label: string }>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('tour_translations')
    .select('published_at')
    .eq('locale', 'en')
    .not('published_at', 'is', null);

  const set = new Set<string>();
  for (const row of data ?? []) {
    if (!row.published_at) continue;
    set.add(row.published_at.slice(0, 7));
  }
  return [...set]
    .toSorted((a, b) => b.localeCompare(a))
    .map((value) => ({ value, label: monthLabel(value) }));
}

/** Moves tours to the trash (archived status). */
export async function trashTours(ids: string[]): Promise<void> {
  if (!ids.length) return;
  await assertCanWrite();
  const supabase = await createClient();
  const { error } = await supabase
    .from('tours')
    .update({ status: 'archived', updated_at: new Date().toISOString() })
    .in('id', ids);
  if (error) throw new Error(error.message);
  revalidatePath('/portal/tours');
  revalidateTourPublicPaths();
}

/** Restores trashed tours, re-deriving status from the publish date. */
export async function restoreTours(ids: string[]): Promise<void> {
  if (!ids.length) return;
  await assertCanWrite();
  const supabase = await createClient();

  const { data: translations } = await supabase
    .from('tour_translations')
    .select('tour_id, published_at')
    .eq('locale', 'en')
    .in('tour_id', ids);

  const publishedIds = new Set(
    (translations ?? []).filter((t) => t.published_at).map((t) => t.tour_id)
  );

  const toPublished = ids.filter((id) => publishedIds.has(id));
  const toDraft = ids.filter((id) => !publishedIds.has(id));

  if (toPublished.length) {
    const { error } = await supabase
      .from('tours')
      .update({ status: 'published', updated_at: new Date().toISOString() })
      .in('id', toPublished);
    if (error) throw new Error(error.message);
  }
  if (toDraft.length) {
    const { error } = await supabase
      .from('tours')
      .update({ status: 'draft', updated_at: new Date().toISOString() })
      .in('id', toDraft);
    if (error) throw new Error(error.message);
  }

  revalidatePath('/portal/tours');
  revalidateTourPublicPaths();
}

/** Permanently deletes tours (and their translations). */
export async function deleteToursPermanently(ids: string[]): Promise<void> {
  if (!ids.length) return;
  await assertCanWrite();
  const supabase = await createClient();

  await supabase.from('tour_translations').delete().in('tour_id', ids);
  const { error } = await supabase.from('tours').delete().in('id', ids);
  if (error) throw new Error(error.message);

  revalidatePath('/portal/tours');
  revalidateTourPublicPaths();
}

/** Empties the trash — permanently deletes every archived tour. */
export async function emptyToursTrash(): Promise<void> {
  await assertCanWrite();
  const supabase = await createClient();

  const { data } = await supabase.from('tours').select('id').eq('status', 'archived');
  const ids = (data ?? []).map((row) => row.id);
  await deleteToursPermanently(ids);
}

/** Inline Quick Edit save: title, slug, status, and publish date. */
export async function quickEditTour(input: TourQuickEditInput): Promise<void> {
  await assertCanWrite();

  const title = input.title.trim();
  const slug = input.slug.trim().toLowerCase();
  if (title.length < 2) throw new Error('Title must be at least 2 characters.');
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error('Slug may only contain lowercase letters, numbers, and hyphens.');
  }

  const supabase = await createClient();
  const now = new Date().toISOString();
  const publishedAt = input.status === 'published' ? input.publishedAt.trim() || now : null;

  const { error: baseError } = await supabase
    .from('tours')
    .update({
      status: input.status,
      updated_at: now
    })
    .eq('id', input.id);
  if (baseError) throw new Error(baseError.message);

  const { error: translationError } = await supabase
    .from('tour_translations')
    .update({ title, slug, published_at: publishedAt, updated_at: now })
    .eq('tour_id', input.id)
    .eq('locale', 'en');
  if (translationError) throw new Error(translationError.message);

  revalidatePath('/portal/tours');
  revalidateTourPublicPaths();
}
