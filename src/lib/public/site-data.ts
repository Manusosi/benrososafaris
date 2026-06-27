import { BENROSO_CONTACT_DEFAULTS } from '@/config/benroso';
import { createClient } from '@/lib/supabase/server';

import { localePath } from './locale-path';
import { activeHeroSlides, normalizeHeroSlides } from './hero-slides';
import type {
  HeroSlide,
  PublicBlogPost,
  PublicDestination,
  PublicSiteSettings,
  PublicTour
} from './types';

const DEFAULT_DESCRIPTION =
  'Benroso Safaris crafts premium Kenya and Tanzania safari holidays with local experts, tailored itineraries, and trusted on-the-ground support.';

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mediaUrl(asset: { url?: string | null } | { url?: string | null }[] | null | undefined) {
  return unwrapRelation(asset)?.url ?? null;
}

function mediaAlt(
  asset:
    | { alt?: string | null; url?: string | null }
    | { alt?: string | null; url?: string | null }[]
    | null
    | undefined,
  fallback: string
) {
  return unwrapRelation(asset)?.alt ?? fallback;
}

export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('site_settings')
    .select('*')
    .eq('singleton_key', 'default')
    .maybeSingle();

  const social = (data?.social_links as Record<string, string> | null) ?? {};

  return {
    addressShort: data?.address_short ?? BENROSO_CONTACT_DEFAULTS.addressShort,
    companyName: data?.company_name ?? BENROSO_CONTACT_DEFAULTS.companyName,
    description: DEFAULT_DESCRIPTION,
    email: data?.email ?? BENROSO_CONTACT_DEFAULTS.email,
    phoneOffice: data?.phone_office ?? BENROSO_CONTACT_DEFAULTS.phoneOffice,
    phonePrimary: data?.phone_primary ?? BENROSO_CONTACT_DEFAULTS.phonePrimary,
    phoneSecondary: data?.phone_secondary ?? BENROSO_CONTACT_DEFAULTS.phoneSecondary,
    postalAddress: data?.postal_address ?? BENROSO_CONTACT_DEFAULTS.postalAddress,
    socialLinks: social,
    whatsappMessage:
      data?.whatsapp_message ?? 'Hello Benroso Safaris, I would like help planning a safari.'
  };
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('site_settings')
      .select('hero_slides')
      .eq('singleton_key', 'default')
      .maybeSingle();

    const slides = normalizeHeroSlides((data as { hero_slides?: unknown } | null)?.hero_slides);
    return activeHeroSlides(slides);
  } catch {
    // Column may not exist yet (migration not applied). Hero falls back to defaults.
    return [];
  }
}

export async function getPublicDestinations(
  locale: string,
  limit = 12
): Promise<PublicDestination[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('destination_translations')
    .select(
      `
      slug,
      name,
      summary,
      destination:destinations!inner(id, country, region, status),
      og_image:media_assets!destination_translations_og_image_id_fkey(url, alt)
    `
    )
    .eq('locale', locale)
    .eq('destination.status', 'published')
    .not('published_at', 'is', null)
    .order('name')
    .limit(limit);

  return (data ?? []).flatMap((row) => {
    const destination = unwrapRelation(row.destination);
    if (!destination) return [];

    return [
      {
        country: destination.country,
        href: localePath(locale, `/destinations/${row.slug}`),
        id: destination.id,
        imageAlt: mediaAlt(row.og_image, row.name),
        imageUrl: mediaUrl(row.og_image),
        name: row.name,
        region: destination.region,
        slug: row.slug,
        summary: row.summary
      }
    ];
  });
}

export async function getPublicTours(locale: string, limit = 6): Promise<PublicTour[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('tour_translations')
    .select(
      `
      slug,
      title,
      excerpt,
      tour:tours!inner(id, status, days, nights, price_from),
      og_image:media_assets!tour_translations_og_image_id_fkey(url, alt)
    `
    )
    .eq('locale', locale)
    .eq('tour.status', 'published')
    .not('published_at', 'is', null)
    .order('title')
    .limit(limit);

  return (data ?? []).flatMap((row) => {
    const tour = unwrapRelation(row.tour);
    if (!tour) return [];

    return [
      {
        days: tour.days,
        excerpt: row.excerpt,
        href: localePath(locale, `/tours/${row.slug}`),
        id: tour.id,
        imageAlt: mediaAlt(row.og_image, row.title),
        imageUrl: mediaUrl(row.og_image),
        nights: tour.nights,
        priceFrom: tour.price_from,
        slug: row.slug,
        title: row.title
      }
    ];
  });
}

export async function getPublicBlogPosts(locale: string, limit = 3): Promise<PublicBlogPost[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('blog_translations')
    .select(
      `
      slug,
      title,
      excerpt,
      published_at,
      post:blog_posts!inner(
        id,
        status,
        deleted_at,
        primary_category:blog_categories!blog_posts_primary_category_id_fkey(name)
      ),
      og_image:media_assets!blog_translations_og_image_id_fkey(url, alt)
    `
    )
    .eq('locale', locale)
    .eq('post.status', 'published')
    .is('post.deleted_at', null)
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
    .limit(limit);

  return (data ?? []).flatMap((row) => {
    const post = unwrapRelation(row.post);
    if (!post) return [];

    return [
      {
        category: unwrapRelation(post.primary_category)?.name ?? null,
        excerpt: row.excerpt,
        href: localePath(locale, `/blog/${row.slug}`),
        id: post.id,
        imageAlt: mediaAlt(row.og_image, row.title),
        imageUrl: mediaUrl(row.og_image),
        publishedAt: row.published_at,
        slug: row.slug,
        title: row.title
      }
    ];
  });
}
