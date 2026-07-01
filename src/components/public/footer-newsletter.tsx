'use client';

import { useState, useTransition } from 'react';
import { usePathname } from 'next/navigation';

import { Icons } from '@/components/icons';
import { subscribeToNewsletter } from '@/components/public/newsletter-actions';

interface FooterNewsletterProps {
  locale?: string;
}

export function FooterNewsletter({ locale = 'en' }: FooterNewsletterProps) {
  const pathname = usePathname();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();
    const name = String(formData.get('name') ?? '').trim();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    startTransition(async () => {
      const result = await subscribeToNewsletter({ email, name, locale, sourcePath: pathname });
      if (result.ok) {
        setSubmitted(true);
      } else {
        setError(result.error ?? 'Something went wrong. Please try again.');
      }
    });
  }

  return (
    <div>
      <h3 className='benroso-footer-heading'>Safari Inspiration</h3>
      <p className='max-w-sm text-sm leading-6 text-white/75'>
        Join our newsletter for safari deals, travel tips, and the best times to visit East Africa.
      </p>

      {submitted ? (
        <p className='mt-4 inline-flex items-center gap-2 text-sm text-white'>
          <Icons.circleCheck className='h-4 w-4 text-[var(--benroso-lime)]' />
          Thank you. Safari inspiration is on its way.
        </p>
      ) : (
        <form className='mt-4 flex max-w-sm flex-col gap-3' onSubmit={handleSubmit}>
          <label className='sr-only' htmlFor='footer-newsletter-name'>
            Your name
          </label>
          <input
            className='min-h-11 rounded-[var(--benroso-radius)] border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-white/50 focus:border-[var(--benroso-lime)] focus:outline-none'
            id='footer-newsletter-name'
            name='name'
            placeholder='Your name'
            type='text'
          />
          <label className='sr-only' htmlFor='footer-newsletter-email'>
            Email address
          </label>
          <div className='flex flex-col gap-3 sm:flex-row'>
            <input
              className='min-h-11 flex-1 rounded-[var(--benroso-radius)] border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-white/50 focus:border-[var(--benroso-lime)] focus:outline-none'
              id='footer-newsletter-email'
              name='email'
              placeholder='Your email address'
              required
              type='email'
            />
            <button
              className='inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-[var(--benroso-button-radius)] bg-[var(--benroso-lime)] px-5 text-sm font-bold uppercase tracking-[0.06em] text-[var(--benroso-primary-dark)] transition-colors hover:bg-[var(--benroso-lime-hover)] disabled:cursor-not-allowed disabled:opacity-70'
              disabled={isPending}
              type='submit'
            >
              {isPending ? 'Subscribing…' : 'Subscribe'}
              <Icons.arrowRight className='h-4 w-4' />
            </button>
          </div>
        </form>
      )}

      {error ? <p className='mt-3 text-sm text-red-300'>{error}</p> : null}
    </div>
  );
}
