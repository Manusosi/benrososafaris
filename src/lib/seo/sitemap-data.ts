import type { SupabaseClient } from '@supabase/supabase-js';

import { SUPPORTED_LOCALES } from '@/lib/i18n';
import { createEnquiryPublicClient } from '@/lib/supabase/service-role';

export type SitemapUrlEntry = {
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  lastModified?: Date;
  path: string;
  priority?: number;
};

type TranslationRow = {
  locale: string;
  published_at: string | null;
  slug: string;
  updated_at: string | null;
};

const STATIC_PATHS: Array<{
  changeFrequency: SitemapUrlEntry['changeFrequency'];
  path: string;
  priority: number;
}> = [
  { path: '', priority: 1, changeFrequency: 'daily' },
  { path: 'about', priority: 0.8, changeFrequency: 'monthly' },
  { path: 'contact', priority: 0.7, changeFrequency: 'monthly' },
  { path: 'destinations', priority: 0.9, changeFrequency: 'weekly' },
  { path: 'tours', priority: 0.9, changeFrequency: 'weekly' },
  { path: 'experiences', priority: 0.85, changeFrequency: 'weekly' },
  { path: 'accommodations', priority: 0.85, changeFrequency: 'weekly' },
  { path: 'national-parks', priority: 0.85, changeFrequency: 'weekly' },
  { path: 'blog', priority: 0.85, changeFrequency: 'daily' },
  { path: 'our-fleet', priority: 0.75, changeFrequency: 'monthly' },
  { path: 'safari-packages', priority: 0.8, changeFrequency: 'weekly' },
  { path: 'privacy-policy', priority: 0.2, changeFrequency: 'yearly' },
  { path: 'cookie-policy', priority: 0.2, changeFrequency: 'yearly' },
  { path: 'terms-conditions', priority: 0.2, changeFrequency: 'yearly' },
  { path: 'payment-terms', priority: 0.2, changeFrequency: 'yearly' },
  { path: 'service-level-agreement', priority: 0.2, changeFrequency: 'yearly' }
];

function sitemapClient() {
  return createEnquiryPublicClient() as unknown as SupabaseClient;
}

function parseDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function staticUrls(): SitemapUrlEntry[] {
  return SUPPORTED_LOCALES.flatMap((locale) =>
    STATIC_PATHS.map((entry) => ({
      changeFrequency: entry.changeFrequency,
      lastModified: new Date(),
      path: entry.path ? `/${locale}/${entry.path}` : `/${locale}`,
      priority: entry.priority
    }))
  );
}

function mapTranslationRows(rows: TranslationRow[], pathPrefix: string): SitemapUrlEntry[] {
  return rows.flatMap((row) => {
    if (!SUPPORTED_LOCALES.includes(row.locale) || !row.slug) return [];
    return [
      {
        changeFrequency: 'weekly' as const,
        lastModified: parseDate(row.updated_at) ?? parseDate(row.published_at),
        path: `/${row.locale}/${pathPrefix}/${row.slug}`,
        priority: 0.7
      }
    ];
  });
}

function mapRows(data: unknown): TranslationRow[] {
  if (!Array.isArray(data)) return [];
  return data.map((row) => {
    const record = row as Record<string, unknown>;
    return {
      locale: record.locale as string,
      published_at: record.published_at as string | null,
      slug: record.slug as string,
      updated_at: record.updated_at as string | null
    };
  });
}

async function fetchTourTranslations() {
  const { data } = await sitemapClient()
    .from('tour_translations')
    .select('locale, slug, published_at, updated_at, tour:tours!inner(status, deleted_at)')
    .not('published_at', 'is', null)
    .eq('tour.status', 'published')
    .is('tour.deleted_at', null);
  return mapRows(data);
}

async function fetchPackageTranslations() {
  const { data } = await sitemapClient()
    .from('package_translations')
    .select('locale, slug, published_at, updated_at, package:packages!inner(status, deleted_at)')
    .not('published_at', 'is', null)
    .eq('package.status', 'published')
    .is('package.deleted_at', null);
  return mapRows(data);
}

async function fetchDestinationTranslations() {
  const { data } = await sitemapClient()
    .from('destination_translations')
    .select(
      'locale, slug, published_at, updated_at, destination:destinations!inner(status, deleted_at)'
    )
    .not('published_at', 'is', null)
    .eq('destination.status', 'published')
    .is('destination.deleted_at', null);
  return mapRows(data);
}

async function fetchBlogTranslations() {
  const { data } = await sitemapClient()
    .from('blog_translations')
    .select('locale, slug, published_at, updated_at, post:blog_posts!inner(status, deleted_at)')
    .not('published_at', 'is', null)
    .eq('post.status', 'published')
    .is('post.deleted_at', null);
  return mapRows(data);
}

async function fetchExperienceTranslations() {
  const { data } = await sitemapClient()
    .from('experience_translations')
    .select(
      'locale, slug, published_at, updated_at, experience:experiences!inner(status, deleted_at)'
    )
    .not('published_at', 'is', null)
    .eq('experience.status', 'published')
    .is('experience.deleted_at', null);
  return mapRows(data);
}

async function fetchAccommodationTranslations() {
  const { data } = await sitemapClient()
    .from('accommodation_translations')
    .select(
      'locale, slug, published_at, updated_at, accommodation:accommodations!inner(status, deleted_at)'
    )
    .not('published_at', 'is', null)
    .eq('accommodation.status', 'published')
    .is('accommodation.deleted_at', null);
  return mapRows(data);
}

async function fetchNationalParkTranslations() {
  const { data } = await sitemapClient()
    .from('national_park_translations')
    .select('locale, slug, published_at, updated_at, park:national_parks!inner(status)')
    .not('published_at', 'is', null)
    .eq('park.status', 'published');
  return mapRows(data);
}

async function fetchFleetTranslations() {
  const { data } = await sitemapClient()
    .from('fleet_vehicle_translations')
    .select('locale, slug, published_at, updated_at, vehicle:fleet_vehicles!inner(status)')
    .not('published_at', 'is', null)
    .eq('vehicle.status', 'published');
  return mapRows(data);
}

export async function getAllSitemapUrls(): Promise<SitemapUrlEntry[]> {
  const [tours, packages, destinations, blog, experiences, accommodations, parks, fleet] =
    await Promise.all([
      fetchTourTranslations(),
      fetchPackageTranslations(),
      fetchDestinationTranslations(),
      fetchBlogTranslations(),
      fetchExperienceTranslations(),
      fetchAccommodationTranslations(),
      fetchNationalParkTranslations(),
      fetchFleetTranslations()
    ]);

  const dynamicUrls = [
    ...mapTranslationRows(tours, 'tours'),
    ...mapTranslationRows(packages, 'safari-packages'),
    ...mapTranslationRows(destinations, 'destinations'),
    ...mapTranslationRows(blog, 'blog'),
    ...mapTranslationRows(experiences, 'experiences'),
    ...mapTranslationRows(accommodations, 'accommodations'),
    ...mapTranslationRows(parks, 'national-parks'),
    ...mapTranslationRows(fleet, 'our-fleet')
  ];

  const seen = new Set<string>();
  const urls: SitemapUrlEntry[] = [];

  for (const entry of [...staticUrls(), ...dynamicUrls]) {
    if (seen.has(entry.path)) continue;
    seen.add(entry.path);
    urls.push(entry);
  }

  return urls;
}
