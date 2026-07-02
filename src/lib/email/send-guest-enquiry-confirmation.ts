import { BENROSO_BRAND_COLORS, BENROSO_CONTACT_DEFAULTS } from '@/config/benroso';
import { sendMail } from '@/lib/email/mailer';
import { enquiryReplyToEmail, isSmtpConfigured, smtpFromAddress } from '@/lib/email/smtp-config';
import { getGuestFirstName } from '@/lib/enquiries/enquiry-comms';

export type GuestEnquiryConfirmationPayload = {
  email: string;
  enquiryType: 'safari-quote' | 'general' | 'other';
  name: string;
  referenceCode?: string | null;
  topic?: string | null;
};

function enquiryTypeHeading(type: GuestEnquiryConfirmationPayload['enquiryType']) {
  switch (type) {
    case 'safari-quote':
      return 'Thank you for your safari enquiry';
    case 'general':
      return 'Thank you for contacting us';
    default:
      return 'Thank you for your enquiry';
  }
}

function buildPlainTextBody(payload: GuestEnquiryConfirmationPayload) {
  const firstName = getGuestFirstName(payload.name);
  const reference = payload.referenceCode?.trim();
  const lines = [
    `Hello ${firstName},`,
    '',
    'Thank you for reaching out to Benroso Safaris. We have received your enquiry and a member of our team will be in touch shortly.',
    '',
    'We listen first and tailor suggestions to your interests. There is no hard sell, and no payment is collected through our website.',
    '',
    'Our safari experts aim to respond within 24 hours with thoughtful guidance based on what you shared.'
  ];

  if (reference && reference !== 'BENS-PENDING') {
    lines.push('', `Your enquiry reference: ${reference}`);
  }

  lines.push(
    '',
    'Warm regards,',
    'The Benroso Safaris Team',
    BENROSO_CONTACT_DEFAULTS.email,
    BENROSO_CONTACT_DEFAULTS.phonePrimary
  );

  return lines.join('\n');
}

function buildHtmlBody(payload: GuestEnquiryConfirmationPayload) {
  const firstName = getGuestFirstName(payload.name);
  const reference = payload.referenceCode?.trim();
  const heading = enquiryTypeHeading(payload.enquiryType);

  const referenceBlock =
    reference && reference !== 'BENS-PENDING'
      ? `<p style="margin:0 0 16px;font-family:monospace;font-size:14px;color:${BENROSO_BRAND_COLORS.primary};">Reference: ${reference}</p>`
      : '';

  return `
    <div style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.65;max-width:560px;">
      <div style="border-bottom:3px solid ${BENROSO_BRAND_COLORS.primary};padding-bottom:16px;margin-bottom:24px;">
        <p style="margin:0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;">${BENROSO_CONTACT_DEFAULTS.companyName}</p>
        <h1 style="margin:8px 0 0;font-size:22px;color:${BENROSO_BRAND_COLORS.primary};">${heading}</h1>
      </div>
      <p style="margin:0 0 16px;">Hello ${firstName},</p>
      <p style="margin:0 0 16px;">Thank you for reaching out to Benroso Safaris. We have received your enquiry and a member of our team will be in touch shortly.</p>
      <p style="margin:0 0 16px;">We listen first and tailor suggestions to your interests. There is no hard sell, and no payment is collected through our website.</p>
      <p style="margin:0 0 16px;">Our safari experts aim to respond within 24 hours with thoughtful guidance based on what you shared.</p>
      ${referenceBlock}
      <p style="margin:24px 0 0;color:#374151;">
        Warm regards,<br />
        The Benroso Safaris Team<br />
        <a href="mailto:${BENROSO_CONTACT_DEFAULTS.email}" style="color:${BENROSO_BRAND_COLORS.primary};">${BENROSO_CONTACT_DEFAULTS.email}</a><br />
        ${BENROSO_CONTACT_DEFAULTS.phonePrimary}
      </p>
    </div>
  `;
}

function buildSubject(payload: GuestEnquiryConfirmationPayload) {
  const reference = payload.referenceCode?.trim();

  if (reference && reference !== 'BENS-PENDING') {
    return `We received your enquiry ${reference} – ${BENROSO_CONTACT_DEFAULTS.companyName}`;
  }

  return `We received your enquiry – ${BENROSO_CONTACT_DEFAULTS.companyName}`;
}

export function shouldSendGuestEnquiryConfirmation() {
  if (process.env.ENABLE_GUEST_ENQUIRY_CONFIRMATION === 'false') {
    return false;
  }

  return isSmtpConfigured();
}

export async function sendGuestEnquiryConfirmationEmail(payload: GuestEnquiryConfirmationPayload) {
  if (!shouldSendGuestEnquiryConfirmation()) {
    return { ok: false, skipped: true as const };
  }

  const result = await sendMail({
    authMailbox: 'guest',
    from: smtpFromAddress('guest'),
    html: buildHtmlBody(payload),
    replyTo: enquiryReplyToEmail(),
    subject: buildSubject(payload),
    text: buildPlainTextBody(payload),
    to: payload.email
  });

  if (result.skipped) {
    console.warn('[guest-enquiry-email] SMTP is not configured — skipping guest confirmation.');
    return { ok: false, skipped: true as const };
  }

  return { ok: result.ok, skipped: false as const };
}
