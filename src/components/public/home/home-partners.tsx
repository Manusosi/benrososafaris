import Image from 'next/image';

import { SectionHeader } from '@/components/public/ui/section-header';

type Partner = {
  name: string;
  logoUrl?: string;
};

/**
 * Accreditations and partners. Drop logo files into /public/assets/partners and
 * set `logoUrl` to show an image instead of the text badge fallback.
 */
const PARTNERS: Partner[] = [
  { name: 'KATO', logoUrl: '/assets/kato-logo.jpg' },
  { name: 'ATTA', logoUrl: '/assets/ATTA-Logo-with-Icon-4.jpg' },
  { name: 'TripAdvisor', logoUrl: '/assets/tripadvisor-logo-primary.svg' },
  { name: 'SafariBookings.com', logoUrl: '/assets/safari_bookings.png' },
  { name: 'Magical Kenya', logoUrl: '/assets/magicalkenya.jpg' },
  { name: 'KPSGA', logoUrl: '/assets/KPSGA.jpg' },
  { name: 'Tourism Regulatory Authority', logoUrl: '/assets/TRA.png' }
];

function PartnerBadge({ partner }: { partner: Partner }) {
  return (
    <div className='mx-8 flex h-24 w-48 shrink-0 items-center justify-center md:mx-12 md:w-52'>
      {partner.logoUrl ? (
        <Image
          alt={partner.name}
          className='max-h-16 w-auto object-contain transition duration-300 hover:scale-105'
          height={72}
          src={partner.logoUrl}
          width={180}
        />
      ) : (
        <span className='text-center text-sm font-semibold leading-tight text-[var(--benroso-primary)]'>
          {partner.name}
        </span>
      )}
    </div>
  );
}

export function HomePartners() {
  const loop = [...PARTNERS, ...PARTNERS];

  return (
    <section className='border-y border-[var(--benroso-line)] bg-white'>
      <div className='benroso-container py-14 md:py-16'>
        <SectionHeader
          description='Benroso Safaris works alongside the bodies and partners that keep East African travel safe, responsible, and world class.'
          title='Trusted & Recognised'
        />
      </div>

      <div className='benroso-marquee-track overflow-hidden pb-14'>
        <div className='benroso-marquee'>
          {loop.map((partner, index) => (
            <PartnerBadge key={`${partner.name}-${index}`} partner={partner} />
          ))}
        </div>
      </div>
    </section>
  );
}
