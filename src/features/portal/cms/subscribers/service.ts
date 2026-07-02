'use server';

import { revalidatePath } from 'next/cache';
import type { SupabaseClient } from '@supabase/supabase-js';

import { requirePortalSession } from '@/lib/auth/portal';
import { createClient } from '@/lib/supabase/server';
import { sendNewsletterCampaign, sendNewsletterTest } from '@/lib/email/send-newsletter-campaign';
import type {
  CampaignRow,
  SendCampaignResult,
  SubscriberRow,
  SubscriberStats,
  SubscriberStatus
} from './types';

/** Editors and super admins only. */
const WRITE_ROLES = new Set(['owner', 'admin', 'editor']);

async function assertCanWrite() {
  const session = await requirePortalSession();
  if (!WRITE_ROLES.has(session.role)) {
    throw new Error('You do not have permission to manage subscribers.');
  }
  return session;
}

/**
 * The `newsletter_*` tables are not in the generated DB types, so all access
 * goes through the untyped client surface (same pattern as portal/api/service).
 */
async function genericClient(): Promise<SupabaseClient> {
  return (await createClient()) as unknown as SupabaseClient;
}

export async function listSubscribers(): Promise<SubscriberRow[]> {
  await requirePortalSession();
  const supabase = await genericClient();
  const { data } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, name, locale, status, source, subscribed_at')
    .order('subscribed_at', { ascending: false })
    .limit(500);

  return (data ?? []).map((row) => ({
    id: row.id as string,
    email: row.email as string,
    name: (row.name as string | null) ?? null,
    locale: (row.locale as string) ?? 'en',
    status: row.status as SubscriberStatus,
    source: (row.source as string | null) ?? null,
    subscribedAt: row.subscribed_at as string
  }));
}

export async function getSubscriberStats(): Promise<SubscriberStats> {
  await requirePortalSession();
  const supabase = await genericClient();

  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const t30 = new Date(now - 30 * day).toISOString();
  const t60 = new Date(now - 60 * day).toISOString();

  const head = () =>
    supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true });

  const [total, subscribed, unsubscribed, signupsLast30, signupsPrev30, unsubLast30, unsubPrev30] =
    await Promise.all([
      head(),
      head().eq('status', 'subscribed'),
      head().eq('status', 'unsubscribed'),
      head().gte('subscribed_at', t30),
      head().gte('subscribed_at', t60).lt('subscribed_at', t30),
      head().gte('unsubscribed_at', t30),
      head().gte('unsubscribed_at', t60).lt('unsubscribed_at', t30)
    ]);

  return {
    total: total.count ?? 0,
    subscribed: subscribed.count ?? 0,
    unsubscribed: unsubscribed.count ?? 0,
    signupsLast30: signupsLast30.count ?? 0,
    signupsPrev30: signupsPrev30.count ?? 0,
    unsubLast30: unsubLast30.count ?? 0,
    unsubPrev30: unsubPrev30.count ?? 0
  };
}

export async function addSubscriber(input: { email: string; name?: string }): Promise<void> {
  await assertCanWrite();
  const email = input.email.trim().toLowerCase();
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
    throw new Error('Please enter a valid email address.');
  }

  const supabase = await genericClient();
  const { error } = await supabase.from('newsletter_subscribers').upsert(
    {
      email,
      name: input.name?.trim() || null,
      source: 'manual',
      status: 'subscribed',
      unsubscribed_at: null,
      updated_at: new Date().toISOString()
    },
    { onConflict: 'email' }
  );
  if (error) throw new Error(error.message);

  revalidatePath('/portal/subscribers');
}

export async function setSubscriberStatus(id: string, status: SubscriberStatus): Promise<void> {
  await assertCanWrite();
  const supabase = await genericClient();
  const { error } = await supabase
    .from('newsletter_subscribers')
    .update({
      status,
      unsubscribed_at: status === 'unsubscribed' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/portal/subscribers');
}

export async function deleteSubscriber(id: string): Promise<void> {
  await assertCanWrite();
  const supabase = await genericClient();
  const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/portal/subscribers');
}

export async function listCampaigns(): Promise<CampaignRow[]> {
  await requirePortalSession();
  const supabase = await genericClient();
  const { data } = await supabase
    .from('newsletter_campaigns')
    .select(
      'id, subject, preheader, body_html, status, recipient_count, sent_count, sent_at, created_at'
    )
    .order('created_at', { ascending: false })
    .limit(100);

  return (data ?? []).map((row) => ({
    id: row.id as string,
    subject: row.subject as string,
    preheader: (row.preheader as string | null) ?? null,
    bodyHtml: (row.body_html as string | null) ?? null,
    status: row.status as CampaignRow['status'],
    recipientCount: (row.recipient_count as number) ?? 0,
    sentCount: (row.sent_count as number) ?? 0,
    sentAt: (row.sent_at as string | null) ?? null,
    createdAt: row.created_at as string
  }));
}

/** Sends a single preview of the composed content to the logged-in editor. */
export async function sendCampaignTest(input: {
  subject: string;
  preheader?: string;
  bodyHtml: string;
}): Promise<SendCampaignResult> {
  const session = await assertCanWrite();
  if (!input.subject.trim() || !input.bodyHtml.trim()) {
    return { ok: false, sent: 0, error: 'Add a subject and some content first.' };
  }

  return sendNewsletterTest(
    { subject: input.subject, preheader: input.preheader, bodyHtml: input.bodyHtml },
    session.email
  );
}

/**
 * Persists the campaign, sends it to every active subscriber via SMTP, and
 * records the result. Returns the number of recipients successfully sent.
 */
export async function sendCampaign(input: {
  subject: string;
  preheader?: string;
  bodyHtml: string;
}): Promise<SendCampaignResult> {
  const session = await assertCanWrite();
  if (!input.subject.trim() || !input.bodyHtml.trim()) {
    return { ok: false, sent: 0, error: 'Add a subject and some content first.' };
  }

  const supabase = await genericClient();

  const { data: subscribers } = await supabase
    .from('newsletter_subscribers')
    .select('email, unsubscribe_token')
    .eq('status', 'subscribed');

  const recipients = (subscribers ?? []).map((row) => ({
    email: row.email as string,
    unsubscribeToken: row.unsubscribe_token as string
  }));

  // Record the campaign as "sending" before dispatch so a crash leaves a trace.
  const { data: campaign, error: insertError } = await supabase
    .from('newsletter_campaigns')
    .insert({
      subject: input.subject,
      preheader: input.preheader || null,
      body_html: input.bodyHtml,
      status: 'sending',
      recipient_count: recipients.length,
      created_by: session.userId
    })
    .select('id')
    .single();
  if (insertError) throw new Error(insertError.message);

  const result = await sendNewsletterCampaign(
    { subject: input.subject, preheader: input.preheader, bodyHtml: input.bodyHtml },
    recipients
  );

  await supabase
    .from('newsletter_campaigns')
    .update({
      status: result.ok ? 'sent' : 'failed',
      sent_count: result.sent,
      sent_at: result.ok ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', campaign.id);

  revalidatePath('/portal/subscribers');
  return result;
}
