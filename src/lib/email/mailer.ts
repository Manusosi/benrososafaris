import nodemailer from 'nodemailer';

import { isSmtpConfigured, smtpAuthUser, type SmtpMailbox } from '@/lib/email/smtp-config';

export type SendMailInput = {
  authMailbox: SmtpMailbox;
  from: string;
  headers?: Record<string, string>;
  html?: string;
  replyTo?: string;
  subject: string;
  text?: string;
  to: string | string[];
};

export type SendMailResult =
  | { ok: true; skipped: false }
  | { ok: false; skipped: true }
  | { ok: false; skipped: false; error: string };

function getTransport(authUser: string) {
  const host = process.env.SMTP_HOST?.trim();
  const password = process.env.SMTP_PASSWORD?.trim();
  const port = Number(process.env.SMTP_PORT ?? 587);

  if (!host || !password) {
    return null;
  }

  return nodemailer.createTransport({
    auth: { pass: password, user: authUser },
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true',
    requireTLS: process.env.SMTP_SECURE !== 'true'
  });
}

export async function sendMail(input: SendMailInput): Promise<SendMailResult> {
  if (!isSmtpConfigured()) {
    return { ok: false, skipped: true };
  }

  const authUser = smtpAuthUser(input.authMailbox);
  const transport = getTransport(authUser);

  if (!transport) {
    return { ok: false, skipped: true };
  }

  try {
    await transport.sendMail({
      from: input.from,
      headers: input.headers,
      html: input.html,
      replyTo: input.replyTo,
      subject: input.subject,
      text: input.text,
      to: input.to
    });

    return { ok: true, skipped: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown SMTP error';
    console.error('[mailer] Failed to send email:', message);
    return { ok: false, skipped: false, error: message };
  }
}
