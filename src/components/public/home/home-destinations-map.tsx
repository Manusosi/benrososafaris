import { ExperienceAfricaMap } from '@/components/public/experiences/experience-africa-map';
import { SectionHeader } from '@/components/public/ui/section-header';

export function HomeDestinationsMap() {
  return (
    <section className='bg-[var(--benroso-warm-gray)]'>
      <div className='benroso-container pt-16 md:pt-20 lg:pt-24'>
        <SectionHeader
          description='Five countries, one team. Tap a country on the map to see what we plan there, from the Mara to the Cape.'
          eyebrow='Where We Operate'
          title='Authentic East & Southern Africa'
        />
      </div>

      <ExperienceAfricaMap />
    </section>
  );
}
