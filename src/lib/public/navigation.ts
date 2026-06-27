import { localePath } from './locale-path';
import { buildLegalFooterLinks } from './legal-content';
import type {
  PublicDestination,
  PublicExperience,
  PublicFooterColumn,
  PublicNavItem
} from './types';

function lp(locale: string, path: string) {
  return localePath(locale, path);
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
  experiences: PublicExperience[] = []
): PublicNavItem[] {
  const path = (route: string) => lp(locale, route);

  return [
    { label: 'Home', href: path('/'), variant: 'simple' },
    {
      label: 'About Us',
      href: path('/about'),
      items: [
        { label: 'Our Story', href: path('/about') },
        { label: 'Our Safari Vehicles', href: path('/our-fleet') },
        { label: 'Our Tour Guides', href: path('/about#guides') }
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
      variant: 'dynamic'
    },
    {
      label: 'Safari Tours',
      href: path('/tours'),
      items: [
        { label: 'Tour Safaris', href: path('/tours') },
        { label: 'East Africa Safari Deals', href: path('/safari-packages') },
        { label: 'Safari Vehicles', href: path('/our-fleet') }
      ],
      variant: 'simple'
    },
    {
      label: 'Experiences',
      href: path('/experiences'),
      items: uniqueLinks([
        { label: 'All Experiences', href: path('/experiences') },
        ...[...new Set(experiences.map((experience) => experience.category).filter(Boolean))].map(
          (category) => ({
            label: category as string,
            href: path(`/experiences?category=${encodeURIComponent(category as string)}`)
          })
        ),
        ...experiences.slice(0, 6).map((experience) => ({
          label: experience.title,
          href: experience.href
        }))
      ]),
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
    { label: 'Our Tour Guides', href: path('/safari-guides') },
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
