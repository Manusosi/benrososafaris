import { localePath } from './locale-path';
import { buildLegalFooterLinks } from './legal-content';
import type {
  PublicDestination,
  PublicExperience,
  PublicExperienceMenuItem,
  PublicFooterColumn,
  PublicMegaMenu,
  PublicNavItem
} from './types';

function lp(locale: string, path: string) {
  return localePath(locale, path);
}

/** The countries Benroso operates in, in preferred column order, with flags. */
const COUNTRY_COLUMNS: { country: string; slug: string; flag: string }[] = [
  { country: 'Kenya', slug: 'kenya', flag: '🇰🇪' },
  { country: 'Tanzania', slug: 'tanzania', flag: '🇹🇿' },
  { country: 'Uganda', slug: 'uganda', flag: '🇺🇬' },
  { country: 'Rwanda', slug: 'rwanda', flag: '🇷🇼' },
  { country: 'South Africa', slug: 'south-africa', flag: '🇿🇦' }
];

function countrySlug(country: string) {
  return country.trim().toLowerCase().replace(/\s+/g, '-');
}

/**
 * Builds the Destinations hover mega menu: one column per operating country,
 * each listing its published destinations, plus a featured promo card. Columns
 * render even with no destinations yet (the design stays in place as trips are
 * added one by one).
 */
export function buildDestinationsMegaMenu(
  locale: string,
  destinations: PublicDestination[]
): PublicMegaMenu {
  const path = (route: string) => lp(locale, route);

  // Group destinations by their country (case-insensitive).
  const byCountry = new Map<string, PublicDestination[]>();
  for (const destination of destinations) {
    const key = (destination.country ?? '').trim().toLowerCase();
    if (!key) continue;
    const list = byCountry.get(key) ?? [];
    list.push(destination);
    byCountry.set(key, list);
  }

  // Start from the preset countries, then append any extra countries present in
  // the data that are not already covered.
  const presetKeys = new Set(COUNTRY_COLUMNS.map((column) => column.country.toLowerCase()));
  const extraColumns = [...byCountry.keys()]
    .filter((key) => !presetKeys.has(key))
    .map((key) => {
      const sample = byCountry.get(key)?.[0];
      const country = sample?.country ?? key;
      return { country, slug: countrySlug(country), flag: '🌍' };
    });

  const columns = [...COUNTRY_COLUMNS, ...extraColumns].map((column) => {
    const list = (byCountry.get(column.country.toLowerCase()) ?? []).toSorted((a, b) =>
      a.name.localeCompare(b.name)
    );
    return {
      country: column.country,
      flag: column.flag,
      href: path(`/destinations?country=${column.slug}`),
      destinations: list.map((destination) => ({
        label: destination.name,
        href: destination.href
      }))
    };
  });

  const featuredSource = destinations.find((destination) => destination.imageUrl) ?? null;

  return {
    columns,
    featured: {
      title: 'Not sure where to go?',
      description:
        'Tell us how you like to travel and our experts will craft a tailor-made safari.',
      cta: 'Plan my safari',
      href: path('/contact'),
      imageUrl: featuredSource?.imageUrl ?? null,
      imageAlt: featuredSource?.imageAlt ?? 'Safari landscape'
    }
  };
}

function uniqueLinks(links: PublicNavItem[]): PublicNavItem[] {
  const seen = new Set<string>();
  return links.filter((link) => {
    if (seen.has(link.href)) return false;
    seen.add(link.href);
    return true;
  });
}

export function buildPublicNavigation(
  locale: string,
  _destinations: PublicDestination[],
  _experiences: PublicExperience[] = [],
  experienceMenuItems: PublicExperienceMenuItem[] = []
): PublicNavItem[] {
  const path = (route: string) => lp(locale, route);
  const topExperienceItems = experienceMenuItems.filter(
    (item) => item.menuGroup === 'top_experiences'
  );
  const wildlifeExperienceItems = experienceMenuItems.filter(
    (item) => item.menuGroup === 'wildlife_safari'
  );

  return [
    { label: 'Home', href: path('/'), variant: 'simple' },
    {
      label: 'About Us',
      href: path('/about'),
      items: [
        { label: 'Our Story', href: path('/about') },
        { label: 'Our Safari Vehicles', href: path('/our-fleet') }
      ],
      variant: 'simple'
    },
    {
      label: 'Destinations',
      href: path('/destinations'),
      items: [
        { label: 'Kenya', href: path('/destinations?country=kenya') },
        { label: 'Tanzania', href: path('/destinations?country=tanzania') },
        { label: 'Uganda', href: path('/destinations?country=uganda') },
        { label: 'Rwanda', href: path('/destinations?country=rwanda') },
        { label: 'South Africa', href: path('/destinations?country=south-africa') }
      ],
      variant: 'mega'
    },
    {
      label: 'Safari Tours',
      href: path('/tours'),
      variant: 'simple'
    },
    {
      label: 'Experiences',
      href: path('/experiences'),
      sections: [
        {
          label: 'Top Experiences',
          items: topExperienceItems
        },
        {
          label: 'Wildlife Safari',
          items: wildlifeExperienceItems
        }
      ],
      variant: 'dynamic'
    },
    {
      label: 'Accommodations',
      href: path('/accommodations'),
      variant: 'simple'
    },
    {
      label: 'National Parks',
      href: path('/national-parks'),
      variant: 'simple'
    },
    { label: 'Blog', href: path('/blog'), variant: 'simple' },
    { label: 'Contact Us', href: path('/contact'), variant: 'simple' }
  ];
}

export function buildFooterNavigation(
  locale: string,
  _destinations: PublicDestination[],
  _experiences: PublicExperience[] = []
): PublicFooterColumn[] {
  const path = (route: string) => lp(locale, route);

  const exploreLinks = uniqueLinks([
    { label: 'Destinations', href: path('/destinations') },
    { label: 'Safari Tours', href: path('/tours') },
    { label: 'Safari Experiences', href: path('/experiences') },
    { label: 'National Parks', href: path('/national-parks') },
    { label: 'Accommodations', href: path('/accommodations') }
  ]);

  const companyLinks = uniqueLinks([
    { label: 'About Us', href: path('/about') },
    { label: 'Our Safari Vehicles', href: path('/our-fleet') },
    { label: 'Travel Blog', href: path('/blog') },
    { label: 'Contact Us', href: path('/contact') }
  ]);

  const policyLinks = buildLegalFooterLinks(locale).map((link) => ({
    label: link.label,
    href: link.href
  }));

  return [
    { title: 'Explore', links: exploreLinks },
    { title: 'Company', links: companyLinks },
    { title: 'Help & Policies', links: policyLinks }
  ];
}
