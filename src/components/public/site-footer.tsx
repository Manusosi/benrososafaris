import Image from 'next/image';
import Link from 'next/link';

import { Icons } from '@/components/icons';
import { FooterNewsletter } from '@/components/public/footer-newsletter';
import { FooterSocialLinks } from '@/components/public/footer-social-links';
import {
  BENROSO_KATO,
  BENROSO_LOGO_HEIGHT,
  BENROSO_LOGO_PATH,
  BENROSO_LOGO_WIDTH
} from '@/config/benroso';
import { localePath } from '@/lib/public/locale-path';
import type { PublicFooterColumn, PublicSiteSettings } from '@/lib/public/types';

type SiteFooterProps = {
  footerColumns: PublicFooterColumn[];
  locale: string;
  siteSettings: PublicSiteSettings;
};

function FooterLinkColumn({ column }: { column: PublicFooterColumn }) {
  return (
    <nav aria-label={column.title}>
      <h3 className='benroso-footer-heading'>{column.title}</h3>
      <ul className='space-y-2.5'>
        {column.links.map((link) => (
          <li key={`${column.title}-${link.href}`}>
            <Link className='benroso-footer-link' href={link.href}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter({ footerColumns, locale, siteSettings }: SiteFooterProps) {
  const homeHref = localePath(locale);

  const linkColumns = footerColumns.filter((column) => column.title !== 'Help & Policies');
  const policyColumn = footerColumns.find((column) => column.title === 'Help & Policies');

  return (
    <footer className='benroso-footer bg-[var(--benroso-primary)] text-white'>
      <div className='benroso-container py-14 lg:py-16'>
        <div className='grid gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-12'>
          {/* Brand */}
          <div className='lg:col-span-4'>
            <Link className='inline-flex items-center' href={homeHref}>
              <Image
                alt={siteSettings.companyName}
                className='h-[52px] w-auto max-w-none'
                height={BENROSO_LOGO_HEIGHT}
                src={BENROSO_LOGO_PATH}
                width={BENROSO_LOGO_WIDTH}
              />
            </Link>
            <p className='mt-5 max-w-sm text-sm leading-7 text-white/75'>
              {siteSettings.description ||
                'Committed to safaris done the right way across Kenya, Tanzania, Uganda, Rwanda, and South Africa. Tailored to you, guided by people who have known these parks since 2000.'}
            </p>
            <div className='mt-6 flex w-full flex-col items-start'>
              <FooterSocialLinks siteSettings={siteSettings} />
            </div>
          </div>

          {/* Menu columns */}
          {linkColumns.map((column) => (
            <div className='lg:col-span-2' key={column.title}>
              <FooterLinkColumn column={column} />
            </div>
          ))}

          {/* Newsletter */}
          <div className='md:col-span-2 lg:col-span-4'>
            <FooterNewsletter locale={locale} />
          </div>
        </div>
      </div>

      {/* KATO credential strip */}
      <div className='border-t border-white/10 bg-[var(--benroso-primary-dark)]'>
        <div className='benroso-container flex flex-col items-center justify-center gap-3 py-4 text-center sm:flex-row sm:gap-5'>
          <a
            className='inline-flex shrink-0 items-center hover:opacity-90'
            href={BENROSO_KATO.url}
            rel='noopener noreferrer'
            target='_blank'
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={BENROSO_KATO.alt}
              className='h-7 w-7 shrink-0 object-contain'
              height={28}
              src={BENROSO_KATO.logoPath}
              width={28}
            />
          </a>
          <p className='inline-flex items-center gap-2 text-sm font-medium text-white/90'>
            <Icons.badgeCheck className='h-4 w-4 text-[var(--benroso-lime)]' />
            KATO Registered · Licensed Tour Operator · KPSGA Member
          </p>
        </div>
      </div>

      {/* Copyright + legal */}
      <div className='border-t border-white/10 bg-[#263528]'>
        <div className='benroso-container flex flex-col items-center gap-4 py-5 text-center md:flex-row md:items-center md:justify-between md:gap-6 md:text-left'>
          <p className='max-w-2xl text-xs leading-5 text-white/55 md:max-w-none md:shrink-0'>
            © {new Date().getFullYear()} {siteSettings.companyName}. All rights reserved.
            {siteSettings.postalAddress ? (
              <>
                <span aria-hidden className='text-white/35'>
                  {' '}
                  ·{' '}
                </span>
                {siteSettings.postalAddress}
              </>
            ) : null}
          </p>
          {policyColumn ? (
            <nav aria-label='Legal policies' className='md:shrink-0'>
              <ul className='flex flex-wrap items-center justify-center gap-x-4 gap-y-2 md:justify-end'>
                {policyColumn.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      className='text-xs text-white/55 transition-colors hover:text-white'
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
