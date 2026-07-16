'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

import type { SupabaseClient } from '@supabase/supabase-js';

import { requirePortalSession } from '@/lib/auth/portal';
import { SUPPORTED_LOCALES } from '@/lib/i18n';
import { createClient } from '@/lib/supabase/server';
import {
  BENROSO_OPERATING_COUNTRIES,
  type BenrosoCountryId
} from '@/features/experiences/public/country-map-copy';
import {
  EXPERIENCES_PAGE_SIZE,
  type ExperienceListItem,
  type ExperienceListParams,
  type ExperienceListResult,
  type ExperienceQuickEditInput,
  type ExperienceStatusCounts
} from './types';

/** Editors and super admins only. */
const WRITE_ROLES = new Set(['owner', 'admin', 'editor']);

async function assertCanWrite() {
  const session = await requirePortalSession();
  if (!WRITE_ROLES.has(session.role)) {
    throw new Error('You do not have permission to manage experiences.');
  }
}

function revalidateExperiencePublicPaths() {
  revalidateTag('public-experiences', 'max');
  for (const locale of SUPPORTED_LOCALES) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/experiences`);
    revalidatePath(`/${locale}/tours`);
  }
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function parseCountries(value: unknown): BenrosoCountryId[] {
  if (!Array.isArray(value)) return [];

  const allowed = new Set(BENROSO_OPERATING_COUNTRIES.map((country) => country.id));

  return value.filter(
    (item): item is BenrosoCountryId =>
      typeof item === 'string' && allowed.has(item as BenrosoCountryId)
  );
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

/**
 * Paginated, filtered experiences list for the WordPress-style admin table.
 *
 * Reads from `experience_translations` (which holds the title/slug/publish
 * date) with an inner join to the base row so we can filter by status,
 * category, and trash state in a single query. Status-tab counts, category
 * options, and publish-month options are computed alongside so the client has
 * everything to render the toolbar in one round trip.
 */
export async function listExperiences(params: ExperienceListParams): Promise<ExperienceListResult> {
  // The list filters on embedded-resource paths (e.g. `experiences.status`),
  // which the typed client's column-key signatures reject. Use the untyped
  // surface for this query only.
  const supabase = (await createClient()) as unknown as SupabaseClient;
  const page = Math.max(1, params.page);
  const from = (page - 1) * EXPERIENCES_PAGE_SIZE;
  const to = from + EXPERIENCES_PAGE_SIZE - 1;

  let query = supabase
    .from('experience_translations')
    .select(
      'experience_id, title, slug, published_at, experiences!inner(id, status, category, countries, updated_at, deleted_at)',
      { count: 'exact' }
    )
    .eq('locale', 'en');

  // Status / trash view.
  if (params.status === 'trash') {
    query = query.not('experiences.deleted_at', 'is', null);
  } else {
    query = query.is('experiences.deleted_at', null);
    if (params.status === 'published') query = query.eq('experiences.status', 'published');
    if (params.status === 'draft') query = query.eq('experiences.status', 'draft');
  }

  if (params.search.trim()) {
    const term = `%${params.search.trim()}%`;
    query = query.or(`title.ilike.${term},slug.ilike.${term}`);
  }
  if (params.category) query = query.eq('experiences.category', params.category);

  const range = monthRange(params.month);
  if (range) query = query.gte('published_at', range.start).lt('published_at', range.end);

  query = query
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('title', { ascending: true })
    .range(from, to);

  const { data, count } = await query;

  type Row = {
    experience_id: string;
    title: string | null;
    slug: string | null;
    published_at: string | null;
    experiences: {
      id: string;
      status: string;
      category: string | null;
      countries: string[] | null;
      updated_at: string;
      deleted_at: string | null;
    } | null;
  };

  const items: ExperienceListItem[] = ((data as Row[] | null) ?? [])
    .filter((row) => row.experiences)
    .map((row) => ({
      id: row.experience_id,
      title: row.title ?? 'Untitled',
      slug: row.slug ?? '',
      status: row.experiences!.status,
      category: row.experiences!.category,
      countries: parseCountries(row.experiences!.countries),
      publishedAt: row.published_at,
      updatedAt: row.experiences!.updated_at,
      trashed: row.experiences!.deleted_at !== null
    }));

  const [counts, categories, months] = await Promise.all([
    getStatusCounts(),
    getCategoryOptions(),
    getMonthOptions()
  ]);

  return {
    items,
    total: count ?? 0,
    page,
    pageSize: EXPERIENCES_PAGE_SIZE,
    counts,
    categories,
    months
  };
}

async function getStatusCounts(): Promise<ExperienceStatusCounts> {
  const supabase = await createClient();
  const head = () => supabase.from('experiences').select('id', { count: 'exact', head: true });

  const [all, published, draft, trash] = await Promise.all([
    head().is('deleted_at', null),
    head().is('deleted_at', null).eq('status', 'published'),
    head().is('deleted_at', null).eq('status', 'draft'),
    head().not('deleted_at', 'is', null)
  ]);

  return {
    all: all.count ?? 0,
    published: published.count ?? 0,
    draft: draft.count ?? 0,
    trash: trash.count ?? 0
  };
}

async function getCategoryOptions(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('experiences').select('category').is('deleted_at', null);
  const set = new Set<string>();
  for (const row of data ?? []) if (row.category) set.add(row.category);
  return [...set].toSorted((a, b) => a.localeCompare(b));
}

async function getMonthOptions(): Promise<Array<{ value: string; label: string }>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('experience_translations')
    .select('published_at')
    .eq('locale', 'en')
    .not('published_at', 'is', null);

  const set = new Set<string>();
  for (const row of data ?? []) {
    if (!row.published_at) continue;
    set.add(row.published_at.slice(0, 7)); // YYYY-MM
  }
  return [...set]
    .toSorted((a, b) => b.localeCompare(a))
    .map((value) => ({ value, label: monthLabel(value) }));
}

/** Moves experiences to the trash (soft delete). */
export async function trashExperiences(ids: string[]): Promise<void> {
  if (!ids.length) return;
  await assertCanWrite();
  const supabase = await createClient();
  const { error } = await supabase
    .from('experiences')
    .update({ deleted_at: new Date().toISOString(), status: 'trash' })
    .in('id', ids);
  if (error) throw new Error(error.message);
  revalidatePath('/portal/experiences');
  revalidateExperiencePublicPaths();
}

/** Restores trashed experiences, re-deriving status from the publish date. */
export async function restoreExperiences(ids: string[]): Promise<void> {
  if (!ids.length) return;
  await assertCanWrite();
  const supabase = await createClient();

  const { data: translations } = await supabase
    .from('experience_translations')
    .select('experience_id, published_at')
    .eq('locale', 'en')
    .in('experience_id', ids);

  const publishedIds = new Set(
    (translations ?? []).filter((t) => t.published_at).map((t) => t.experience_id)
  );

  const toPublished = ids.filter((id) => publishedIds.has(id));
  const toDraft = ids.filter((id) => !publishedIds.has(id));

  if (toPublished.length) {
    const { error } = await supabase
      .from('experiences')
      .update({ deleted_at: null, status: 'published' })
      .in('id', toPublished);
    if (error) throw new Error(error.message);
  }
  if (toDraft.length) {
    const { error } = await supabase
      .from('experiences')
      .update({ deleted_at: null, status: 'draft' })
      .in('id', toDraft);
    if (error) throw new Error(error.message);
  }

  revalidatePath('/portal/experiences');
  revalidateExperiencePublicPaths();
}

/** Permanently deletes experiences (and their translations). */
export async function deleteExperiencesPermanently(ids: string[]): Promise<void> {
  if (!ids.length) return;
  await assertCanWrite();
  const supabase = await createClient();

  await supabase.from('experience_translations').delete().in('experience_id', ids);
  const { error } = await supabase.from('experiences').delete().in('id', ids);
  if (error) throw new Error(error.message);

  revalidatePath('/portal/experiences');
  revalidateExperiencePublicPaths();
}

/** Empties the trash — permanently deletes every trashed experience. */
export async function emptyExperiencesTrash(): Promise<void> {
  await assertCanWrite();
  const supabase = await createClient();

  const { data } = await supabase.from('experiences').select('id').not('deleted_at', 'is', null);
  const ids = (data ?? []).map((row) => row.id);
  await deleteExperiencesPermanently(ids);
}

/** Inline Quick Edit save: title, slug, category, status, and publish date. */
export async function quickEditExperience(input: ExperienceQuickEditInput): Promise<void> {
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
    .from('experiences')
    .update({
      status: input.status,
      category: input.category.trim() || null,
      countries: parseCountries(input.countries),
      updated_at: now
    })
    .eq('id', input.id);
  if (baseError) throw new Error(baseError.message);

  const { error: translationError } = await supabase
    .from('experience_translations')
    .update({ title, slug, published_at: publishedAt, updated_at: now })
    .eq('experience_id', input.id)
    .eq('locale', 'en');
  if (translationError) throw new Error(translationError.message);

  revalidatePath('/portal/experiences');
  revalidateExperiencePublicPaths();
}
