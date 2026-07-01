'use server';

import type { SupabaseClient } from '@supabase/supabase-js';

import { createClient } from '@/lib/supabase/server';

export interface SubscribeInput {
  email: string;
  name?: string;
  locale?: string;
  sourcePath?: string;
}

export interface SubscribeResult {
  ok: boolean;
  error?: string;
}

/**
 * Public newsletter sign-up. Calls the `subscribe_newsletter` SECURITY DEFINER
 * RPC so the anon client never touches the `newsletter_subscribers` table
 * directly. Validation (email format, upsert/reactivation) lives in the RPC.
 */
export async function subscribeToNewsletter(input: SubscribeInput): Promise<SubscribeResult> {
  const email = input.email?.trim();
  if (!email) {
    return { ok: false, error: 'Please enter your email address.' };
  }

  // The new RPC is not yet in the generated DB types; use the untyped surface
  // (same pattern as the generic content helpers in portal/api/service.ts).
  const supabase = (await createClient()) as unknown as SupabaseClient;
  const { error } = await supabase.rpc('subscribe_newsletter', {
    p_email: email,
    p_name: input.name?.trim() || null,
    p_locale: input.locale || 'en',
    p_source: 'footer',
    p_source_path: input.sourcePath ?? null
  });

  if (error) {
    return {
      ok: false,
      error: /valid email/i.test(error.message)
        ? 'Please enter a valid email address.'
        : 'Something went wrong. Please try again.'
    };
  }

  return { ok: true };
}
