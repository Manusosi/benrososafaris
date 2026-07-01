/**
 * analyze.ts — In-house SEO scoring engine (our own "Yoast / RankMath").
 *
 * A single pure function, `analyzeSeo`, turns the editable fields of any page
 * (title, meta description, slug, focus keyword, body copy, images) into a
 * 0–100 readiness score plus a checklist of pass/warn/fail signals.
 *
 * It is intentionally framework-agnostic (no React, no DB) so it can be reused
 * everywhere — destinations, parks, tours, articles, accommodations — and even
 * run on the server when generating sitemaps or pre-publish reports.
 */

export type SeoCheckStatus = 'good' | 'warn' | 'bad';

export interface SeoCheck {
  id: string;
  label: string;
  status: SeoCheckStatus;
  message: string;
}

export interface SeoAnalysisInput {
  /** The SEO title (usually defaults to the page title). */
  title: string;
  metaDescription: string;
  slug: string;
  /** Primary phrase the page should rank for. */
  focusKeyword: string;
  /** Up to 5 supporting phrases. */
  keywords?: string[];
  /** Plain-text body copy (summary + description combined). */
  body: string;
  /** Total number of images on the page (for alt-text coverage). */
  imageCount?: number;
  /** How many of those images already have alt text. */
  imagesWithAlt?: number;
  /** Internal links in the body (href starting with `/`). Omit to skip the check. */
  internalLinkCount?: number;
  /** Outbound links in the body (absolute http(s) URLs). Omit to skip the check. */
  outboundLinkCount?: number;
}

