import * as z from 'zod';

import { SEO_LIMITS } from '../seo/analyze';

export const packageFormSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens only'),
  excerpt: z.string().max(280, 'Keep the excerpt under 280 characters'),
  content: z.string(),
  tourId: z.string().min(1, 'Select the trip route this package uses'),
  packageGroup: z.string(),
  comfortTier: z.enum(['budget', 'mid_range', 'luxury']),
  ogImageId: z.string(),
  seoTitle: z.string().max(70, 'SEO title should be under 70 characters'),
  seoDescription: z
    .string()
    .max(SEO_LIMITS.metaMax, `SEO description should be under ${SEO_LIMITS.metaMax} characters`)
});

export type PackageFormValues = z.infer<typeof packageFormSchema>;

export const packageStepSchemas = [
  packageFormSchema.pick({ title: true, slug: true, tourId: true, comfortTier: true }),
  packageFormSchema.pick({ packageGroup: true, excerpt: true, content: true, ogImageId: true }),
  packageFormSchema.pick({ seoTitle: true, seoDescription: true }),
  z.object({})
];

export const packageWizardSteps = [
  { title: 'Route & Tier', description: 'Pick the trip itinerary and the package comfort tier.' },
  {
    title: 'Package Copy',
    description: 'Campaign label, listing copy, page intro, and cover image.'
  },
  { title: 'SEO', description: 'Search title and description for this package variant.' },
  { title: 'Review', description: 'Confirm this package variant before publishing.' }
];

export const emptyPackageValues: PackageFormValues = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  tourId: '',
  packageGroup: '',
  comfortTier: 'mid_range',
  ogImageId: '',
  seoTitle: '',
  seoDescription: ''
};
