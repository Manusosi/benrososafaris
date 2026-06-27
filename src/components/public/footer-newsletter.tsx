'use client';

import { useState } from 'react';

import { Icons } from '@/components/icons';

export function FooterNewsletter() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div>
      <h3 className='benroso-footer-heading'>Safari Inspiration</h3>
      <p className='max-w-sm text-sm leading-6 text-white/75'>
        Join our newsletter for safari deals, travel tips, and the best times to visit East Africa.
      </p>

      {submitted ? (
        <p className='mt-4 inline-flex items-center gap-2 text-sm text-white'>
          <Icons.circleCheck className='h-4 w-4 text-[var(--benroso-gold)]' />
          Thank you. Safari inspiration is on its way.
        </p>
      ) : (
        <form
          className='mt-4 flex max-w-sm flex-col gap-3 sm:flex-row'
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
          }}
        >
          <label className='sr-only' htmlFor='footer-newsletter-email'>
            Email address
          </label>
          <input
            className='min-h-11 flex-1 rounded-[var(--benroso-radius)] border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-white/50 focus:border-[var(--benroso-gold)] focus:outline-none'
            id='footer-newsletter-email'
            name='email'
            placeholder='Your email address'
            required
            type='email'
          />
          <button
            className='inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-[var(--benroso-button-radius)] bg-[var(--benroso-gold)] px-5 text-sm font-bold uppercase tracking-[0.06em] text-[var(--benroso-primary-dark)] transition-colors hover:bg-[var(--benroso-gold-hover)]'
            type='submit'
          >
            Subscribe
            <Icons.arrowRight className='h-4 w-4' />
          </button>
        </form>
      )}
    </div>
  );
}
