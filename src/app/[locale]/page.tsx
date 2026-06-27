import {
  HomeDestinations,
  HomeEditorial,
  HomeFeaturedTours,
  HomeHero,
  HomeServices,
  HomeTrustCta,
  HomeWhyChooseUs
} from '@/components/public/home/home-sections';
import { HomeReviews } from '@/components/public/home/home-reviews';
import { HomeNewsletter } from '@/components/public/home-newsletter';
import {
  getPublicDestinations,
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
  const [siteSettings, destinations, tours] = await Promise.all([
    getPublicSiteSettings(),
    getPublicDestinations(locale),
    getPublicTours(locale)
  ]);

  return (
    <>
      <HomeHero locale={locale} siteSettings={siteSettings} />
      <HomeWhyChooseUs />
      <HomeEditorial locale={locale} />
      <HomeDestinations destinations={destinations} locale={locale} />
      <HomeServices />
      <HomeFeaturedTours locale={locale} tours={tours} />
      <HomeReviews />
      <HomeTrustCta locale={locale} siteSettings={siteSettings} />
      <HomeNewsletter />
    </>
  );
}
