import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { DestinationDetailShell } from '@/components/public/destinations/destination-detail-shell';
import { DestinationTripsSection } from '@/components/public/destinations/destination-trips-section';
import { FaqSection } from '@/components/public/faq-section';
import { ParkScrollTabs, type ParkTab } from '@/components/public/national-parks/park-scroll-tabs';
import { RouteAccommodationsSection } from '@/components/public/tours/route-accommodations-section';
import {
  getDestinationAccommodations,
  getDestinationTours,
  getPublicDestinationDetail
} from '@/lib/public/site-data';
import { formatTourPrice } from '@/lib/public/tour-format';
import { createClient } from '@/lib/supabase/server';
import { absoluteUrl, buildAlternates, buildDestinationJsonLd, buildFaqJsonLd } from '@/lib/seo';

type DestinationPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

type DestinationTranslation = {
  destination: { id: string; country: string | null; status: string };
  faqs: unknown;
  locale: string;
  name: string;
  og_image?: { alt: string | null; url: string | null } | null;
  seo_description: string | null;
  seo_title: string | null;
  slug: string;
  summary: string | null;
};

export async function generateMetadata(props: DestinationPageProps): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const supabase = await createClient();

  const { data: destination } = await supabase
    .from('destination_translations')
    .select(
      `
      slug,
      locale,
      name,
      summary,
      seo_title,
      seo_description,
      og_image:media_assets!destination_translations_og_image_id_fkey(url, alt),
      destination:destinations!inner(id, status, country)
    `
    )
    .eq('locale', locale)
    .eq('slug', slug)
    .eq('destination.status', 'published')
    .single<DestinationTranslation>();

  if (!destination) notFound();

  const canonical = absoluteUrl(`/${locale}/destinations/${destination.slug}`);
  const title = destination.seo_title || `${destination.name} Safari Guide | Benroso Safaris`;
  const description = destination.seo_description || destination.summary || '';

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: await buildAlternates({
        table: 'destination_translations',
        parentId: destination.destination.id,
        parentKey: 'destination_id',
        pathBuilder: (item) => `/${item.locale}/destinations/${item.slug}`
      })
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      images: destination.og_image?.url
        ? [{ url: destination.og_image.url, alt: destination.og_image.alt || title }]
        : []
    }
  };
}

export default async function DestinationDetailPage(props: DestinationPageProps) {
  const { locale, slug } = await props.params;
  const destination = await getPublicDestinationDetail(locale, slug);

  if (!destination) notFound();

  const [tours, accommodations] = await Promise.all([
    getDestinationTours(locale, destination.id),
    getDestinationAccommodations(locale, destination.id)
  ]);

  const jsonLd = buildDestinationJsonLd(
    {
      country: destination.country,
      description: destination.descriptionHtml ?? undefined,
      faqs: destination.faqs,
      locale,
      name: destination.name,
      region: destination.region,
      slug: destination.slug,
      summary: destination.summary,
      title: destination.name
    },
    `/${locale}/destinations/${destination.slug}`
  );
  const faqJsonLd = buildFaqJsonLd(destination.faqs);
  const tabs: ParkTab[] = [
    destination.descriptionHtml ? { id: 'why-go', label: 'Why Go' } : null,
    destination.wildlife.length ? { id: 'where-to-go', label: 'Where To Go' } : null,
    destination.bestTime ? { id: 'when-to-go', label: 'When To Go' } : null,
    { id: 'tours-safaris', label: 'Tours & Safaris' },
    accommodations.length ? { id: 'accommodation', label: 'Accommodation' } : null,
    tours.length ? { id: 'costs', label: 'Costs' } : null,
    { id: 'travel-info', label: 'Travel Info' }
  ].filter((tab): tab is ParkTab => tab !== null);

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqJsonLd ? (
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}
      <ParkScrollTabs tabs={tabs} />
      <DestinationDetailShell destination={destination} locale={locale} />
      <DestinationTripsSection destinationName={destination.name} locale={locale} tours={tours} />
      {accommodations.length ? (
        <section className='benroso-section scroll-mt-36 bg-white' id='accommodation'>
          <div className='benroso-container'>
            <RouteAccommodationsSection
              accommodations={accommodations}
              description={`These properties are linked through safari routes that include ${destination.name}, keeping accommodation recommendations relevant to the destination.`}
              id='destination-accommodation-list'
              title={`Places to Stay Around ${destination.name}`}
            />
          </div>
        </section>
      ) : null}
      {tours.length ? (
        <DestinationCostsSection destinationName={destination.name} tours={tours} />
      ) : null}
      <section className='benroso-section scroll-mt-36 bg-white' id='travel-info'>
        <div className='benroso-container'>
          <div className='rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-[var(--benroso-ivory)] p-6 md:p-8'>
            <p className='benroso-eyebrow'>Travel Info</p>
            <h2 className='benroso-heading mt-3 font-display text-2xl'>Visa & Planning Notes</h2>
            <p className='benroso-body mt-3 max-w-2xl text-base leading-7'>
              Visa, entry, and seasonal planning guidance can be handled by the Benroso team during
              enquiry. Destination-specific travel notes can be added to the CMS as this section
              grows.
            </p>
          </div>
        </div>
      </section>
      {destination.faqs.length ? (
        <FaqSection faqs={destination.faqs} headingId='destination-faq-heading' />
      ) : null}
    </>
  );
}

function DestinationCostsSection({
  destinationName,
  tours
}: {
  destinationName: string;
  tours: Awaited<ReturnType<typeof getDestinationTours>>;
}) {
  const prices = tours.flatMap((tour) => {
    const values = [tour.minPrice, tour.maxPrice, tour.priceFrom].filter(
      (price): price is number => typeof price === 'number' && Number.isFinite(price)
    );
    return values;
  });
  const min = prices.length ? Math.min(...prices) : null;
  const max = prices.length ? Math.max(...prices) : null;

  return (
    <section className='benroso-section scroll-mt-36 bg-[var(--benroso-ivory)]' id='costs'>
      <div className='benroso-container'>
        <div className='grid gap-8 rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white p-6 md:grid-cols-[1fr_280px] md:p-8'>
          <div>
            <p className='benroso-eyebrow'>Costs</p>
            <h2 className='benroso-heading mt-3 font-display text-2xl'>
              {destinationName} Safari Cost Guide
            </h2>
            <p className='benroso-body mt-3 text-base leading-7'>
              Costs are based on published tours linked to this destination. Final quotes depend on
              travel dates, group size, lodge tier, and route adjustments.
            </p>
          </div>
          <div className='rounded-[var(--benroso-radius)] bg-[var(--benroso-primary)] p-5 text-white'>
            <span className='block text-xs font-bold uppercase tracking-[0.14em] text-white/70'>
              Published Range
            </span>
            <strong className='mt-2 block font-display text-3xl'>
              {min ? formatTourPrice(min) : 'On request'}
            </strong>
            {max && max !== min ? (
              <span className='mt-1 block text-sm text-white/75'>to {formatTourPrice(max)}</span>
            ) : null}
            <span className='mt-3 block text-xs text-white/65'>per person guidance</span>
          </div>
        </div>
      </div>
    </section>
  );
}
