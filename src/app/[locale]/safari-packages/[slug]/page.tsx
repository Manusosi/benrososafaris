import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { TourPricingTable } from '@/components/public/tours/tour-pricing-table';
import { BenrosoButton } from '@/components/public/ui/benroso-button';
import { BenrosoButtonGroup } from '@/components/public/ui/benroso-button-group';
import { PublicPageHero } from '@/components/public/public-page-hero';
import { BENROSO_PUBLIC_HERO_IMAGES } from '@/config/benroso';
import { localePath } from '@/lib/public/locale-path';
import { formatComfortTierLabel } from '@/lib/public/site-data';
import { formatTourDuration, formatTourPrice } from '@/lib/public/tour-format';
import { getPublicPackageDetail } from '@/lib/public/site-data';
import { buildAlternates, buildMetadata } from '@/lib/seo';
import { createClient } from '@/lib/supabase/server';

type SafariPackageDetailPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export async function generateMetadata(props: SafariPackageDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const supabase = await createClient();

  const { data: safariPackage } = await supabase
    .from('package_translations')
    .select(
      `
      slug,
      locale,
      title,
      excerpt,
      seo_title,
      seo_description,
      package:packages!inner(id, status),
      og_image:media_assets!package_translations_og_image_id_fkey(url, alt)
    `
    )
    .eq('locale', locale)
    .eq('slug', slug)
    .eq('package.status', 'published')
    .not('published_at', 'is', null)
    .maybeSingle();

  if (!safariPackage) return {};

  const parent = Array.isArray(safariPackage.package)
    ? safariPackage.package[0]
    : safariPackage.package;
  if (!parent?.id) return {};

  const title = safariPackage.seo_title || `${safariPackage.title} | Safari Package`;
  const description = safariPackage.seo_description || safariPackage.excerpt;
  const languages = await buildAlternates({
    parentId: parent.id,
    parentKey: 'package_id',
    pathBuilder: (item) => `/${item.locale}/safari-packages/${item.slug}`,
    table: 'package_translations'
  });
  const ogImage = safariPackage.og_image as { alt?: string | null; url?: string | null } | null;

  return buildMetadata({
    canonicalPath: `/${locale}/safari-packages/${slug}`,
    description,
    imageAlt: ogImage?.alt ?? safariPackage.title,
    imageUrl: ogImage?.url ?? undefined,
    languages,
    title
  });
}

export default async function SafariPackageDetailPage({ params }: SafariPackageDetailPageProps) {
  const { locale, slug } = await params;
  const safariPackage = await getPublicPackageDetail(locale, slug);
  if (!safariPackage) notFound();

  const hero = BENROSO_PUBLIC_HERO_IMAGES.tours;
  const linkedTour = safariPackage.linkedTour;
  const packagePrice = formatTourPrice(safariPackage.priceFrom);

  return (
    <>
      <PublicPageHero
        breadcrumbs={[
          { href: localePath(locale), label: 'Home' },
          { href: localePath(locale, '/safari-packages'), label: 'Safari Packages' },
          { label: safariPackage.title }
        ]}
        description={
          safariPackage.excerpt ??
          linkedTour?.excerpt ??
          'A Benroso Safaris package shaped around route, season, group size, and comfort level.'
        }
        eyebrow={formatComfortTierLabel(safariPackage.comfortTier)}
        imageAlt={safariPackage.imageAlt ?? hero.imageAlt}
        imageUrl={safariPackage.imageUrl ?? hero.imageUrl}
        overlayTone='black'
        title={safariPackage.title}
      />

      <section className='bg-white'>
        <div className='benroso-container py-10 md:py-14'>
          <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10'>
            <article>
              <section>
                <h2 className='benroso-heading font-display text-[clamp(1.9rem,3vw,2.55rem)] leading-tight'>
                  Package Overview
                </h2>
                <div className='mt-5 grid gap-3 sm:grid-cols-3'>
                  <PackageFact
                    label='Comfort'
                    value={formatComfortTierLabel(safariPackage.comfortTier)}
                  />
                  <PackageFact
                    label='Duration'
                    value={
                      linkedTour
                        ? formatTourDuration(linkedTour.days, linkedTour.nights)
                        : 'Custom safari'
                    }
                  />
                  <PackageFact label='From' value={packagePrice ?? 'On request'} />
                </div>
                {safariPackage.contentHtml ? (
                  <div
                    className='benroso-legal-prose mt-7'
                    dangerouslySetInnerHTML={{ __html: safariPackage.contentHtml }}
                  />
                ) : safariPackage.excerpt ? (
                  <p className='benroso-body mt-7 text-lg leading-8'>{safariPackage.excerpt}</p>
                ) : null}
              </section>

              {linkedTour ? (
                <section className='mt-12 border-t border-[var(--benroso-line)] pt-10'>
                  <h2 className='benroso-heading font-display text-[clamp(1.75rem,2.6vw,2.35rem)] leading-tight'>
                    Linked Safari Route
                  </h2>
                  <p className='benroso-body mt-3 max-w-2xl text-base leading-7'>
                    This package is built on {linkedTour.title}. Compare the route, itinerary, and
                    inclusions on the full trip detail page.
                  </p>
                  <div className='mt-6'>
                    <BenrosoButton href={linkedTour.href}>View Full Trip</BenrosoButton>
                  </div>
                </section>
              ) : null}

              {safariPackage.pricingTier ? (
                <section className='mt-12 border-t border-[var(--benroso-line)] pt-10'>
                  <h2 className='benroso-heading font-display text-[clamp(1.75rem,2.6vw,2.35rem)] leading-tight'>
                    Package Price Table
                  </h2>
                  <p className='benroso-body mt-3 max-w-2xl text-base leading-7'>
                    Prices are per person and vary by season, group size, rooming, and lodge
                    availability.
                  </p>
                  <div className='mt-6'>
                    <TourPricingTable locale={locale} tiers={[safariPackage.pricingTier]} />
                  </div>
                </section>
              ) : null}
            </article>

            <aside className='h-fit lg:sticky lg:top-[calc(var(--benroso-header-h)+5.25rem)]'>
              <div className='benroso-contact-credentials-box'>
                <p className='text-xs font-bold uppercase tracking-[0.14em] text-[var(--benroso-muted)]'>
                  Package from
                </p>
                <strong className='mt-2 block font-display text-3xl text-[var(--benroso-brown)]'>
                  {packagePrice ?? 'Custom quote'}
                </strong>
                <p className='benroso-body mt-4 text-sm leading-6'>
                  Request the exact quote for your dates, preferred comfort level, and number of
                  travelers.
                </p>
                <BenrosoButtonGroup className='mt-5'>
                  <BenrosoButton href={localePath(locale, '/contact')}>
                    Enquire About Package
                  </BenrosoButton>
                  {linkedTour ? (
                    <BenrosoButton href={linkedTour.href} variant='accent-outline'>
                      View Full Trip
                    </BenrosoButton>
                  ) : null}
                </BenrosoButtonGroup>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}

function PackageFact({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-[var(--benroso-ivory)] p-4'>
      <span className='block text-xs font-bold uppercase tracking-[0.12em] text-[var(--benroso-muted)]'>
        {label}
      </span>
      <strong className='mt-1 block text-[var(--benroso-heading)]'>{value}</strong>
    </div>
  );
}
