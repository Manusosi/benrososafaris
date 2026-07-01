import {
  BENROSO_ABOUT_HERO,
  BENROSO_CONTACT_HERO,
  BENROSO_PUBLIC_HERO_IMAGES
} from '@/config/benroso';
import { normalizeHeroSlides } from './hero-slides';
import type { PageHero, PageHeroType } from './types';

export const DEFAULT_HERO_OVERLAY = 0.55;

/** Pages whose hero can be configured from Portal > Settings > Hero Sections. */
export type PageHeroKey =
  | 'home'
  | 'destinations'
  | 'national-parks'
  | 'tours'
  | 'packages'
  | 'experiences'
  | 'accommodations'
  | 'blog'
  | 'about'
  | 'contact';

export type PageHeroRegistryEntry = {
  key: PageHeroKey;
  /** Human label shown in the dashboard. */
  label: string;
  /** Public path (locale-less) used for the "view page" link. */
  path: string;
  /** Short helper shown under the label in the editor. */
  description: string;
  /** Current hardcoded fallback image, shown as a preview when unconfigured. */
  defaultImageUrl: string | null;
};

export const PAGE_HERO_REGISTRY: PageHeroRegistryEntry[] = [
  {
    key: 'home',
    label: 'Homepage',
    path: '/',
    description: 'The main hero slider at the top of the homepage.',
    defaultImageUrl: '/assets/great%20migration%20of%20wildebeasts%20in%20across%20mara%20river.jpg'
  },
  {
    key: 'destinations',
    label: 'Destinations',
    path: '/destinations',
    description: 'Hero on the destinations listing page.',
    defaultImageUrl: BENROSO_PUBLIC_HERO_IMAGES.destinations.imageUrl
  },
  {
    key: 'national-parks',
    label: 'National Parks',
    path: '/national-parks',
    description: 'Hero on the national parks listing page.',
    defaultImageUrl: BENROSO_PUBLIC_HERO_IMAGES.destinations.imageUrl
  },
  {
    key: 'tours',
    label: 'Safari Tours',
    path: '/tours',
    description: 'Hero on the safari tours listing page.',
    defaultImageUrl: BENROSO_PUBLIC_HERO_IMAGES.tours.imageUrl
  },
  {
    key: 'packages',
    label: 'Safari Packages',
    path: '/safari-packages',
    description: 'Hero on the safari packages listing page.',
    defaultImageUrl: BENROSO_PUBLIC_HERO_IMAGES.tours.imageUrl
  },
  {
    key: 'experiences',
    label: 'Experiences',
    path: '/experiences',
    description: 'Hero on the experiences listing page.',
    defaultImageUrl: BENROSO_PUBLIC_HERO_IMAGES.experiences.imageUrl
  },
  {
    key: 'accommodations',
    label: 'Accommodations',
    path: '/accommodations',
    description: 'Hero on the accommodations listing page.',
    defaultImageUrl: BENROSO_PUBLIC_HERO_IMAGES.accommodations.imageUrl
  },
  {
    key: 'blog',
    label: 'Blog',
    path: '/blog',
    description: 'Hero on the blog/articles listing page.',
    defaultImageUrl: BENROSO_PUBLIC_HERO_IMAGES.destinations.imageUrl
  },
  {
    key: 'about',
    label: 'About Us',
    path: '/about',
    description: 'Hero on the about page.',
    defaultImageUrl: BENROSO_ABOUT_HERO.imageUrl
  },
  {
    key: 'contact',
    label: 'Contact',
    path: '/contact',
    description: 'Hero on the contact page.',
    defaultImageUrl: BENROSO_CONTACT_HERO.imageUrl
  }
];

const PAGE_HERO_KEYS = new Set<string>(PAGE_HERO_REGISTRY.map((entry) => entry.key));

export function isPageHeroKey(value: string): value is PageHeroKey {
  return PAGE_HERO_KEYS.has(value);
}

/** A blank hero used when a page has nothing configured yet. */
export function emptyPageHero(): PageHero {
  return {
    type: 'image',
    slides: [],
    youtubeUrl: null,
    eyebrow: null,
    heading: null,
    subheading: null,
    ctaLabel: null,
    ctaHref: null,
    overlayOpacity: DEFAULT_HERO_OVERLAY
  };
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function asType(value: unknown): PageHeroType {
  return value === 'slider' || value === 'youtube' || value === 'image' ? value : 'image';
}

function asOverlay(value: unknown): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return DEFAULT_HERO_OVERLAY;
  return Math.min(1, Math.max(0, value));
}

/** Defensively parse a stored page_heroes entry into a typed PageHero. */
export function normalizePageHero(value: unknown): PageHero | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;

  const hero: PageHero = {
    type: asType(record.type),
    slides: normalizeHeroSlides(record.slides),
    youtubeUrl: asString(record.youtubeUrl),
    eyebrow: asString(record.eyebrow),
    heading: asString(record.heading),
    subheading: asString(record.subheading),
    ctaLabel: asString(record.ctaLabel),
    ctaHref: asString(record.ctaHref),
    overlayOpacity: asOverlay(record.overlayOpacity)
  };

  // An unconfigured hero (no media, no youtube) is treated as "use the default".
  const hasMedia = hero.slides.length > 0 || (hero.type === 'youtube' && hero.youtubeUrl);
  const hasCopy = hero.eyebrow || hero.heading || hero.subheading || hero.ctaLabel;
  if (!hasMedia && !hasCopy) return null;

  return hero;
}

/** True when a configured hero actually has media to render. */
export function heroHasMedia(hero: PageHero | null | undefined): boolean {
  if (!hero) return false;
  if (hero.type === 'youtube') return Boolean(youtubeVideoId(hero.youtubeUrl));
  return hero.slides.some((slide) => slide.isActive && slide.mediaUrl);
}

/** Extract the YouTube video id from common URL shapes (watch, youtu.be, embed). */
export function youtubeVideoId(url: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
  ];
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return match[1];
  }
  // Bare id
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  return null;
}
