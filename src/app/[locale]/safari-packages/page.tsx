import { PackageCard } from '@/components/public/cards/content-cards';
import { EmptyState, ListingShell } from '@/components/public/page-shell';
import { PublicPageHero } from '@/components/public/public-page-hero';
import { BENROSO_PUBLIC_HERO_IMAGES } from '@/config/benroso';
import { localePath } from '@/lib/public/locale-path';
import { getPageHero, getPublicPackages } from '@/lib/public/site-data';

type SafariPackagesPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function SafariPackagesPage({ params }: SafariPackagesPageProps) {
  const { locale } = await params;
  const [packages, pageHero] = await Promise.all([
    getPublicPackages(locale, 36),
    getPageHero('packages')
  ]);
  const hero = BENROSO_PUBLIC_HERO_IMAGES.tours;

  return (
    <>
      <PublicPageHero
        breadcrumbs={[{ href: localePath(locale), label: 'Home' }, { label: 'Safari Packages' }]}
        description='Curated safari package variants built from real Benroso trip routes, with clear comfort tiers and pricing guidance.'
        eyebrow='Safari Packages'
        hero={pageHero}
        imageAlt={hero.imageAlt}
        imageUrl={hero.imageUrl}
        title='Safari Packages'
      />
      <ListingShell
        filters={
          <div className='space-y-4'>
            <h2 className='benroso-heading font-display text-xl'>Packages vs Trips</h2>
            <p className='text-sm leading-6 text-[var(--benroso-muted)]'>
              Trips are the route and day-by-day itinerary. Packages are budget, mid-range, luxury,
              or deal variants of those trips.
            </p>
          </div>
        }
      >
        <div className='mb-6 flex items-baseline justify-between gap-3'>
          <h2 className='benroso-heading font-display text-2xl'>Available Packages</h2>
          <span className='text-sm text-[var(--benroso-muted)]'>
            {packages.length} {packages.length === 1 ? 'package' : 'packages'} found
          </span>
        </div>
        {packages.length ? (
          <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
            {packages.map((item) => (
              <PackageCard item={item} key={item.id} />
            ))}
          </div>
        ) : (
          <EmptyState
            actionHref={localePath(locale, '/contact')}
            actionLabel='Plan a Custom Safari'
            message='Published package variants will appear here once they are added through the Benroso CMS.'
            title='No packages published yet'
          />
        )}
      </ListingShell>
    </>
  );
}
