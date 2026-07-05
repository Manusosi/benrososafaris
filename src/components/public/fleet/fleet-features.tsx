import { Icons } from '@/components/icons';
import { TrustedChecklist } from '@/components/public/home/home-trusted-checklist';
import { BenrosoButton } from '@/components/public/ui/benroso-button';
import { FLEET_FEATURE_ITEMS } from '@/lib/public/fleet-content';
import { localePath } from '@/lib/public/locale-path';

type FleetFeaturesProps = {
  locale: string;
};

export function FleetFeatures({ locale }: FleetFeaturesProps) {
  const contactHref = localePath(locale, '/contact');
  const guidesHref = localePath(locale, '/about#team');

  return (
    <section className='border-t border-[var(--benroso-line)] bg-[var(--benroso-ivory)]'>
      <div className='benroso-container py-14 md:py-16 lg:py-20'>
        <div className='mx-auto max-w-5xl'>
          <div className='grid gap-10 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,1fr)_19rem] xl:gap-12'>
            <div>
              <div className='text-center lg:text-left'>
                <p className='benroso-eyebrow'>What You Can Expect</p>
                <h2 className='benroso-heading mt-3 font-display text-[clamp(1.75rem,3vw,2.35rem)] leading-tight'>
                  Fleet Features That Matter on Safari
                </h2>
                <span aria-hidden className='benroso-gold-line mt-5 lg:mx-0 lg:[margin-inline:0]' />
              </div>
              <TrustedChecklist
                className='mt-8 space-y-4 md:mt-10 md:space-y-5'
                itemClassName='text-base leading-8 md:text-[17px] md:leading-8'
                items={[...FLEET_FEATURE_ITEMS]}
              />
            </div>

            <aside className='mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none lg:pt-6'>
              <div className='rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white p-6 shadow-[0_18px_40px_-28px_rgba(28,42,31,0.35)] md:p-7'>
                <p className='benroso-eyebrow'>Plan With Us</p>
                <h3 className='benroso-heading mt-3 font-display text-xl leading-tight md:text-2xl'>
                  Ready to plan your safari?
                </h3>
                <p className='benroso-body mt-3 text-sm leading-7 text-[var(--benroso-muted)]'>
                  Share your dates and travel style. We will match the right vehicle and guide.
                </p>
                <div className='mt-6 flex flex-col gap-3'>
                  <BenrosoButton className='group w-full' href={contactHref} variant='primary'>
                    <Icons.mail className='h-4 w-4 transition-transform duration-300 group-hover:scale-110' />
                    Plan My Safari
                  </BenrosoButton>
                  <BenrosoButton
                    className='group w-full'
                    href={guidesHref}
                    variant='accent-outline'
                  >
                    <Icons.teams className='h-4 w-4 transition-transform duration-300 group-hover:scale-110' />
                    Meet Our Guides
                  </BenrosoButton>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
