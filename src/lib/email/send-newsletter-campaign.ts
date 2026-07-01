/**
 * Newsletter campaign delivery via Resend.
 *
 * Mirrors the lightweight `fetch`-based approach in `send-enquiry-notification.ts`
 * (no SDK dependency). Uses Resend's batch endpoint so each recipient gets their
 * own message with a personalised one-click unsubscribe link. Batches are capped
 * at 100 messages per call, so recipients are chunked.
 */

const RESEND_BATCH_ENDPOINT = 'https://api.resend.com/emails/batch';
const BATCH_SIZE = 100;

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
  return `${body}\n\n—\nUnsubscribe: ${unsubscribeLink}`;
}

/**
 * Sends a campaign to every recipient. Returns the number successfully accepted
 * by Resend. Skips (without error) when no API key is configured, matching the
 * enquiry-email behaviour.
 */
export async function sendNewsletterCampaign(
  content: CampaignContent,
  recipients: CampaignRecipient[]
): Promise<SendCampaignResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM_EMAIL || 'Benroso Safaris <notifications@benrososafaris.co.ke>';

  if (!apiKey) {
    console.warn('[newsletter] RESEND_API_KEY is not set — skipping campaign send.');
    return { ok: false, sent: 0, skipped: true };
  }

  if (!recipients.length) {
    return { ok: true, sent: 0 };
  }

  let sent = 0;
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const chunk = recipients.slice(i, i + BATCH_SIZE);
    const payload = chunk.map((recipient) => {
      const link = unsubscribeUrl(recipient.unsubscribeToken);
      return {
        from,
        to: [recipient.email],
        subject: content.subject,
        html: buildCampaignHtml(content, link),
        text: buildPlainText(content, link),
        headers: { 'List-Unsubscribe': `<${link}>` }
      };
    });

    const response = await fetch(RESEND_BATCH_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('[newsletter] Batch send failed:', errorText);
      return { ok: false, sent, error: 'Resend rejected the campaign. Check the server logs.' };
    }

    sent += chunk.length;
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
