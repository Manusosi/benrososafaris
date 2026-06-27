/** WordPress-style status views for the accommodations list. */
export type AccommodationListStatus = 'all' | 'published' | 'draft' | 'trash';

export type AccommodationListView = 'grid' | 'table';

export interface AccommodationListItem {
  id: string;
  name: string;
  slug: string;
  /** `published` | `draft` | `trash`. */
  status: string;
  country: string | null;
  region: string | null;
  propertyType: string | null;
  availability: string | null;
  pricePerNight: number | null;
  imageUrl: string | null;
  imageAlt: string | null;
  publishedAt: string | null;
  updatedAt: string;
  trashed: boolean;
}

export interface AccommodationListParams {
  status: AccommodationListStatus;
  search: string;
  country: string;
  propertyType: string;
  availability: string;
  page: number;
}

export interface AccommodationStatusCounts {
  all: number;
  published: number;
  draft: number;
  trash: number;
}

export interface AccommodationListResult {
  items: AccommodationListItem[];
  total: number;
  page: number;
  pageSize: number;
  counts: AccommodationStatusCounts;
  countries: string[];
  propertyTypes: string[];
}

export const ACCOMMODATIONS_PAGE_SIZE = 20;
