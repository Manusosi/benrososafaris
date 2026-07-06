/** A single asset in the media library (a row of `media_assets`). */
export interface MediaAsset {
  id: string;
  bucket: string;
  path: string;
  url: string | null;
  /** Editable display name (WordPress-style title). */
  title: string | null;
  alt: string | null;
  caption: string | null;
  createdAt: string;
}

export interface MediaListParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface MediaListResult {
  items: MediaAsset[];
  total: number;
}

export const MEDIA_BUCKET = 'media';
export const MEDIA_PAGE_SIZE = 100;
