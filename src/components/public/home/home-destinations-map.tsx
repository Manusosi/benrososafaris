import { ExperienceAfricaMap } from '@/components/public/experiences/experience-africa-map';
import { SectionHeader } from '@/components/public/ui/section-header';

type HomeDestinationsMapProps = {
  description?: string;
  eyebrow?: string;
  title?: string;
};

export function HomeDestinationsMap({
  description = 'Five countries, one team. Tap a country on the map to see what we plan there, from the Mara to the Cape.',
  eyebrow = 'Where We Operate',
  title = 'Authentic East & Southern Africa'
}: HomeDestinationsMapProps = {}) {
  return (
    <section className='bg-[var(--benroso-warm-gray)]'>
      <div className='benroso-container pt-16 md:pt-20 lg:pt-24'>
        <SectionHeader description={description} eyebrow={eyebrow} title={title} />
      </div>

      <ExperienceAfricaMap />
    </section>
  );
}
