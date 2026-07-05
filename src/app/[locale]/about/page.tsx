import { AboutHero } from '@/components/public/about/about-hero';
import { AboutTabs } from '@/components/public/about/about-tabs';
import { ABOUT_HERO_DEFAULTS } from '@/lib/public/about-content';
import { localePath } from '@/lib/public/locale-path';
import { getPageHero } from '@/lib/public/site-data';
import { getPublishedTeamMembers } from '@/lib/public/team';

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  const [pageHero, teamMembers] = await Promise.all([
    getPageHero('about'),
    getPublishedTeamMembers()
  ]);

  return (
    <>
      <AboutHero
        breadcrumbs={[{ href: localePath(locale), label: 'Home' }, { label: 'About Us' }]}
        description={ABOUT_HERO_DEFAULTS.description}
        eyebrow={ABOUT_HERO_DEFAULTS.eyebrow}
        hero={pageHero}
        title={pageHero?.heading ?? ABOUT_HERO_DEFAULTS.title}
      />
      <AboutTabs locale={locale} teamMembers={teamMembers} />
    </>
  );
}
