import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

import { HomeHero } from '@/components/public/home/home-hero';
import { FaqSection } from '@/components/public/faq-section';
import { listPublishedExperiences } from '@/features/experiences/public/service';
import {
  HOME_FAQS,
  HOME_SHOWCASE_ITEMS,
  resolveShowcaseItemHrefs
} from '@/lib/public/home-content';
import {
  getHeroSlides,
  getHomeReviews,
  getPageHero,
  getPublicBlogPosts,
  getPublicSiteSettings,
  getPublicTours
} from '@/lib/public/site-data';
import { buildListingPageMetadata } from '@/lib/seo/listing-metadata';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildListingPageMetadata({
    canonicalPath: `/${locale}`,
    defaultDescription:
      'Premium Kenya and Tanzania safari holidays with Benroso Safaris — tailor-made itineraries, expert guides, and trusted local support.',
    defaultTitle: 'Benroso Safaris | Kenya & Tanzania Safari Holidays',
    heroKey: 'home',
    locale
  });
}

const HomeWhyChooseUs = dynamic(
  () =>
    import('@/components/public/home/home-why-choose-us').then((module) => ({
      default: module.HomeWhyChooseUs
    })),
  { loading: () => null }
);

const ExperienceShowcase = dynamic(
  () =>
    import('@/components/public/home/experience-showcase').then((module) => ({
      default: module.ExperienceShowcase
    })),
  { loading: () => null }
);

const HomeDestinationsMap = dynamic(
  () =>
    import('@/components/public/home/home-destinations-map').then((module) => ({
      default: module.HomeDestinationsMap
    })),
  { loading: () => null }
);

const HomeExperiencesGrid = dynamic(
  () =>
    import('@/components/public/home/home-experiences-grid').then((module) => ({
      default: module.HomeExperiencesGrid
    })),
  { loading: () => null }
);

const HomeFeaturedTours = dynamic(
  () =>
    import('@/components/public/home/home-featured-tours').then((module) => ({
      default: module.HomeFeaturedTours
    })),
  { loading: () => null }
);

const HomeBookingSteps = dynamic(
  () =>
    import('@/components/public/home/home-booking-steps').then((module) => ({
      default: module.HomeBookingSteps
    })),
  { loading: () => null }
);

const HomeFleetGuides = dynamic(
  () =>
    import('@/components/public/home/home-fleet-guides').then((module) => ({
      default: module.HomeFleetGuides
    })),
  { loading: () => null }
);

const HomeGoogleReviews = dynamic(
  () =>
    import('@/components/public/home/home-google-reviews').then((module) => ({
      default: module.HomeGoogleReviews
    })),
  { loading: () => null }
);

const HomePartners = dynamic(
  () =>
    import('@/components/public/home/home-partners').then((module) => ({
      default: module.HomePartners
    })),
  { loading: () => null }
);

const HomeArticles = dynamic(
  () =>
    import('@/components/public/home/home-articles').then((module) => ({
      default: module.HomeArticles
    })),
  { loading: () => null }
);

const HomeTrustCta = dynamic(
  () =>
    import('@/components/public/home/home-trust-cta').then((module) => ({
      default: module.HomeTrustCta
    })),
  { loading: () => null }
);

export const revalidate = 300;

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const [siteSettings, tours, blogPosts, heroSlides, homeHero, reviews, experiences] =
    await Promise.all([
      getPublicSiteSettings(),
      getPublicTours(locale),
      getPublicBlogPosts(locale, 3),
      getHeroSlides(),
      getPageHero('home'),
      getHomeReviews(8),
      listPublishedExperiences({ locale })
    ]);

  const showcaseItems = resolveShowcaseItemHrefs(HOME_SHOWCASE_ITEMS, experiences);

  return (
    <>
      <HomeHero hero={homeHero} locale={locale} slides={heroSlides} />
      <Suspense fallback={null}>
        <HomeWhyChooseUs locale={locale} />
        <ExperienceShowcase items={showcaseItems} locale={locale} />
        <HomeDestinationsMap />
        <HomeExperiencesGrid experiences={experiences} locale={locale} />
        <HomeFeaturedTours locale={locale} tours={tours} />
        <HomeBookingSteps locale={locale} />
        <HomeFleetGuides locale={locale} />
        <HomeGoogleReviews reviews={reviews} />
      </Suspense>
      <FaqSection
        eyebrow=''
        faqs={HOME_FAQS}
        headingId='home-faq-heading'
        title='Safari Questions, Answered'
      />
      <Suspense fallback={null}>
        <HomePartners />
        <HomeArticles locale={locale} posts={blogPosts} />
        <HomeTrustCta locale={locale} siteSettings={siteSettings} />
      </Suspense>
    </>
  );
}
