import * as z from 'zod';

import { SEO_LIMITS } from '../seo/analyze';

const faqItemSchema = z.object({
  answer: z.string(),
  question: z.string()
});

const itineraryDaySchema = z.object({
  day: z.number(),
  title: z.string(),
  description: z.string()
});

export type ItineraryDay = z.infer<typeof itineraryDaySchema>;

const pricingCellSchema = z.object({
  groupBand: z.string(),
  price: z.string()
});

const pricingSeasonSchema = z.object({
  label: z.string(),
  dateStart: z.string(),
  dateEnd: z.string(),
  cells: z.array(pricingCellSchema)
});

const pricingTierSchema = z.object({
  tier: z.enum(['budget', 'mid_range', 'luxury']),
  label: z.string(),
  blurb: z.string(),
  notes: z.string(),
  currency: z.string(),
  seasons: z.array(pricingSeasonSchema)
});

export type PricingCell = z.infer<typeof pricingCellSchema>;
export type PricingSeason = z.infer<typeof pricingSeasonSchema>;
export type PricingTier = z.infer<typeof pricingTierSchema>;

/**
 * Tour wizard form contract.
 *
 * Spans the base `tours` row, its English `tour_translations` row, and the
 * many-to-many relations (`tour_national_parks`, `tour_destinations`, …). The
 * service splits these back out when persisting. Numeric facts (days, nights,
 * price) are strings here to match the inputs; the service parses them.
 */
export const tourFormSchema = z.object({
  // Translation (en)
  title: z.string().min(2, 'Title must be at least 2 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens only'),
  excerpt: z.string().max(280, 'Keep the excerpt under 280 characters'),
  overview: z.string(),
  importantNotice: z.string(),
  faqs: z.array(faqItemSchema),
  // Base
  days: z.string(),
  nights: z.string(),
  priceFrom: z.string(),
  startLocation: z.string(),
  endLocation: z.string(),
  itineraryDays: z.array(itineraryDaySchema),
  inclusions: z.array(z.string()),
  exclusions: z.array(z.string()),
  pricingTiers: z.array(pricingTierSchema),
  gallery: z.array(z.string()),
  // Relations
  parkIds: z.array(z.string()),
  destinationIds: z.array(z.string()),
  experienceIds: z.array(z.string()),
  accommodationIds: z.array(z.string()),
  fleetIds: z.array(z.string()),
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

export type TourFormValues = z.infer<typeof tourFormSchema>;

/** Per-step validators consumed by `useFormStepper`. */
export const tourStepSchemas = [
  tourFormSchema.pick({
    title: true,
    slug: true,
    excerpt: true,
    days: true,
    nights: true,
    priceFrom: true,
    startLocation: true,
    endLocation: true
  }),
  tourFormSchema.pick({ itineraryDays: true }),
  tourFormSchema.pick({
    parkIds: true,
    destinationIds: true,
    experienceIds: true,
    accommodationIds: true,
    fleetIds: true,
    inclusions: true,
    exclusions: true
  }),
  tourFormSchema.pick({ gallery: true }),
  tourFormSchema.pick({ overview: true, importantNotice: true, faqs: true }),
  tourFormSchema.pick({ pricingTiers: true }),
  tourFormSchema.pick({
    seoTitle: true,
    seoDescription: true,
    focusKeyword: true,
    keywords: true
  }),
  z.object({})
];

export const tourWizardSteps = [
  { title: 'Basics', description: 'Title, duration, price, and start / end points.' },
  { title: 'Itinerary', description: 'Day-by-day route for this safari.' },
  {
    title: 'Parks & Inclusions',
    description: 'National parks, linked content, and what’s included.'
  },
  { title: 'Gallery', description: 'Choose the images shown on this tour.' },
  { title: 'Story', description: 'Overview, notices, and traveler FAQs.' },
  { title: 'Pricing', description: 'Comfort tiers, seasons, and group-size price bands.' },
  { title: 'SEO', description: 'Search appearance, keywords, and readiness score.' },
  { title: 'Review', description: 'Confirm everything, then save or publish.' }
];

export const emptyTourValues: TourFormValues = {
  title: '',
  slug: '',
  excerpt: '',
  overview: '',
  importantNotice: '',
  faqs: [],
  days: '',
  nights: '',
  priceFrom: '',
  startLocation: '',
  endLocation: '',
  itineraryDays: [],
  inclusions: [],
  exclusions: [],
  pricingTiers: [],
  gallery: [],
  parkIds: [],
  destinationIds: [],
  experienceIds: [],
  accommodationIds: [],
  fleetIds: [],
  seoTitle: '',
  seoDescription: '',
  focusKeyword: '',
  keywords: []
};
