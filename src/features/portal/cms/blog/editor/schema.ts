import * as z from 'zod';

import { SEO_LIMITS } from '../../seo/analyze';

/**
 * Article editor form contract.
 *
 * Flat shape spanning the base `blog_posts` row, its English
 * `blog_translations` row, and the category/tag join tables. The service layer
 * splits these back out when persisting. Only title (and the auto-generated
 * slug) are required — everything else is optional so a draft can be saved
 * early.
 */
export const articleFormSchema = z.object({
  // Translation (en)
  title: z.string().min(2, 'Title must be at least 2 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens only'),
  excerpt: z.string().max(320, 'Keep the excerpt under 320 characters'),
  /** Rich-text body as HTML. */
  content: z.string(),
  // Base
  featured: z.boolean(),
  /** media_assets id used as the featured / OG image (empty when none). */
  featuredImage: z.string(),
  featuredImageCaption: z.string(),
  /** All assigned category ids. */
  categoryIds: z.array(z.string()),
  /** The primary category id (must be one of `categoryIds`, or empty). */
  primaryCategoryId: z.string(),
  /** Assigned tag ids. */
  tagIds: z.array(z.string()),
  // SEO
  seoTitle: z.string().max(70, 'SEO title should be under 70 characters'),
  seoDescription: z
    .string()
    .max(SEO_LIMITS.metaMax, `SEO description should be under ${SEO_LIMITS.metaMax} characters`),
  focusKeyword: z.string(),
  keywords: z
    .array(z.string())
    .max(SEO_LIMITS.maxKeywords, `Up to ${SEO_LIMITS.maxKeywords} keywords`)
});

export type ArticleFormValues = z.infer<typeof articleFormSchema>;

/** Minimal fields required to save a draft. */
export const articleDraftSchema = articleFormSchema.pick({ title: true, slug: true });

export const emptyArticleValues: ArticleFormValues = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  featured: false,
  featuredImage: '',
  featuredImageCaption: '',
  categoryIds: [],
  primaryCategoryId: '',
  tagIds: [],
  seoTitle: '',
  seoDescription: '',
  focusKeyword: '',
  keywords: []
};
