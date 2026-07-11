export type AccommodationAvailability = 'available' | 'on_request' | 'limited';

export type PublicAccommodationMedia = {
  alt: string | null;
  id: string;
  url: string | null;
};

export type PublicAccommodationDestination = {
  id: string;
  label: string;
  slug: string;
};

export type PublicAccommodation = {
  availability: AccommodationAvailability | null;
  comfortLevel: string | null;
  country: string | null;
  destination: PublicAccommodationDestination | null;
  excerpt: string | null;
  href: string;
  id: string;
  imageAlt: string | null;
  imageUrl: string | null;
  locationLabel: string;
  name: string;
  pricePerNight: number | null;
  propertyType: string | null;
  region: string | null;
  slug: string;
};

export type PublicAccommodationDetail = PublicAccommodation & {
  amenities: string[];
  descriptionHtml: string | null;
  gallery: PublicAccommodationMedia[];
  mapQuery: string | null;
  seoDescription: string | null;
  seoTitle: string | null;
};

export type AccommodationListFilters = {
  comfortLevels?: string[];
  countries?: string[];
  destinationSlugs?: string[];
  locale: string;
  maxPrice?: number;
  minPrice?: number;
  propertyTypes?: string[];
  regions?: string[];
};
