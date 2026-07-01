import * as z from 'zod';

import { SEO_LIMITS } from '../seo/analyze';

const faqItemSchema = z.object({
  answer: z.string(),
  question: z.string()
});

/**
 * National park wizard form contract.
 *
 * Flat shape spanning the base `national_parks` row and its English
 * `national_park_translations` row. The service layer splits these back out when
 * persisting. Only name, country (and the auto-generated slug) are required —
 * everything else is optional so a draft can be saved early.
 *
 * Numeric park facts (size, year, lat/long) are kept as strings here to match the
 * text inputs; the service parses them to numbers (or null) on save.
 */
export const nationalParkFormSchema = z.object({
  // Translation (en)
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens only'),
  summary: z.string().max(280, 'Keep the summary under 280 characters'),
  description: z.string(),
  // Base
  country: z.string().min(1, 'Country is required'),
  region: z.string(),
  /** Optional parent destination id (e.g. the "Kenya" hub). */
  destinationId: z.string(),
  parkSizeKm2: z.string(),
  establishedYear: z.string(),
  latitude: z.string(),
  longitude: z.string(),
  bestTimeSummary: z.string(),
  /** Wildlife highlights list, stored as a jsonb array. */
  wildlife: z.array(z.string()),
  /** Activities offered (game drives, balloon safaris…), stored as jsonb array. */
  activities: z.array(z.string()),
  /** Traveler FAQs stored on the translation row as jsonb. */
  faqs: z.array(faqItemSchema),
  /** Ordered media_assets ids; the first is the cover image. */
  gallery: z.array(z.string()),
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

export type NationalParkFormValues = z.infer<typeof nationalParkFormSchema>;

/** Per-step validators consumed by `useFormStepper`. */
export const nationalParkStepSchemas = [
  nationalParkFormSchema.pick({ name: true, slug: true, country: true, region: true }),
  nationalParkFormSchema.pick({ gallery: true }),
  nationalParkFormSchema.pick({
    parkSizeKm2: true,
    establishedYear: true,
    latitude: true,
    longitude: true,
    bestTimeSummary: true,
    wildlife: true,
    activities: true,
    destinationId: true
  }),
  nationalParkFormSchema.pick({ summary: true, description: true, faqs: true }),
  nationalParkFormSchema.pick({
    seoTitle: true,
    seoDescription: true,
    focusKeyword: true,
    keywords: true
  }),
  z.object({})
];

export const nationalParkWizardSteps = [
  { title: 'Basics', description: 'Name, country, and the auto-generated URL slug.' },
  { title: 'Gallery', description: 'Choose the images shown on this park.' },
  { title: 'Facts & Wildlife', description: 'Size, season, wildlife, activities, and location.' },
  { title: 'Story', description: 'Summary, description, and traveler FAQs.' },
  { title: 'SEO', description: 'Search appearance, keywords, and readiness score.' },
  { title: 'Review', description: 'Confirm everything, then save or publish.' }
];

export const emptyNationalParkValues: NationalParkFormValues = {
  name: '',
  slug: '',
  summary: '',
  description: '',
  country: '',
  region: '',
  destinationId: '',
  parkSizeKm2: '',
  establishedYear: '',
  latitude: '',
  longitude: '',
  bestTimeSummary: '',
  wildlife: [],
  activities: [],
  faqs: [],
  gallery: [],
  seoTitle: '',
  seoDescription: '',
  focusKeyword: '',
  keywords: []
};
