'use client';

import { Icons } from '@/components/icons';
import { BenrosoButton } from '@/components/public/ui/benroso-button';
import {
  parseEnquiryThankYouSource,
  thankYouCopy,
  type EnquiryThankYouSource
} from '@/lib/public/enquiry-thank-you';
import { localePath } from '@/lib/public/locale-path';

type ThankYouContentProps = {
  locale: string;
  sourceParam?: string | string[];
};

export function ThankYouContent({ locale, sourceParam }: ThankYouContentProps) {
  const source: EnquiryThankYouSource = parseEnquiryThankYouSource(sourceParam);
  const copy = thankYouCopy(source);

  return (
    <main className='bg-[var(--benroso-contact-body-bg)]'>
      <section className='benroso-container benroso-section'>
        <div className='benroso-thank-you mx-auto max-w-2xl'>
          <div aria-hidden className='benroso-thank-you__icon-wrap'>
            <span className='benroso-thank-you__ring benroso-thank-you__ring--outer' />
            <span className='benroso-thank-you__ring benroso-thank-you__ring--inner' />
            <span className='benroso-thank-you__icon'>
              <Icons.check className='size-9' strokeWidth={2.5} />
            </span>
            <span className='benroso-thank-you__spark benroso-thank-you__spark--1' />
            <span className='benroso-thank-you__spark benroso-thank-you__spark--2' />
            <span className='benroso-thank-you__spark benroso-thank-you__spark--3' />
          </div>

          <p className='benroso-thank-you__eyebrow'>Enquiry received</p>
          <h1 className='benroso-thank-you__heading font-display'>{copy.heading}</h1>
          <p className='benroso-thank-you__body'>{copy.body}</p>
          <p className='benroso-thank-you__note'>
            No payment is collected on this website. We listen first and tailor suggestions to your
            interests.
          </p>

          <div className='benroso-thank-you__actions'>
            <BenrosoButton href={localePath(locale)} variant='gold'>
              Back to homepage
            </BenrosoButton>
            <BenrosoButton href={localePath(locale, copy.secondaryHref)} variant='accent-outline'>
              {copy.secondaryLabel}
            </BenrosoButton>
          </div>
        </div>
      </section>
    </main>
  );
}
