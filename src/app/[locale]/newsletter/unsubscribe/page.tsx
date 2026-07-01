import type { Metadata } from 'next';
import Link from 'next/link';
import type { SupabaseClient } from '@supabase/supabase-js';

import { localePath } from '@/lib/public/locale-path';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Unsubscribe',
  robots: { index: false, follow: false }
};

type UnsubscribePageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string | string[] }>;
};

async function unsubscribe(token: string): Promise<boolean> {
  // RPC is not in the generated DB types yet; use the untyped surface.
  const supabase = (await createClient()) as unknown as SupabaseClient;
  const { data, error } = await supabase.rpc('unsubscribe_newsletter', { p_token: token });
  if (error) return false;
  return Boolean(data);
}

export default async function NewsletterUnsubscribePage({
  params,
  searchParams
}: UnsubscribePageProps) {
  const { locale } = await params;
  const sp = await searchParams;
  const token = Array.isArray(sp.token) ? sp.token[0] : sp.token;

  const success = token ? await unsubscribe(token) : false;

  return (
    <main className='benroso-container benroso-section'>
      <div className='mx-auto max-w-xl text-center'>
        <h1 className='text-2xl font-bold text-[var(--benroso-primary-dark)]'>
          {success ? 'You have been unsubscribed' : 'Unable to unsubscribe'}
        </h1>
        <p className='mt-4 text-[var(--benroso-body)]'>
          {success
            ? 'You will no longer receive newsletter emails from Benroso Safaris. We’re sorry to see you go — you can resubscribe any time from our website footer.'
            : 'This unsubscribe link is invalid or has expired. If you keep receiving emails you’d rather not, contact us at info@benrososafaris.co.ke and we’ll remove you straight away.'}
        </p>
        <Link
          href={localePath(locale)}
          className='mt-8 inline-flex min-h-11 items-center justify-center rounded-[var(--benroso-button-radius)] bg-[var(--benroso-lime)] px-6 text-sm font-bold uppercase tracking-[0.06em] text-[var(--benroso-primary-dark)] transition-colors hover:bg-[var(--benroso-lime-hover)]'
        >
          Back to homepage
        </Link>
      </div>
    </main>
  );
}
