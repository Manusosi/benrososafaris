import type { Metadata } from 'next';

import { PackageCard } from '@/components/public/cards/content-cards';
import { EmptyState, ListingShell } from '@/components/public/page-shell';
import { PublicPageHero } from '@/components/public/public-page-hero';
import { BENROSO_PUBLIC_HERO_IMAGES } from '@/config/benroso';
import { localePath } from '@/lib/public/locale-path';
import { getPageHero, getPublicPackages } from '@/lib/public/site-data';
import { buildListingPageMetadata } from '@/lib/seo/listing-metadata';

type SafariPackagesPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: SafariPackagesPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildListingPageMetadata({
    canonicalPath: `/${locale}/safari-packages`,
    defaultDescription:
      'Compare comfort-level packages linked to Benroso safari routes, then choose the budget, mid-range, or luxury style that fits your trip.',
    defaultTitle: 'Safari Packages',
    heroKey: 'packages',
    locale
  });
}

export default async function SafariPackagesPage({ params }: SafariPackagesPageProps) {
  const { locale } = await params;
  const [packages, pageHero] = await Promise.all([
    getPublicPackages(locale, 60),
    getPageHero('packages')
  ]);
  const hero = BENROSO_PUBLIC_HERO_IMAGES.tours;

  return (
    <>
      <PublicPageHero
        breadcrumbs={[{ href: localePath(locale), label: 'Home' }, { label: 'Safari Packages' }]}
        description='Compare comfort-level packages linked to Benroso safari routes, then choose the budget, mid-range, or luxury style that fits your trip.'
        eyebrow='Safari Packages'
        hero={pageHero}
        imageAlt={hero.imageAlt}
        imageUrl={hero.imageUrl}
        overlayTone='black'
        title='Safari Packages'
      />
      <ListingShell>
        <div className='mb-6 flex items-baseline justify-between gap-3'>
          <h2 className='benroso-heading font-display text-2xl'>Available Safari Packages</h2>
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
            actionLabel='Request Package Options'
            message='Published safari packages will appear here once they are added through the Benroso CMS.'
            title='No safari packages published yet'
          />
        )}
      </ListingShell>
    </>
  );
}
