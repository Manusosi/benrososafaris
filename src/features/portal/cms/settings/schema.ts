import { z } from 'zod';

import type { Tables } from '@/types/database.types';

/** Optional free-text that stores null when blank. */
const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable();

const optionalUrl = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable();

export const generalBrandingSchema = z.object({
  companyName: z.string().trim().min(1, 'Company name is required'),
  tagline: optionalText,
  logoUrl: optionalUrl,
  faviconUrl: optionalUrl,
  ogDefaultImageUrl: optionalUrl,
  themeColor: optionalText
});

export const contactSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  phonePrimary: z.string().trim().min(1, 'Primary phone is required'),
  phoneSecondary: optionalText,
  phoneOffice: optionalText,
  addressShort: optionalText,
  postalAddress: optionalText,
  katoAddress: optionalText,
  whatsappMessage: optionalText
});

export const socialSchema = z.object({
  facebook: optionalUrl,
  instagram: optionalUrl,
  twitter: optionalUrl,
  linkedin: optionalUrl,
  youtube: optionalUrl,
  tiktok: optionalUrl
});

export const notificationsSchema = z.object({
  notifyEmails: z.array(z.string().trim().email('Enter valid emails')),
  enquiryEmailEnabled: z.boolean(),
  enquiryWhatsappEnabled: z.boolean(),
  whatsappNotifyPhone: optionalText
});

export const seoAnalyticsSchema = z.object({
  seoTitle: optionalText,
  seoDescription: optionalText,
  gaMeasurementId: optionalText,
  gtmId: optionalText,
  metaPixelId: optionalText,
  googleSiteVerification: optionalText,
  bingSiteVerification: optionalText
});

export type GeneralBrandingValues = z.input<typeof generalBrandingSchema>;
export type ContactValues = z.input<typeof contactSchema>;
export type SocialValues = z.input<typeof socialSchema>;
export type NotificationsValues = z.input<typeof notificationsSchema>;
export type SeoAnalyticsValues = z.input<typeof seoAnalyticsSchema>;

/** All tabs combined, used to seed the client form from the DB row. */
export type SettingsFormValues = {
  general: GeneralBrandingValues;
  contact: ContactValues;
  social: SocialValues;
  notifications: NotificationsValues;
  seo: SeoAnalyticsValues;
};

function str(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/** Build the form's initial values from a site_settings row (or defaults). */
export function settingsFromRow(row: Tables<'site_settings'> | null): SettingsFormValues {
  const social = (row?.social_links as Record<string, string> | null) ?? {};
  const analytics = (row?.analytics as Record<string, string> | null) ?? {};
  const seo = (row?.seo_defaults as Record<string, string> | null) ?? {};

  return {
    general: {
      companyName: row?.company_name ?? 'Benroso Safaris Ltd',
      tagline: row?.tagline ?? '',
      logoUrl: row?.logo_url ?? '',
      faviconUrl: row?.favicon_url ?? '',
      ogDefaultImageUrl: row?.og_default_image_url ?? '',
      themeColor: row?.theme_color ?? ''
    },
    contact: {
      email: row?.email ?? '',
      phonePrimary: row?.phone_primary ?? '',
      phoneSecondary: row?.phone_secondary ?? '',
      phoneOffice: row?.phone_office ?? '',
      addressShort: row?.address_short ?? '',
      postalAddress: row?.postal_address ?? '',
      katoAddress: row?.kato_address ?? '',
      whatsappMessage: row?.whatsapp_message ?? ''
    },
    social: {
      facebook: str(social.facebook),
      instagram: str(social.instagram),
      twitter: str(social.twitter),
      linkedin: str(social.linkedin),
      youtube: str(social.youtube),
      tiktok: str(social.tiktok)
    },
    notifications: {
      notifyEmails: Array.isArray(row?.notify_emails) ? row!.notify_emails : [],
      enquiryEmailEnabled: row?.enquiry_email_enabled ?? true,
      enquiryWhatsappEnabled: row?.enquiry_whatsapp_enabled ?? false,
      whatsappNotifyPhone: row?.whatsapp_notify_phone ?? ''
    },
    seo: {
      seoTitle: str(seo.title),
      seoDescription: str(seo.description),
      gaMeasurementId: str(analytics.gaMeasurementId),
      gtmId: str(analytics.gtmId),
      metaPixelId: str(analytics.metaPixelId),
      googleSiteVerification: str(analytics.googleSiteVerification),
      bingSiteVerification: str(analytics.bingSiteVerification)
    }
  };
}
