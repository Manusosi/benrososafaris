import * as z from 'zod';

import { SEO_LIMITS } from '../seo/analyze';

const faqItemSchema = z.object({
  answer: z.string(),
  question: z.string()
});

/**
 * Destination wizard form contract.
 *
 * Flat shape spanning the base `destinations` row and its English
 * `destination_translations` row. The service layer splits these back out when
 * persisting. Only name, country (and the auto-generated slug) are required —
 * everything else is optional so a draft can be saved early.
 */
// Scalar fields are all-required strings (empty allowed for optional ones)
// rather than `.optional().default()`. This keeps the inferred type a flat
// record that matches the form's `defaultValues`, so the schema can be used
// directly as a TanStack Form validator (mirrors the multi-step convention).
export const destinationFormSchema = z.object({
  // Translation (en)
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens only'),
  summary: z.string().max(400, 'Keep the summary under 400 characters'),
  description: z.string(),
  // Base
  country: z.string().min(1, 'Country is required'),
  region: z.string(),
  bestTimeSummary: z.string(),
  /** Wildlife highlights list, stored directly as a jsonb array. */
  wildlife: z.array(z.string()),
  /** Traveler FAQs stored on the translation row as jsonb. */
  faqs: z.array(faqItemSchema),
  /** Ordered media_assets ids; the first is the cover image. */
  gallery: z.array(z.string()),
  // SEO
  seoTitle: z
    .string()
    .max(SEO_LIMITS.titleMax, `SEO title should be under ${SEO_LIMITS.titleMax} characters`),
  seoDescription: z
    .string()
    .max(SEO_LIMITS.metaMax, `SEO description should be under ${SEO_LIMITS.metaMax} characters`),
  focusKeyword: z.string(),
  keywords: z
    .array(z.string())
    .max(SEO_LIMITS.maxKeywords, `Up to ${SEO_LIMITS.maxKeywords} keywords`)
});

export type DestinationFormValues = z.infer<typeof destinationFormSchema>;

/** Per-step validators consumed by `useFormStepper`. */
export const destinationStepSchemas = [
  destinationFormSchema.pick({ name: true, slug: true, country: true, region: true }),
  destinationFormSchema.pick({ gallery: true }),
  destinationFormSchema.pick({
    summary: true,
    description: true,
    bestTimeSummary: true,
    wildlife: true,
    faqs: true
  }),
  destinationFormSchema.pick({
    seoTitle: true,
    seoDescription: true,
    focusKeyword: true,
    keywords: true
  }),
  z.object({})
];

export const destinationWizardSteps = [
  { title: 'Basics', description: 'Name, country, and the auto-generated URL slug.' },
  { title: 'Gallery', description: 'Choose the images shown on this destination.' },
  { title: 'Story', description: 'Summary, description, travel notes, and FAQs.' },
  { title: 'SEO', description: 'Search appearance, keywords, and readiness score.' },
  { title: 'Review', description: 'Confirm everything, then save or publish.' }
];

export const emptyDestinationValues: DestinationFormValues = {
  name: '',
  slug: '',
  summary: '',
  description: '',
  country: '',
  region: '',
  bestTimeSummary: '',
  wildlife: [],
  faqs: [],
  gallery: [],
  seoTitle: '',
  seoDescription: '',
  focusKeyword: '',
  keywords: []
};
