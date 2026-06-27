import {
  HomeFeaturedTours,
  HomeFleetGuides,
  HomeHero,
  HomeTrustCta,
  HomeWhyChooseUs
} from '@/components/public/home/home-sections';
import { ExperienceShowcase } from '@/components/public/home/experience-showcase';
import { HomeArticles } from '@/components/public/home/home-articles';
import { HomeBookingSteps } from '@/components/public/home/home-booking-steps';
import { HomeDestinationsMap } from '@/components/public/home/home-destinations-map';
import { HomeExperiencesGrid } from '@/components/public/home/home-experiences-grid';
import { HomeGoogleReviews } from '@/components/public/home/home-google-reviews';
import { HomePartners } from '@/components/public/home/home-partners';
import { HomeTrustBadges } from '@/components/public/home/home-trust-badges';
import { FaqSection } from '@/components/public/faq-section';
import { HOME_FAQS } from '@/lib/public/home-content';
import {
  getHeroSlides,
  getPublicBlogPosts,
  getPublicSiteSettings,
  getPublicTours
} from '@/lib/public/site-data';

type HomePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const [siteSettings, tours, blogPosts, heroSlides] = await Promise.all([
    getPublicSiteSettings(),
    getPublicTours(locale),
    getPublicBlogPosts(locale, 4),
    getHeroSlides()
  ]);

  return (
    <>
      <HomeHero locale={locale} slides={heroSlides} />
      <HomeTrustBadges />
      <ExperienceShowcase locale={locale} />
      <HomeDestinationsMap />
      <HomeExperiencesGrid locale={locale} />
      <HomeFeaturedTours locale={locale} tours={tours} />
      <HomeWhyChooseUs locale={locale} />
      <HomeBookingSteps locale={locale} />
      <HomeFleetGuides locale={locale} />
      <HomeGoogleReviews />
      <FaqSection
        eyebrow=''
        faqs={HOME_FAQS}
        headingId='home-faq-heading'
        title='Safari Questions, Answered'
      />
      <HomePartners />
      <HomeArticles locale={locale} posts={blogPosts} />
      <HomeTrustCta locale={locale} siteSettings={siteSettings} />
    </>
  );
}
