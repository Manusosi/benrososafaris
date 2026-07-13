import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ExperienceDetailShell } from '@/components/public/experience-detail-shell';
import {
  getPublishedExperienceBySlug,
  getRelatedAccommodationsForExperience,
  getRelatedToursForExperience
} from '@/features/experiences/public/service';
import { absoluteUrl, buildAlternates, buildFaqJsonLd } from '@/lib/seo';

type ExperiencePageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export async function generateMetadata(props: ExperiencePageProps): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const experience = await getPublishedExperienceBySlug(locale, slug);

  if (!experience) notFound();

  const canonical = absoluteUrl(`/${locale}/experiences/${experience.slug}`);
  const title = experience.seoTitle || `${experience.title} | Benroso Safaris`;
  const description = experience.seoDescription || experience.summary || '';

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: await buildAlternates({
        table: 'experience_translations',
        parentId: experience.experienceId,
        parentKey: 'experience_id',
        pathBuilder: (item) => `/${item.locale}/experiences/${item.slug}`
      })
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      images: experience.imageUrl
        ? [{ url: experience.imageUrl, alt: experience.imageAlt || title }]
        : []
    }
  };
}

export default async function ExperienceDetailPage(props: ExperiencePageProps) {
  const { locale, slug } = await props.params;
  const experience = await getPublishedExperienceBySlug(locale, slug);

  if (!experience) notFound();

  const [tours, accommodations] = await Promise.all([
    getRelatedToursForExperience(experience.experienceId, locale),
    getRelatedAccommodationsForExperience(experience.experienceId, locale)
  ]);

  const faqJsonLd = buildFaqJsonLd(experience.faqs);

  return (
    <>
      {faqJsonLd ? (
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}
      <ExperienceDetailShell
        accommodations={accommodations}
        experience={experience}
        locale={locale}
        tours={tours}
      />
    </>
  );
}
