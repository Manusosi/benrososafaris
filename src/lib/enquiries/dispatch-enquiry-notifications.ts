import { sendEnquiryNotificationEmail } from '@/lib/email/send-enquiry-notification';
import { isSmtpConfigured } from '@/lib/email/smtp-config';
import { buildWhatsAppEnquirySummary, notifyWhatsAppTeam } from '@/lib/enquiries/whatsapp-summary';

export type EnquiryNotificationPayload = {
  adults?: number | null;
  bookingReference?: string | null;
  budget?: string | null;
  budgetTier?: string | null;
  children?: number | null;
  country?: string | null;
  destinations?: string | null;
  email: string;
  enquiryType: 'safari-quote' | 'general' | 'other';
  infants?: number | null;
  locale: string;
  message: string;
  name: string;
  phone?: string | null;
  preferredDates?: string | null;
  referralSource?: string | null;
  sourcePath?: string | null;
  topic?: string | null;
  travelPlanningStage?: string | null;
  travelers?: number | null;
  tripType?: string | null;
};

export function shouldSendEnquiryNotifications() {
  return process.env.ENABLE_ENQUIRY_NOTIFICATIONS === 'true' && isSmtpConfigured();
}

export async function dispatchEnquiryNotifications(payload: EnquiryNotificationPayload) {
  if (!shouldSendEnquiryNotifications()) {
    return;
  }

  await Promise.allSettled([
    sendEnquiryNotificationEmail(payload),
    notifyWhatsAppTeam(buildWhatsAppEnquirySummary(payload))
  ]);
}
