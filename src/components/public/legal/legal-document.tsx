import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';

import { ContactHero } from '@/components/public/contact/contact-hero';
import { LegalDocumentToc } from '@/components/public/legal/legal-document-toc';
import type { LegalPageDefinition, LegalSection } from '@/lib/public/legal-content';
import { localePath } from '@/lib/public/locale-path';

type LegalDocumentProps = {
  locale: string;
  page: LegalPageDefinition;
};

function renderLegalText(text: string, locale: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      const path = href.startsWith('/') ? localePath(locale, href) : href;

      return (
        <Link
          className='text-[var(--benroso-primary)] hover:underline'
          href={path}
          key={`${part}-${index}`}
        >
          {label}
        </Link>
      );
    }

    return part;
  });
}

function LegalList({ items, locale }: { items: string[]; locale: string }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item}>{renderLegalText(item, locale)}</li>
      ))}
    </ul>
  );
}

function LegalSectionContent({ locale, section }: { locale: string; section: LegalSection }) {
  return (
    <>
      {section.paragraphs.map((paragraph, index) => (
        <Fragment key={`${section.id}-p-${index}`}>
          <p>{renderLegalText(paragraph, locale)}</p>
          {section.listItems?.length && section.listAfterParagraphIndex === index ? (
            <LegalList items={section.listItems} locale={locale} />
          ) : null}
        </Fragment>
      ))}
      {section.listItems?.length && section.listAfterParagraphIndex === undefined ? (
        <LegalList items={section.listItems} locale={locale} />
      ) : null}
    </>
  );
}

function LegalIntro({ intro, locale }: { intro: string | string[]; locale: string }) {
  const paragraphs = Array.isArray(intro) ? intro : [intro];

  return (
    <div className='benroso-legal-intro mt-6 space-y-4'>
      {paragraphs.map((paragraph, index) => (
        <p className='benroso-body' key={`intro-${index}`}>
          {renderLegalText(paragraph, locale)}
        </p>
      ))}
    </div>
  );
}

export function LegalDocument({ locale, page }: LegalDocumentProps) {
  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(page.lastUpdated));

  return (
    <>
      <ContactHero
        breadcrumbs={[{ href: localePath(locale), label: 'Home' }, { label: page.title }]}
        description={page.description}
        eyebrow={page.eyebrow}
        title={page.title}
      />
      <section className='benroso-section bg-[var(--benroso-contact-body-bg)]'>
        <div className='benroso-container'>
          <div className='grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10'>
            <aside className='min-w-0'>
              <LegalDocumentToc sections={page.sections} />
            </aside>

            <div className='min-w-0'>
              <p className='benroso-body text-sm'>Last updated: {formattedDate}</p>

              {page.intro ? <LegalIntro intro={page.intro} locale={locale} /> : null}

              <article className='benroso-legal-prose mt-8'>
                {page.sections.map((section) => (
                  <section className='benroso-legal-section' id={section.id} key={section.id}>
                    <h2>{section.title}</h2>
                    <LegalSectionContent locale={locale} section={section} />
                  </section>
                ))}
              </article>

              <div className='mt-12 border-t border-[var(--benroso-line)] pt-8'>
                <p className='benroso-body text-sm'>
                  Related policies:{' '}
                  {page.slug !== 'privacy-policy' ? (
                    <Link
                      className='text-[var(--benroso-primary)] hover:underline'
                      href={localePath(locale, '/privacy-policy')}
                    >
                      Privacy Policy
                    </Link>
                  ) : null}
                  {page.slug !== 'cookie-policy' ? (
                    <>
                      {page.slug !== 'privacy-policy' ? ' · ' : null}
                      <Link
                        className='text-[var(--benroso-primary)] hover:underline'
                        href={localePath(locale, '/cookie-policy')}
                      >
                        Cookie Policy
                      </Link>
                    </>
                  ) : null}
                  {page.slug !== 'terms-conditions' ? (
                    <>
                      {' · '}
                      <Link
                        className='text-[var(--benroso-primary)] hover:underline'
                        href={localePath(locale, '/terms-conditions')}
                      >
                        Terms &amp; Conditions
                      </Link>
                    </>
                  ) : null}
                  {page.slug !== 'payment-terms' ? (
                    <>
                      {' · '}
                      <Link
                        className='text-[var(--benroso-primary)] hover:underline'
                        href={localePath(locale, '/payment-terms')}
                      >
                        Payment Terms
                      </Link>
                    </>
                  ) : null}
                  {page.slug !== 'service-level-agreement' ? (
                    <>
                      {' · '}
                      <Link
                        className='text-[var(--benroso-primary)] hover:underline'
                        href={localePath(locale, '/service-level-agreement')}
                      >
                        Service Level Agreement
                      </Link>
                    </>
                  ) : null}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
