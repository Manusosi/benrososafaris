export type PublicNavItem = {
  href: string;
  items?: PublicNavItem[];
  label: string;
  variant?: 'dynamic' | 'mega' | 'simple';
};

export type PublicFooterColumn = {
  links: PublicNavItem[];
  title: string;
};

export type HeroSlide = {
  alt: string | null;
  heading: string | null;
  isActive: boolean;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  posterUrl: string | null;
  sortOrder: number;
  subheading: string | null;
};

export type PublicSiteSettings = {
  addressShort: string;
  companyName: string;
  description: string;
  email: string;
  phoneOffice: string;
  phonePrimary: string;
  phoneSecondary: string;
  postalAddress: string;
  socialLinks: Record<string, string>;
  whatsappMessage: string;
};

export type PublicDestination = {
  country: string | null;
  href: string;
  id: string;
  imageAlt: string | null;
  imageUrl: string | null;
  name: string;
  region: string | null;
  slug: string;
  summary: string | null;
};

export type PublicTour = {
  days: number | null;
  excerpt: string | null;
  href: string;
  id: string;
  imageAlt: string | null;
  imageUrl: string | null;
  nights: number | null;
  priceFrom: number | null;
  slug: string;
  title: string;
};

export type { PublicExperience } from '@/features/experiences/public/types';

export type PublicBlogPost = {
  category: string | null;
  excerpt: string | null;
  href: string;
  id: string;
  imageAlt: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
  slug: string;
  title: string;
};