/** Counts internal (`/…`) vs outbound (`http(s)://…`) links in an HTML string. */
export function countLinks(html: string): { internal: number; outbound: number } {
  let internal = 0;
  let outbound = 0;
  const regex = /href\s*=\s*["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const href = match[1].trim();
    if (!href || href.startsWith('#')) continue;
    if (/^https?:\/\//i.test(href)) outbound += 1;
    else if (href.startsWith('/')) internal += 1;
    // mailto:, tel:, and anchors are ignored.
  }
  return { internal, outbound };
}

export interface SeoStats {
  titleLength: number;
  metaLength: number;
  wordCount: number;
  /** Focus-keyword density as a percentage of total words. */
  keywordDensity: number;
}

export type SeoRating = 'poor' | 'ok' | 'good';

export interface SeoAnalysis {
  score: number;
  rating: SeoRating;
  checks: SeoCheck[];
  stats: SeoStats;
}

/** Industry-standard length and density targets, exported for UI counters. */
export const SEO_LIMITS = {
  titleMin: 30,
  titleMax: 60,
  /** Hard cap used by the meta-description input. */
  metaMax: 160,
  metaMin: 120,
  minWords: 250,
  densityMin: 0.4,
  densityMax: 2.5,
  maxKeywords: 5
} as const;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function wordCount(value: string): number {
  const trimmed = value.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/** Counts non-overlapping occurrences of `phrase` within `haystack`. */
function countOccurrences(haystack: string, phrase: string): number {
  if (!phrase) return 0;
  let count = 0;
  let index = haystack.indexOf(phrase);
  while (index !== -1) {
    count += 1;
    index = haystack.indexOf(phrase, index + phrase.length);
  }
  return count;
}

/**
 * Each check contributes its weight to the score. `good` earns the full weight,
 * `warn` earns half, `bad` earns nothing. The final score is the percentage of
 * the maximum achievable weight.
 */
const WEIGHTS: Record<string, number> = {
  'focus-keyword': 2,
  'keyword-in-title': 2,
  'title-length': 2,
  'meta-description': 2,
  'keyword-in-meta': 1.5,
  'keyword-in-slug': 1.5,
  'keyword-in-body': 1.5,
  'keyword-density': 1.5,
  'content-length': 1.5,
  'slug-clean': 1,
  'extra-keywords': 1,
  'image-alt': 1,
  'internal-links': 1,
  'outbound-links': 1
};

function ratingFor(score: number): SeoRating {
  if (score >= 80) return 'good';
  if (score >= 50) return 'ok';
  return 'poor';
}

export function analyzeSeo(input: SeoAnalysisInput): SeoAnalysis {
  const title = input.title.trim();
  const meta = input.metaDescription.trim();
  const slug = input.slug.trim();
  const focus = normalize(input.focusKeyword);
  const keywords = (input.keywords ?? []).map((k) => k.trim()).filter(Boolean);
  const bodyText = normalize(input.body);
  const titleNorm = normalize(title);
  const metaNorm = normalize(meta);
  const slugWords = normalize(slug.replace(/-/g, ' '));

  const words = wordCount(input.body);
  const focusOccurrences = countOccurrences(bodyText, focus);
  const density = words > 0 && focus ? (focusOccurrences / words) * 100 : 0;
  const intro = bodyText.split(' ').slice(0, 120).join(' ');

  const hasFocus = focus.length > 0;
  const checks: SeoCheck[] = [];

  checks.push(
    hasFocus
      ? {
          id: 'focus-keyword',
          label: 'Focus keyword',
          status: 'good',
          message: `Focus keyword set to “${input.focusKeyword.trim()}”.`
        }
      : {
          id: 'focus-keyword',
          label: 'Focus keyword',
          status: 'bad',
          message: 'Set a focus keyword to score the rest of the page.'
        }
  );

  // Title length
  if (!title) {
    checks.push({
      id: 'title-length',
      label: 'SEO title',
      status: 'bad',
      message: 'Add an SEO title.'
    });
  } else if (title.length < SEO_LIMITS.titleMin) {
    checks.push({
      id: 'title-length',
      label: 'SEO title',
      status: 'warn',
      message: `Title is short (${title.length} chars). Aim for ${SEO_LIMITS.titleMin}–${SEO_LIMITS.titleMax}.`
    });
  } else if (title.length > SEO_LIMITS.titleMax) {
    checks.push({
      id: 'title-length',
      label: 'SEO title',
      status: 'warn',
      message: `Title may be truncated (${title.length} chars). Keep it under ${SEO_LIMITS.titleMax}.`
    });
  } else {
    checks.push({
      id: 'title-length',
      label: 'SEO title',
      status: 'good',
      message: `Title length is ideal (${title.length} chars).`
    });
  }

  // Keyword in title
  checks.push(
    !hasFocus
      ? {
          id: 'keyword-in-title',
          label: 'Keyword in title',
          status: 'bad',
          message: 'Set a focus keyword first.'
        }
      : titleNorm.includes(focus)
        ? {
            id: 'keyword-in-title',
            label: 'Keyword in title',
            status: 'good',
            message: 'Focus keyword appears in the SEO title.'
          }
        : {
            id: 'keyword-in-title',
            label: 'Keyword in title',
            status: 'warn',
            message: 'Add the focus keyword to the SEO title.'
          }
  );

  // Meta description
  if (!meta) {
    checks.push({
      id: 'meta-description',
      label: 'Meta description',
      status: 'bad',
      message: 'Add a meta description.'
    });
  } else if (meta.length < SEO_LIMITS.metaMin) {
    checks.push({
      id: 'meta-description',
      label: 'Meta description',
      status: 'warn',
      message: `Description is short (${meta.length} chars). Aim for ${SEO_LIMITS.metaMin}–${SEO_LIMITS.metaMax}.`
    });
  } else if (meta.length > SEO_LIMITS.metaMax) {
    checks.push({
      id: 'meta-description',
      label: 'Meta description',
      status: 'warn',
      message: `Description is too long (${meta.length} chars). Keep it under ${SEO_LIMITS.metaMax}.`
    });
  } else {
    checks.push({
      id: 'meta-description',
      label: 'Meta description',
      status: 'good',
      message: `Description length is ideal (${meta.length} chars).`
    });
  }

  // Keyword in meta
  checks.push(
    !hasFocus
      ? {
          id: 'keyword-in-meta',
          label: 'Keyword in description',
          status: 'bad',
          message: 'Set a focus keyword first.'
        }
      : metaNorm.includes(focus)
        ? {
            id: 'keyword-in-meta',
            label: 'Keyword in description',
            status: 'good',
            message: 'Focus keyword appears in the meta description.'
          }
        : {
            id: 'keyword-in-meta',
            label: 'Keyword in description',
            status: 'warn',
            message: 'Mention the focus keyword in the meta description.'
          }
  );

  // Keyword in slug
  checks.push(
    !hasFocus
      ? {
          id: 'keyword-in-slug',
          label: 'Keyword in URL',
          status: 'bad',
          message: 'Set a focus keyword first.'
        }
      : slugWords.includes(focus)
        ? {
            id: 'keyword-in-slug',
            label: 'Keyword in URL',
            status: 'good',
            message: 'Focus keyword appears in the URL slug.'
          }
        : {
            id: 'keyword-in-slug',
            label: 'Keyword in URL',
            status: 'warn',
            message: 'Include the focus keyword in the URL slug.'
          }
  );

  // Keyword in body intro
  checks.push(
    !hasFocus
      ? {
          id: 'keyword-in-body',
          label: 'Keyword in intro',
          status: 'bad',
          message: 'Set a focus keyword first.'
        }
      : intro.includes(focus)
        ? {
            id: 'keyword-in-body',
            label: 'Keyword in intro',
            status: 'good',
            message: 'Focus keyword appears early in the copy.'
          }
        : {
            id: 'keyword-in-body',
            label: 'Keyword in intro',
            status: 'warn',
            message: 'Use the focus keyword in the first paragraph.'
          }
  );

  // Keyword density
  if (!hasFocus) {
    checks.push({
      id: 'keyword-density',
      label: 'Keyword density',
      status: 'bad',
      message: 'Set a focus keyword first.'
    });
  } else if (focusOccurrences === 0) {
    checks.push({
      id: 'keyword-density',
      label: 'Keyword density',
      status: 'warn',
      message: 'Focus keyword does not appear in the body copy.'
    });
  } else if (density < SEO_LIMITS.densityMin) {
    checks.push({
      id: 'keyword-density',
      label: 'Keyword density',
      status: 'warn',
      message: `Density is low (${density.toFixed(1)}%). Aim for ${SEO_LIMITS.densityMin}–${SEO_LIMITS.densityMax}%.`
    });
  } else if (density > SEO_LIMITS.densityMax) {
    checks.push({
      id: 'keyword-density',
      label: 'Keyword density',
      status: 'warn',
      message: `Density is high (${density.toFixed(1)}%) — avoid keyword stuffing.`
    });
  } else {
    checks.push({
      id: 'keyword-density',
      label: 'Keyword density',
      status: 'good',
      message: `Density is healthy (${density.toFixed(1)}%).`
    });
  }

  // Content length
  if (words >= SEO_LIMITS.minWords) {
    checks.push({
      id: 'content-length',
      label: 'Content length',
      status: 'good',
      message: `${words} words of copy.`
    });
  } else if (words >= SEO_LIMITS.minWords / 2) {
    checks.push({
      id: 'content-length',
      label: 'Content length',
      status: 'warn',
      message: `${words} words. Aim for at least ${SEO_LIMITS.minWords}.`
    });
  } else {
    checks.push({
      id: 'content-length',
      label: 'Content length',
      status: 'bad',
      message: `Only ${words} words. Add more detail (target ${SEO_LIMITS.minWords}+).`
    });
  }

  // Slug cleanliness
  checks.push(
    !slug
      ? { id: 'slug-clean', label: 'URL slug', status: 'bad', message: 'Add a URL slug.' }
      : SLUG_PATTERN.test(slug)
        ? {
            id: 'slug-clean',
            label: 'URL slug',
            status: 'good',
            message: 'Slug is clean and readable.'
          }
        : {
            id: 'slug-clean',
            label: 'URL slug',
            status: 'warn',
            message: 'Use lowercase words separated by hyphens.'
          }
  );

  // Supporting keywords
  checks.push(
    keywords.length > 0
      ? {
          id: 'extra-keywords',
          label: 'Supporting keywords',
          status: 'good',
          message: `${keywords.length} supporting keyword${keywords.length === 1 ? '' : 's'} added.`
        }
      : {
          id: 'extra-keywords',
          label: 'Supporting keywords',
          status: 'warn',
          message: 'Add a few supporting keywords (up to 5).'
        }
  );

  // Image alt coverage
  const imageCount = input.imageCount ?? 0;
  const imagesWithAlt = input.imagesWithAlt ?? 0;
  if (imageCount === 0) {
    checks.push({
      id: 'image-alt',
      label: 'Image alt text',
      status: 'warn',
      message: 'Add at least one image with descriptive alt text.'
    });
  } else if (imagesWithAlt >= imageCount) {
    checks.push({
      id: 'image-alt',
      label: 'Image alt text',
      status: 'good',
      message: 'All images have alt text.'
    });
  } else {
    checks.push({
      id: 'image-alt',
      label: 'Image alt text',
      status: 'warn',
      message: `${imageCount - imagesWithAlt} of ${imageCount} images are missing alt text.`
    });
  }

  // Internal links
  if (input.internalLinkCount !== undefined) {
    const count = input.internalLinkCount;
    checks.push(
      count > 0
        ? {
            id: 'internal-links',
            label: 'Internal links',
            status: 'good',
            message: `${count} internal link${count === 1 ? '' : 's'} to other pages.`
          }
        : {
            id: 'internal-links',
            label: 'Internal links',
            status: 'warn',
            message: 'Add at least one internal link to related content.'
          }
    );
  }

  // Outbound links
  if (input.outboundLinkCount !== undefined) {
    const count = input.outboundLinkCount;
    checks.push(
      count > 0
        ? {
            id: 'outbound-links',
            label: 'Outbound links',
            status: 'good',
            message: `${count} outbound link${count === 1 ? '' : 's'} to external sources.`
          }
        : {
            id: 'outbound-links',
            label: 'Outbound links',
            status: 'warn',
            message: 'Link out to a credible external source.'
          }
    );
  }

  // Weighted score
  let earned = 0;
  let possible = 0;
  for (const check of checks) {
    const weight = WEIGHTS[check.id] ?? 1;
    possible += weight;
    earned += check.status === 'good' ? weight : check.status === 'warn' ? weight * 0.5 : 0;
  }
  const score = possible > 0 ? Math.round((earned / possible) * 100) : 0;

  return {
    score,
    rating: ratingFor(score),
    checks,
    stats: {
      titleLength: title.length,
      metaLength: meta.length,
      wordCount: words,
      keywordDensity: Number(density.toFixed(1))
    }
  };
}

/**
 * Splits a raw keyword input into clean phrases on commas (the comma-detection
 * behaviour the wizard relies on). Trims, drops empties, de-duplicates
 * case-insensitively, and preserves order.
 */
export function parseKeywords(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(',')) {
    const value = part.trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}
