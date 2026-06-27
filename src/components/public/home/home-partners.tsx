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
  { name: 'TripAdvisor', logoUrl: '/assets/tripadvisor-logo-primary.svg' },
  { name: 'SafariBookings.com', logoUrl: '/assets/safari_bookings.png' },
  { name: 'KPSGA' },
  { name: 'Tourism Regulatory Authority' },
  { name: 'Magical Kenya' },
  { name: 'Ol Pejeta Conservancy' },
  { name: 'Maasai Mara Reserve' }
];

function PartnerBadge({ partner }: { partner: Partner }) {
  return (
    <div className='mx-4 flex h-20 w-44 shrink-0 items-center justify-center rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white px-6'>
      {partner.logoUrl ? (
        <Image
          alt={partner.name}
          className='max-h-12 w-auto object-contain'
          height={48}
          src={partner.logoUrl}
          width={120}
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
    <section className='border-y border-[var(--benroso-line)] bg-[var(--benroso-ivory)]'>
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
