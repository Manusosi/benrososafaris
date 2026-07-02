/**
 * Newsletter campaign delivery via Benroso SMTP (news@benrososafaris.co.ke).
 */

import { sendMail } from '@/lib/email/mailer';
import { isSmtpConfigured, smtpFromAddress } from '@/lib/email/smtp-config';

export interface CampaignRecipient {
  email: string;
  unsubscribeToken: string;
}

export interface CampaignContent {
  subject: string;
  preheader?: string | null;
  bodyHtml: string;
}

export interface SendCampaignResult {
  ok: boolean;
  sent: number;
  skipped?: boolean;
  error?: string;
}

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://benrososafaris.co.ke').replace(/\/$/, '');
}

function unsubscribeUrl(token: string): string {
  return `${siteUrl()}/en/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
}

/** Wraps the editor HTML in a minimal branded shell with the unsubscribe footer. */
export function buildCampaignHtml(content: CampaignContent, unsubscribeLink: string): string {
  const preheader = content.preheader
    ? `<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${content.preheader}</span>`
    : '';

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#1f2937;line-height:1.6;max-width:640px;margin:0 auto;">
      ${preheader}
      <div style="padding:8px 0 16px;">
        <strong style="font-size:18px;color:#3c5142;">Benroso Safaris</strong>
      </div>
      <div>${content.bodyHtml}</div>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 16px;" />
      <p style="font-size:12px;color:#6b7280;margin:0;">
        You are receiving this because you subscribed to Benroso Safaris updates.
        <a href="${unsubscribeLink}" style="color:#6b7280;">Unsubscribe</a>.
      </p>
    </div>
  `;
}

function buildPlainText(content: CampaignContent, unsubscribeLink: string): string {
  const body = content.bodyHtml
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return `${body}\n\nUnsubscribe: ${unsubscribeLink}`;
}

/**
 * Sends a campaign to every recipient. Returns the number successfully sent.
 * Skips (without error) when SMTP is not configured.
 */
export async function sendNewsletterCampaign(
  content: CampaignContent,
  recipients: CampaignRecipient[]
): Promise<SendCampaignResult> {
  if (!isSmtpConfigured()) {
    console.warn('[newsletter] SMTP is not configured — skipping campaign send.');
    return { ok: false, sent: 0, skipped: true };
  }

  if (!recipients.length) {
    return { ok: true, sent: 0 };
  }

  const from = smtpFromAddress('newsletter');
  let sent = 0;

  for (const recipient of recipients) {
    const link = unsubscribeUrl(recipient.unsubscribeToken);
    const result = await sendMail({
      authMailbox: 'newsletter',
      from,
      headers: { 'List-Unsubscribe': `<${link}>` },
      html: buildCampaignHtml(content, link),
      subject: content.subject,
      text: buildPlainText(content, link),
      to: recipient.email
    });

    if (result.skipped) {
      return { ok: false, sent, skipped: true };
    }

    if (!result.ok) {
      return {
        ok: false,
        sent,
        error: result.error ?? 'SMTP rejected the campaign. Check the server logs.'
      };
    }

    sent += 1;
  }

  return { ok: true, sent };
}

/** Sends a single preview to one address (the "send test to me" button). */
export async function sendNewsletterTest(
  content: CampaignContent,
  toEmail: string,
  unsubscribeToken = 'preview-token'
): Promise<SendCampaignResult> {
  return sendNewsletterCampaign(content, [{ email: toEmail, unsubscribeToken }]);
}
