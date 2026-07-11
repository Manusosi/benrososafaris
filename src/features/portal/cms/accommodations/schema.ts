import * as z from 'zod';

import { SEO_LIMITS } from '../seo/analyze';

const availabilitySchema = z.enum(['available', 'on_request', 'limited']);

/**
 * Accommodation wizard form contract.
 *
 * Flat shape spanning the base `accommodations` row and its English
 * `accommodation_translations` row.
 */
export const accommodationFormSchema = z.object({
  // Translation (en)
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens only'),
  summary: z.string().max(280, 'Keep the summary under 280 characters'),
  description: z.string(),
  // Base
  destinationId: z.string().min(1, 'Destination is required'),
  country: z.string().min(1, 'Country is required'),
  region: z.string().min(1, 'Location is required'),
  mapQuery: z.string(),
  propertyType: z.string().min(1, 'Property type is required'),
  comfortLevel: z.string(),
  availability: availabilitySchema,
  pricePerNight: z.string(),
  amenities: z.array(z.string()),
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

export type AccommodationFormValues = z.infer<typeof accommodationFormSchema>;

export const accommodationStepSchemas = [
  accommodationFormSchema.pick({ name: true, slug: true, propertyType: true, summary: true }),
  accommodationFormSchema.pick({
    destinationId: true,
    country: true,
    region: true,
    mapQuery: true
  }),
  accommodationFormSchema.pick({ gallery: true }),
  accommodationFormSchema.pick({ amenities: true, description: true }),
  accommodationFormSchema.pick({
    comfortLevel: true,
    availability: true,
    pricePerNight: true
  }),
  accommodationFormSchema.pick({
    seoTitle: true,
    seoDescription: true,
    focusKeyword: true,
    keywords: true
  }),
  z.object({})
];

export const accommodationWizardSteps = [
  { title: 'Basics', description: 'Name, property type, and the auto-generated URL slug.' },
  {
    title: 'Location',
    description: 'Country first, then the matching destination hub, location label, and map pin.'
  },
  { title: 'Gallery', description: 'Choose the images shown on this property page.' },
  { title: 'Amenities', description: 'About text and the facilities guests can expect.' },
  { title: 'Pricing', description: 'Nightly rate, comfort level, and availability status.' },
  { title: 'SEO', description: 'Search appearance, keywords, and readiness score.' },
  { title: 'Review', description: 'Pre-publish checks, then save or publish.' }
];

export const emptyAccommodationValues: AccommodationFormValues = {
  name: '',
  slug: '',
  summary: '',
  description: '',
  destinationId: '',
  country: '',
  region: '',
  mapQuery: '',
  propertyType: '',
  comfortLevel: '',
  availability: 'on_request',
  pricePerNight: '',
  amenities: [],
  gallery: [],
  seoTitle: '',
  seoDescription: '',
  focusKeyword: '',
  keywords: []
};
