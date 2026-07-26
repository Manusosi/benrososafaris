'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { ExperienceCard } from '@/components/public/cards/content-cards';
import { ExperienceListingFilters } from '@/components/public/experiences/experience-listing-filters';
import { ExperienceScrollReveal } from '@/components/public/experiences/experience-scroll-reveal';
import { EmptyState, ListingShell } from '@/components/public/page-shell';
import { formatExperienceCountryCodes } from '@/features/experiences/public/country-map-copy';
import {
  buildExperienceListingQuery,
  buildExperienceEmptyState,
  filterPublishedExperiences,
  parseExperienceListingFilters
} from '@/features/experiences/public/filters';
import type { PublicExperience } from '@/features/experiences/public/types';
import { localePath } from '@/lib/public/locale-path';

type ExperiencesListingSectionProps = {
  categoryBlurb?: string | null;
  experiences: PublicExperience[];
  id?: string;
  legacyCategory?: string;
  locale: string;
};

export function ExperiencesListingSection({
  categoryBlurb,
  experiences,
  id,
  legacyCategory,
  locale
}: ExperiencesListingSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const basePath = localePath(locale, '/experiences');

  const filters = useMemo(
    () =>
      parseExperienceListingFilters({
        country: searchParams.get('country') ?? undefined,
        group: searchParams.get('group') ?? undefined
      }),
    [searchParams]
  );

  const filteredExperiences = useMemo(
    () => filterPublishedExperiences(experiences, filters),
    [experiences, filters]
  );
  const emptyState = useMemo(() => buildExperienceEmptyState(filters), [filters]);

  function handleFiltersChange(next: ReturnType<typeof parseExperienceListingFilters>) {
    const query = buildExperienceListingQuery(next);
    router.replace(query ? `${basePath}?${query}` : basePath, { scroll: false });
  }

  return (
    <ExperienceScrollReveal id={id}>
      <ListingShell
        className='bg-white'
        filters={<ExperienceListingFilters active={filters} onChange={handleFiltersChange} />}
      >
        {legacyCategory && categoryBlurb ? (
          <div className='mb-8 border-b border-[var(--benroso-line)] pb-8'>
            <p className='benroso-eyebrow'>{legacyCategory} Safaris</p>
            <p className='mt-3 text-[15px] leading-7 text-[var(--benroso-ink)]'>{categoryBlurb}</p>
          </div>
        ) : null}

        {filteredExperiences.length ? (
          <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
            {filteredExperiences.map((experience) => (
              <ExperienceCard
                item={{
                  category: experience.category,
                  countryCodes: formatExperienceCountryCodes(experience.countries),
                  excerpt: experience.summary,
                  href: experience.href,
                  imageAlt: experience.imageAlt,
                  imageUrl: experience.imageUrl,
                  title: experience.title
                }}
                key={experience.id}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            actionHref={localePath(locale, '/contact')}
            actionLabel='Speak With a Safari Planner'
            message={emptyState.message}
            title={emptyState.title}
          />
        )}
      </ListingShell>
    </ExperienceScrollReveal>
  );
}
