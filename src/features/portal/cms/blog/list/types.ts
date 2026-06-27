/** WordPress-style status views for the articles list table. */
export type ArticleListStatus = 'all' | 'published' | 'draft' | 'trash';

export interface ArticleListItem {
  id: string;
  title: string;
  slug: string;
  /** `published` | `draft` | `trash`. */
  status: string;
  /** Primary/main category name (null when none assigned). */
  category: string | null;
  /** Primary category id (used by Quick Edit). */
  categoryId: string | null;
  /** Focus / main keyword. */
  focusKeyword: string | null;
  /** Computed 0–100 SEO readiness score (via `analyzeSeo`). */
  seoScore: number;
  /** Publish timestamp from the English translation (null when never published). */
  publishedAt: string | null;
  updatedAt: string;
  trashed: boolean;
}

export interface ArticleCategoryOption {
  id: string;
  name: string;
}

export interface ArticleListParams {
  status: ArticleListStatus;
  search: string;
  /** Primary category id filter; empty string means "all categories". */
  category: string;
  /** Month filter as `YYYY-MM`; empty string means "all dates". */
  month: string;
  /** 1-based page index. */
  page: number;
}

export interface ArticleStatusCounts {
  all: number;
  published: number;
  draft: number;
  trash: number;
}

export interface ArticleListResult {
  items: ArticleListItem[];
  /** Total rows matching the active filters (drives pagination). */
  total: number;
  page: number;
  pageSize: number;
  counts: ArticleStatusCounts;
  /** Categories for the filter dropdown + Quick Edit select. */
  categories: ArticleCategoryOption[];
  /** Distinct publish months for the date dropdown. */
  months: Array<{ value: string; label: string }>;
}

/** Fields editable from the inline Quick Edit row. */
export interface ArticleQuickEditInput {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft';
  /** Primary category id, or empty to clear it. */
  categoryId: string;
  focusKeyword: string;
  /** ISO timestamp for the publish date/time, or empty to leave unset. */
  publishedAt: string;
}

export const ARTICLES_PAGE_SIZE = 20;
