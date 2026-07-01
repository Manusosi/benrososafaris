'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { SectionHeader } from '@/components/public/ui/section-header';
import type { DirectAnswer } from '@/lib/seo/direct-answers';
import { cn } from '@/lib/utils';

type FaqSectionProps = {
  className?: string;
  description?: string;
  eyebrow?: string;
  faqs: DirectAnswer[];
  headingId?: string;
  title?: string;
};

export function FaqSection({
  className,
  description = 'Everything you need to know before you travel with us. Still unsure about something? Our safari planners are always happy to help.',
  eyebrow = 'FAQ',
  faqs,
  headingId = 'destination-faq-heading',
  title = 'Travelers are asking'
}: FaqSectionProps) {
  if (!faqs.length) return null;

  return (
    <section aria-labelledby={headingId} className={cn('benroso-section bg-white', className)}>
      <div className='benroso-container'>
        <div className='grid gap-10 lg:grid-cols-[2fr_3fr] lg:items-start lg:gap-16'>
          {/* Heading column — sticks alongside the list on desktop */}
          <div className='lg:sticky lg:top-28'>
            <SectionHeader
              align='left'
              description={description}
              eyebrow={eyebrow}
              title={title}
              titleId={headingId}
            />
          </div>

          {/* Questions — clean divided list, no boxed container */}
          <Accordion className='border-t border-[var(--benroso-line)]' collapsible type='single'>
            {faqs.map((faq, index) => (
              <AccordionItem
                className='border-[var(--benroso-line)]'
                key={`${index}-${faq.question}`}
                value={`faq-${index}`}
              >
                <AccordionTrigger className='items-center gap-4 py-6 text-left font-display text-lg leading-snug text-[var(--benroso-heading)] hover:no-underline hover:text-[var(--benroso-primary)] data-[state=open]:text-[var(--benroso-primary)] md:text-xl [&>svg]:size-5 [&>svg]:text-[var(--benroso-lime)]'>
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className='max-w-2xl pb-6 text-[15px] leading-7 text-[var(--benroso-muted)] md:text-base'>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
