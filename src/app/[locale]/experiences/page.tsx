import type { Metadata } from 'next';

import { ExperienceCard } from '@/components/public/cards/content-cards';
import { ExperienceAfricaMap } from '@/components/public/experiences/experience-africa-map';
import { ExperienceListingIntro } from '@/components/public/experiences/experience-listing-intro';
import { ExperiencesListingSection } from '@/components/public/experiences/experiences-listing-section';
import { EmptyState } from '@/components/public/page-shell';
import { PublicPageHero } from '@/components/public/public-page-hero';
import { BENROSO_PUBLIC_HERO_IMAGES } from '@/config/benroso';
import {
  buildExperienceListingIntro,
  getExperienceCategoryBlurb
} from '@/features/experiences/public/listing-copy';
import {
  getExperienceCategories,
  listPublishedExperiences
} from '@/features/experiences/public/service';
import { localePath } from '@/lib/public/locale-path';
import { getPageHero } from '@/lib/public/site-data';
import { absoluteUrl } from '@/lib/seo';
import { cn } from '@/lib/utils';

type ExperiencesPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
};

const experiencesDescription =
  'Explore Benroso Safaris experiences for family travel, honeymoons, migration routes, private guiding, and special-interest trips across Kenya, Tanzania, Uganda, Rwanda, and South Africa.';

export async function generateMetadata({ params }: ExperiencesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const canonical = absoluteUrl(`/${locale}/experiences`);

  return {
    title: 'Safari Experiences | Benroso Safaris',
    description: experiencesDescription,
    alternates: { canonical },
    openGraph: {
      title: 'Safari Experiences | Benroso Safaris',
      description: experiencesDescription,
      url: canonical,
      type: 'website'
    }
  };
}

export default async function ExperiencesPage({ params, searchParams }: ExperiencesPageProps) {
  const { locale } = await params;
  const { category } = await searchParams;
  const activeCategory = category?.trim() || undefined;

  const [experiences, categories, pageHero] = await Promise.all([
    listPublishedExperiences({ category: activeCategory, locale }),
    getExperienceCategories(locale),
    getPageHero('experiences')
  ]);

  const intro = buildExperienceListingIntro(categories);
  const categoryBlurb = getExperienceCategoryBlurb(activeCategory);
  const hero = BENROSO_PUBLIC_HERO_IMAGES.experiences;

  return (
    <>
      <PublicPageHero
        breadcrumbStyle='pipe-uppercase'
        breadcrumbs={[{ href: localePath(locale), label: 'Home' }, { label: 'Safari Experiences' }]}
        cta={{ href: localePath(locale, '/contact'), label: 'Help me plan' }}
        ctaVariant='ghost-hero'
        eyebrow='Unforgettable Wildlife Encounters'
        eyebrowTone='white'
        hero={pageHero}
        imageAlt={hero.imageAlt}
        imageUrl={hero.imageUrl}
        showGoldLine={false}
        title='Safari Experiences'
        titleTone='gold'
      />
      <ExperienceListingIntro intro={intro} />
      <ExperienceAfricaMap />
      <ExperiencesListingSection
        filters={
          <div className='space-y-4'>
            <h2 className='benroso-heading font-display text-xl'>Filter By Type</h2>
            <ul className='space-y-2 text-sm'>
              <li>
                <a
                  className={cn(
                    'transition-colors hover:text-[var(--benroso-primary)] hover:underline',
                    !activeCategory
                      ? 'font-semibold text-[var(--benroso-primary)]'
                      : 'text-[var(--benroso-ink)]'
                  )}
                  href={localePath(locale, '/experiences')}
                >
                  All Experiences
                </a>
              </li>
              {categories.map((entry) => {
                const href = localePath(
                  locale,
                  `/experiences?category=${encodeURIComponent(entry)}`
                );
                const isActive = activeCategory === entry;

                return (
                  <li key={entry}>
                    <a
                      className={cn(
                        'transition-colors hover:text-[var(--benroso-primary)] hover:underline',
                        isActive
                          ? 'font-semibold text-[var(--benroso-primary)]'
                          : 'text-[var(--benroso-ink)]'
                      )}
                      href={href}
                    >
                      {entry}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        }
      >
        {activeCategory && categoryBlurb ? (
          <div className='mb-8 rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white p-6'>
            <p className='benroso-eyebrow'>{activeCategory} Safaris</p>
            <p className='mt-3 text-[15px] leading-7 text-[var(--benroso-ink)]'>{categoryBlurb}</p>
          </div>
        ) : null}

        {experiences.length ? (
          <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
            {experiences.map((experience) => (
              <ExperienceCard
                item={{
                  category: experience.category,
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
            message={
              activeCategory
                ? `No published experiences match "${activeCategory}" yet. Try another category or contact us for a tailor-made safari.`
                : 'Published experiences will appear here once they are added through the Benroso CMS.'
            }
            title={
              activeCategory ? 'No experiences in this category' : 'No experiences published yet'
            }
          />
        )}
      </ExperiencesListingSection>
    </>
  );
}
