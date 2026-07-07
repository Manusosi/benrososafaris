'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

import { requireSuperAdmin } from '@/lib/auth/portal';
import { createClient } from '@/lib/supabase/server';
import type { TablesUpdate } from '@/types/database.types';
import {
  contactSchema,
  generalBrandingSchema,
  notificationsSchema,
  seoAnalyticsSchema,
  socialSchema,
  type ContactValues,
  type GeneralBrandingValues,
  type NotificationsValues,
  type SeoAnalyticsValues,
  type SocialValues
} from './schema';

type SiteSettingsUpdate = TablesUpdate<'site_settings'>;

/** Drop null/empty entries so the stored JSON stays tidy. */
function compact(record: Record<string, string | null>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value != null && value.length > 0)
  ) as Record<string, string>;
}

async function persist(patch: SiteSettingsUpdate): Promise<void> {
  await requireSuperAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from('site_settings')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('singleton_key', 'default');

  if (error) {
    throw new Error(error.message);
  }

  // Settings feed the public layout, footer, and metadata across every route.
  revalidateTag('site-settings', 'max');
  revalidatePath('/', 'layout');
  revalidatePath('/portal/settings');
}

export async function saveGeneralBranding(input: GeneralBrandingValues): Promise<{ ok: true }> {
  const values = generalBrandingSchema.parse(input);
  await persist({
    company_name: values.companyName,
    tagline: values.tagline,
    logo_url: values.logoUrl,
    favicon_url: values.faviconUrl,
    og_default_image_url: values.ogDefaultImageUrl,
    theme_color: values.themeColor
  });
  return { ok: true };
}

export async function saveContact(input: ContactValues): Promise<{ ok: true }> {
  const values = contactSchema.parse(input);
  await persist({
    email: values.email,
    phone_primary: values.phonePrimary,
    phone_secondary: values.phoneSecondary,
    phone_office: values.phoneOffice,
    address_short: values.addressShort,
    postal_address: values.postalAddress,
    kato_address: values.katoAddress,
    whatsapp_message: values.whatsappMessage
  });
  return { ok: true };
}

export async function saveSocial(input: SocialValues): Promise<{ ok: true }> {
  const values = socialSchema.parse(input);
  await persist({ social_links: compact(values) });
  return { ok: true };
}

export async function saveNotifications(input: NotificationsValues): Promise<{ ok: true }> {
  const values = notificationsSchema.parse(input);
  await persist({
    notify_emails: values.notifyEmails,
    enquiry_email_enabled: values.enquiryEmailEnabled,
    enquiry_whatsapp_enabled: values.enquiryWhatsappEnabled,
    whatsapp_notify_phone: values.whatsappNotifyPhone
  });
  return { ok: true };
}

export async function saveSeoAnalytics(input: SeoAnalyticsValues): Promise<{ ok: true }> {
  const values = seoAnalyticsSchema.parse(input);
  await persist({
    seo_defaults: compact({ title: values.seoTitle, description: values.seoDescription }),
    analytics: compact({
      gaMeasurementId: values.gaMeasurementId,
      gtmId: values.gtmId,
      metaPixelId: values.metaPixelId,
      googleSiteVerification: values.googleSiteVerification,
      bingSiteVerification: values.bingSiteVerification
    })
  });
  return { ok: true };
}
