'use client';

import { Icons } from '@/components/icons';
import { BENROSO_WHATSAPP } from '@/config/benroso';
import { whatsAppHref } from '@/lib/public/whatsapp';

/**
 * Persistent WhatsApp call-to-action pinned to the bottom-right of every public
 * page. Sits opposite the Tawk.to live-chat widget (bottom-left) so the two
 * channels never overlap. Reuses the shared BENROSO_WHATSAPP contact + message.
 */
export function FloatingWhatsApp() {
  const href = whatsAppHref(BENROSO_WHATSAPP.phone, BENROSO_WHATSAPP.message);

  return (
    <a
      aria-label='Chat with Benroso Safaris on WhatsApp'
      className='group fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/25 transition-transform duration-200 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-safe:animate-[benroso-wa-pulse_2.4s_ease-out_infinite]'
      href={href}
      rel='noopener noreferrer'
      target='_blank'
    >
      <Icons.whatsapp aria-hidden className='h-7 w-7' />
      <span className='pointer-events-none absolute right-16 whitespace-nowrap rounded-md bg-[var(--benroso-primary-dark)] px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100'>
        Chat on WhatsApp
      </span>
    </a>
  );
}
