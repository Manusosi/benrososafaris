import Image from 'next/image';

import { Icons } from '@/components/icons';
import { BenrosoButton } from '@/components/public/ui/benroso-button';
import { SectionHeader } from '@/components/public/ui/section-header';
import { BENROSO_KATO, BENROSO_SAFARI_BOOKINGS } from '@/config/benroso';
import type { AboutPartner } from '@/lib/public/about-placeholders';

type AboutPartnersSectionProps = {
  partners: AboutPartner[];
};

const CATEGORY_LABELS: Record<AboutPartner['category'], string> = {
  conservation: 'Conservation Partners',
  industry: 'Industry Affiliations',
  platform: 'Review Platforms',
  regulatory: 'Regulatory & Licensing'
};

export function AboutPartnersSection({ partners }: AboutPartnersSectionProps) {
  const categories = ['regulatory', 'industry', 'platform', 'conservation'] as const;

  return (
    <div className='space-y-0'>
      <section className='benroso-section border-b border-[var(--benroso-line)] bg-white'>
        <div className='benroso-container'>
          <SectionHeader
            description='Benroso Safaris operates under Kenyan tourism regulation and maintains active membership with industry bodies that hold us to professional safari standards.'
            eyebrow='Trust & Affiliations'
            title='Partners Who Stand Behind Our Safaris'
          />

          <div className='mx-auto mt-12 grid max-w-4xl gap-10 md:grid-cols-2'>
            <div className='text-center md:text-left'>
              <div className='mx-auto flex h-20 w-20 items-center justify-center md:mx-0'>
                <Image
                  alt={BENROSO_KATO.alt}
                  className='object-contain'
                  height={72}
                  src={BENROSO_KATO.logoPath}
                  width={72}
                />
              </div>
              <h3 className='benroso-heading mt-5 font-display text-xl'>KATO Bonded Member</h3>
              <p className='benroso-body mt-3 text-sm leading-7 text-[var(--benroso-muted)]'>
                Registered with the Kenya Association of Tour Operators and held to bonded operator
                standards.
              </p>
              <BenrosoButton className='mt-6' href={BENROSO_KATO.url} variant='accent-outline'>
                Verify on KATO
              </BenrosoButton>
            </div>

            <div className='text-center md:text-left'>
              <div className='mx-auto flex h-20 w-32 items-center justify-center md:mx-0'>
                <Image
                  alt={BENROSO_SAFARI_BOOKINGS.alt}
                  className='h-auto w-full object-contain'
                  height={BENROSO_SAFARI_BOOKINGS.logoHeight}
                  src={BENROSO_SAFARI_BOOKINGS.logoPath}
                  width={BENROSO_SAFARI_BOOKINGS.logoWidth}
                />
              </div>
              <h3 className='benroso-heading mt-5 font-display text-xl'>SafariBookings Verified</h3>
              <p className='benroso-body mt-3 text-sm leading-7 text-[var(--benroso-muted)]'>
                Read independent guest reviews and compare safari packages on our operator profile.
              </p>
              <BenrosoButton className='mt-6' href={BENROSO_SAFARI_BOOKINGS.url} variant='primary'>
                View Profile
              </BenrosoButton>
            </div>
          </div>
        </div>
      </section>

      {categories.map((category) => {
        const items = partners.filter((partner) => partner.category === category);
        if (!items.length) return null;

        return (
          <section
            className='benroso-section border-b border-[var(--benroso-line)] bg-white'
            key={category}
          >
            <div className='benroso-container'>
              <h2 className='benroso-heading font-display text-2xl md:text-3xl'>
                {CATEGORY_LABELS[category]}
              </h2>
              <ul className='mt-8 divide-y divide-[var(--benroso-line)] border-y border-[var(--benroso-line)]'>
                {items.map((partner) => (
                  <li className='flex gap-5 py-6 md:py-7' key={partner.id}>
                    <div className='flex h-14 w-14 shrink-0 items-center justify-center'>
                      {partner.logoPath ? (
                        <Image
                          alt={partner.name}
                          className='object-contain'
                          height={56}
                          src={partner.logoPath}
                          width={56}
                        />
                      ) : partner.id === 'partner-kato' ? (
                        <Image
                          alt={BENROSO_KATO.alt}
                          className='object-contain'
                          height={56}
                          src={BENROSO_KATO.logoPath}
                          width={56}
                        />
                      ) : (
                        <Icons.badgeCheck className='h-8 w-8 text-[var(--benroso-accent)]' />
                      )}
                    </div>
                    <div>
                      <h3 className='benroso-heading font-display text-lg'>
                        {partner.url ? (
                          <a
                            className='hover:text-[var(--benroso-primary)]'
                            href={partner.url}
                            rel='noopener noreferrer'
                            target='_blank'
                          >
                            {partner.name}
                          </a>
                        ) : (
                          partner.name
                        )}
                      </h3>
                      <p className='benroso-body mt-2 text-sm leading-7 text-[var(--benroso-muted)]'>
                        {partner.description}
                      </p>
                      {partner.url ? (
                        <a
                          className='mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-[var(--benroso-accent)]'
                          href={partner.url}
                          rel='noopener noreferrer'
                          target='_blank'
                        >
                          Visit partner
                          <Icons.externalLink className='h-3.5 w-3.5' />
                        </a>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      })}
    </div>
  );
}
