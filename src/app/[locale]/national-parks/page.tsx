import { DestinationCard } from '@/components/public/cards/content-cards';
import { EmptyState, PageHero } from '@/components/public/page-shell';
import { localePath } from '@/lib/public/locale-path';
import { getPublishedParks } from '@/lib/public/national-parks';
import { getPageHero } from '@/lib/public/site-data';

type NationalParksPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function NationalParksPage({ params }: NationalParksPageProps) {
  const { locale } = await params;
  const [parks, pageHero] = await Promise.all([
    getPublishedParks(locale),
    getPageHero('national-parks')
  ]);

  return (
    <>
      <PageHero
        breadcrumbs={[{ href: localePath(locale), label: 'Home' }, { label: 'National Parks' }]}
        description='Guides to Kenya and Tanzania national parks, wildlife seasons, and the safaris that visit each one.'
        eyebrow='National Parks'
        hero={pageHero}
        title='National Parks & Reserves'
      />
      <section className='benroso-section bg-[var(--benroso-ivory)]'>
        <div className='benroso-container'>
          {parks.length ? (
            <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
              {parks.map((park) => (
                <DestinationCard
                  key={park.slug}
                  item={{
                    href: localePath(locale, `/national-parks/${park.slug}`),
                    title: park.name,
                    excerpt: park.summary,
                    country: park.country?.toLowerCase() ?? null,
                    imageUrl: park.imageUrl,
                    imageAlt: park.imageAlt
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              actionHref={localePath(locale, '/contact')}
              actionLabel='Contact Our Team'
              message='Published national park guides will appear here automatically once added in the portal.'
              title='Content coming soon'
            />
          )}
        </div>
      </section>
    </>
  );
}
