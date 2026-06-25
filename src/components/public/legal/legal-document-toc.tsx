'use client';

import { useEffect, useState } from 'react';

import { Icons } from '@/components/icons';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { LegalSection } from '@/lib/public/legal-content';
import { cn } from '@/lib/utils';

type LegalDocumentTocProps = {
  sections: LegalSection[];
};

type TocLinkProps = {
  isActive: boolean;
  onNavigate?: () => void;
  section: LegalSection;
};

function TocLink({ isActive, onNavigate, section }: TocLinkProps) {
  return (
    <a
      className={cn(
        'block text-sm leading-snug transition-colors',
        isActive
          ? 'font-semibold text-[var(--benroso-primary)]'
          : 'text-[var(--benroso-muted)] hover:text-[var(--benroso-accent)] hover:underline'
      )}
      href={`#${section.id}`}
      onClick={onNavigate}
    >
      {section.title}
    </a>
  );
}

type TocListProps = {
  activeId: string | null;
  onNavigate?: () => void;
  sections: LegalSection[];
};

function TocList({ activeId, onNavigate, sections }: TocListProps) {
  return (
    <ol className='flex flex-col gap-2'>
      {sections.map((section) => (
        <li key={section.id}>
          <TocLink isActive={activeId === section.id} onNavigate={onNavigate} section={section} />
        </li>
      ))}
    </ol>
  );
}

const tocCardClasses =
  'rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-[var(--benroso-ivory)] p-5';

export function LegalDocumentToc({ sections }: LegalDocumentTocProps) {
  const [activeId, setActiveId] = useState<string | null>(sections[0]?.id ?? null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const sectionElements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null);

    if (!sectionElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .toSorted((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
      }
    );

    sectionElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [sections]);

  return (
    <>
      <Collapsible className='lg:hidden' onOpenChange={setMobileOpen} open={mobileOpen}>
        <div className={tocCardClasses}>
          <CollapsibleTrigger className='flex w-full items-center justify-between gap-3 text-left'>
            <span className='benroso-heading text-sm font-semibold uppercase tracking-[0.12em]'>
              On this page
            </span>
            <Icons.chevronDown
              aria-hidden
              className={cn(
                'h-4 w-4 shrink-0 text-[var(--benroso-muted)] transition-transform duration-200',
                mobileOpen && 'rotate-180'
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className='mt-3'>
            <TocList
              activeId={activeId}
              onNavigate={() => setMobileOpen(false)}
              sections={sections}
            />
          </CollapsibleContent>
        </div>
      </Collapsible>

      <nav
        aria-label='On this page'
        className={cn(
          'hidden h-fit lg:block lg:sticky lg:top-[calc(var(--benroso-topbar-h)+var(--benroso-header-h)+1rem)]',
          tocCardClasses
        )}
      >
        <h2 className='benroso-heading text-sm font-semibold uppercase tracking-[0.12em]'>
          On this page
        </h2>
        <div className='mt-3'>
          <TocList activeId={activeId} sections={sections} />
        </div>
      </nav>
    </>
  );
}
