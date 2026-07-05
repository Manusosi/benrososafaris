import type { Metadata } from 'next';

import { ContactHero } from '@/components/public/contact/contact-hero';
import { FaqSection } from '@/components/public/faq-section';
import { FleetFeatures } from '@/components/public/fleet/fleet-features';
import { FleetGallery } from '@/components/public/fleet/fleet-gallery';
import { FleetIntro } from '@/components/public/fleet/fleet-intro';
import { FLEET_FAQS, FLEET_PAGE_HERO_DESCRIPTION } from '@/lib/public/fleet-content';
import { getFleetGalleryImages } from '@/lib/public/fleet';
import { localePath } from '@/lib/public/locale-path';
import { heroHasMedia } from '@/lib/public/page-heroes';
import { getPageHero } from '@/lib/public/site-data';
import { absoluteUrl } from '@/lib/seo';

type FleetPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: FleetPageProps): Promise<Metadata> {
  const { locale } = await params;
  const canonical = absoluteUrl(`/${locale}/our-fleet`);

  return {
    title: 'Our Safari Fleet | Benroso Safaris',
    description: FLEET_PAGE_HERO_DESCRIPTION,
    alternates: { canonical },
    openGraph: {
      title: 'Our Safari Fleet | Benroso Safaris',
      description: FLEET_PAGE_HERO_DESCRIPTION,
      type: 'website',
      url: canonical
    }
  };
}

export default async function FleetPage({ params }: FleetPageProps) {
  const { locale } = await params;
  const [images, pageHero] = await Promise.all([
    getFleetGalleryImages(locale),
    getPageHero('fleet')
  ]);
  const heroImageUrl = images[0]?.url ?? '/assets/benroso-fleet-lion.png';
  const heroImageAlt = images[0]?.alt ?? 'Benroso Safaris safari vehicle on game drive';
  const useConfiguredHeroMedia = pageHero && heroHasMedia(pageHero);

  return (
    <>
      <ContactHero
        breadcrumbs={[{ href: localePath(locale), label: 'Home' }, { label: 'Our Fleet' }]}
        description={pageHero?.subheading ?? FLEET_PAGE_HERO_DESCRIPTION}
        eyebrow={pageHero?.eyebrow ?? 'Safari Fleet'}
        hero={useConfiguredHeroMedia ? pageHero : null}
        imageUrl={heroImageUrl}
        title={pageHero?.heading ?? 'Our Safari Fleet'}
      />
      <span className='sr-only'>{heroImageAlt}</span>

      <FleetIntro />

      <section className='bg-white'>
        <div className='benroso-container py-12 md:py-16'>
          <div className='mx-auto max-w-3xl text-center'>
            <p className='benroso-eyebrow'>Our Vehicles</p>
            <h2 className='benroso-heading mt-3 font-display text-[clamp(1.75rem,3vw,2.35rem)] leading-tight'>
              Safari Fleet Gallery
            </h2>
            <span aria-hidden className='benroso-gold-line mt-5' />
          </div>
          <div className='mx-auto mt-10 max-w-6xl'>
            <FleetGallery images={images} locale={locale} />
          </div>
        </div>
      </section>

      <FleetFeatures locale={locale} />

      <FaqSection
        description='Practical answers about the vehicles and guides you travel with on a Benroso safari.'
        eyebrow='Fleet FAQ'
        faqs={FLEET_FAQS}
        headingId='fleet-faq-heading'
        title='Common fleet questions'
      />
    </>
  );
}
