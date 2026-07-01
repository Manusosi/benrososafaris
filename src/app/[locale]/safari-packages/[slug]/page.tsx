import { notFound } from 'next/navigation';

import { TourDetailShell } from '@/components/public/tour-detail-shell';
import { EmptyState } from '@/components/public/page-shell';
import { formatComfortTierLabel } from '@/lib/public/tour-format';
import { localePath } from '@/lib/public/locale-path';
import { getPublicPackageDetail } from '@/lib/public/site-data';
import { buildTouristTripJsonLd } from '@/lib/seo';

type SafariPackageDetailPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export default async function SafariPackageDetailPage({ params }: SafariPackageDetailPageProps) {
  const { locale, slug } = await params;
  const item = await getPublicPackageDetail(locale, slug);

  if (!item) notFound();

  if (!item.linkedTour) {
    return (
      <main className='benroso-section bg-[var(--benroso-ivory)]'>
        <div className='benroso-container'>
          <EmptyState
            actionHref={localePath(locale, '/contact')}
            actionLabel='Ask About This Package'
            message='This package is published but is not linked to a trip route yet.'
            title={item.title}
          />
        </div>
      </main>
    );
  }

  const jsonLd = buildTouristTripJsonLd(
    {
      days: item.linkedTour.days,
      excerpt: item.excerpt,
      locale,
      price_from: item.priceFrom,
      slug: item.slug,
      title: item.title
    },
    `/${locale}/safari-packages/${item.slug}`
  );

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TourDetailShell
        breadcrumbParent={{
          href: localePath(locale, '/safari-packages'),
          label: 'Safari Packages'
        }}
        description={item.excerpt}
        eyebrow={formatComfortTierLabel(item.comfortTier)}
        introHtml={item.contentHtml}
        locale={locale}
        pricingTiers={item.pricingTier ? [item.pricingTier] : []}
        title={item.title}
        tour={item.linkedTour}
      />
    </>
  );
}
