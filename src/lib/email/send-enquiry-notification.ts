import {
  enquiryNotificationEmail,
  enquiryReplyToEmail,
  isSmtpConfigured,
  smtpFromAddress
} from '@/lib/email/smtp-config';
import { sendMail } from '@/lib/email/mailer';

type EnquiryRecord = {
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

const BUDGET_TIER_LABELS: Record<string, string> = {
  budget: 'Budget',
  economy: 'Economy',
  luxury: 'Luxury',
  'high-end': 'High End'
};

function enquiryTypeLabel(type: EnquiryRecord['enquiryType']) {
  switch (type) {
    case 'safari-quote':
      return 'Safari Quote';
    case 'general':
      return 'General';
    default:
      return 'Other Enquiry';
  }
}

function buildPlainTextBody(enquiry: EnquiryRecord) {
  const lines = [
    `New ${enquiryTypeLabel(enquiry.enquiryType)} enquiry from benrososafaris.co.ke`,
    '',
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    `Phone: ${enquiry.phone || 'Not provided'}`,
    `Locale: ${enquiry.locale}`,
    `Source: ${enquiry.sourcePath || 'Unknown'}`
  ];

  if (enquiry.enquiryType === 'safari-quote') {
    lines.push(
      `Country: ${enquiry.country || '—'}`,
      `Destinations: ${enquiry.destinations || '—'}`,
      `Travel dates: ${enquiry.preferredDates || '—'}`,
      `Budget preference: ${enquiry.budgetTier ? (BUDGET_TIER_LABELS[enquiry.budgetTier] ?? enquiry.budgetTier) : '—'}`,
      `Tour budget per person: ${enquiry.budget || '—'}`,
      `Travelers: ${enquiry.travelers ?? '—'}`,
      `Adults: ${enquiry.adults ?? '—'}`,
      `Children: ${enquiry.children ?? '—'}`,
      `Infants: ${enquiry.infants ?? '—'}`,
      `Travel planning: ${enquiry.travelPlanningStage || '—'}`,
      `Trip type: ${enquiry.tripType || '—'}`,
      `Referral source: ${enquiry.referralSource || '—'}`
    );
  }

  if (enquiry.enquiryType === 'general') {
    lines.push(`Topic: ${enquiry.topic || '—'}`);
  }

  if (enquiry.enquiryType === 'other') {
    lines.push(`Booking reference: ${enquiry.bookingReference || '—'}`);
  }

  lines.push('', 'Message:', enquiry.message);

  return lines.join('\n');
}

function buildHtmlBody(enquiry: EnquiryRecord) {
  const rows = [
    ['Type', enquiryTypeLabel(enquiry.enquiryType)],
    ['Name', enquiry.name],
    ['Email', enquiry.email],
    ['Phone', enquiry.phone || 'Not provided'],
    ['Locale', enquiry.locale],
    ['Source page', enquiry.sourcePath || 'Unknown']
  ];

  if (enquiry.enquiryType === 'safari-quote') {
    rows.push(
      ['Country', enquiry.country || '—'],
      ['Destinations', enquiry.destinations || '—'],
      ['Travel dates', enquiry.preferredDates || '—'],
      [
        'Budget preference',
        enquiry.budgetTier ? (BUDGET_TIER_LABELS[enquiry.budgetTier] ?? enquiry.budgetTier) : '—'
      ],
      ['Tour budget per person', enquiry.budget || '—'],
      ['Travelers', enquiry.travelers != null ? String(enquiry.travelers) : '—'],
      ['Adults', enquiry.adults != null ? String(enquiry.adults) : '—'],
      ['Children', enquiry.children != null ? String(enquiry.children) : '—'],
      ['Infants', enquiry.infants != null ? String(enquiry.infants) : '—'],
      ['Travel planning', enquiry.travelPlanningStage || '—'],
      ['Trip type', enquiry.tripType || '—'],
      ['Referral source', enquiry.referralSource || '—']
    );
  }

  if (enquiry.enquiryType === 'general') {
    rows.push(['Topic', enquiry.topic || '—']);
  }

  if (enquiry.enquiryType === 'other') {
    rows.push(['Booking reference', enquiry.bookingReference || '—']);
  }

  const tableRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;">${label}</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">${value}</td></tr>`
    )
    .join('');

  return `
    <div style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.6;">
      <h2 style="margin:0 0 16px;">New website enquiry</h2>
      <table style="border-collapse:collapse;width:100%;max-width:640px;">${tableRows}</table>
      <h3 style="margin:24px 0 8px;">Message</h3>
      <p style="white-space:pre-wrap;margin:0;">${enquiry.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
    </div>
  `;
}

export async function sendEnquiryNotificationEmail(enquiry: EnquiryRecord) {
  if (process.env.ENABLE_ENQUIRY_NOTIFICATIONS !== 'true') {
    return { ok: false, skipped: true as const };
  }

  if (!isSmtpConfigured()) {
    console.warn('[enquiry-email] SMTP is not configured — skipping notification email.');
    return { ok: false, skipped: true as const };
  }

  const subject = `[Benroso Safaris] ${enquiryTypeLabel(enquiry.enquiryType)} — ${enquiry.name}`;
  const result = await sendMail({
    authMailbox: 'enquiry',
    from: smtpFromAddress('enquiry'),
    html: buildHtmlBody(enquiry),
    replyTo: enquiryReplyToEmail(),
    subject,
    text: buildPlainTextBody(enquiry),
    to: enquiryNotificationEmail()
  });

  if (result.skipped) {
    return { ok: false, skipped: true as const };
  }

  return { ok: result.ok, skipped: false as const };
}
