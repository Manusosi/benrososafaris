'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Icons } from '@/components/icons';
import {
  BENROSO_LOGO_HEIGHT,
  BENROSO_LOGO_PATH,
  BENROSO_LOGO_WIDTH,
  BENROSO_TRIPADVISOR,
  BENROSO_WHATSAPP
} from '@/config/benroso';
import { localePath, stripLocalePrefix } from '@/lib/public/locale-path';
import { SUPPORTED_LOCALES } from '@/lib/i18n';
import type { PublicMegaMenu, PublicNavItem, PublicSiteSettings } from '@/lib/public/types';
import { cn } from '@/lib/utils';

type SiteHeaderProps = {
  locale: string;
  navItems: PublicNavItem[];
  siteSettings: PublicSiteSettings;
  destinationsMenu?: PublicMegaMenu;
};

function phoneHref(phone: string) {
  return phone.replace(/[^\d+]/g, '');
}

function whatsAppHref(phone: string, message: string) {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function getDropdownPositionClass(label: string) {
  if (label === 'About Us') {
    return 'left-0 translate-x-0';
  }

  if (label === 'Destinations') {
    return 'left-0 translate-x-0';
  }

  if (label === 'Experiences') {
    return 'left-1/2 -translate-x-1/2';
  }

  return 'left-1/2 -translate-x-1/2';
}

function getDefaultCountryIndex(columns: PublicMegaMenu['columns']) {
  const withDestinations = columns.findIndex((column) => column.destinations.length > 0);
  return withDestinations >= 0 ? withDestinations : 0;
}

function hasNavChildren(item: PublicNavItem) {
  return Boolean(item.items?.length || item.sections?.some((section) => section.items.length));
}

export function SiteHeader({ locale, navItems, siteSettings, destinationsMenu }: SiteHeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const onScroll = () => setIsAtTop(window.scrollY <= 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenGroup(null);
  }, [pathname]);

  const homeHref = localePath(locale);
  const whatsappHref = whatsAppHref(
    BENROSO_WHATSAPP.phone,
    siteSettings.whatsappMessage || BENROSO_WHATSAPP.message
  );
  const navOnlyItems = navItems.filter((item) => item.label !== 'Home');

  return (
    <>
      {/* Top utility row — desktop only; scrolls away when not at top */}
      <div
        className={cn(
          'hidden border-b border-white/10 bg-[var(--benroso-primary-dark)] text-white transition-opacity duration-300 lg:block',
          isAtTop ? 'opacity-100' : 'hidden'
        )}
      >
        <div className='benroso-container flex min-h-[var(--benroso-topbar-h)] flex-wrap items-center justify-between gap-4 py-3 lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center'>
          <Link className='inline-flex shrink-0 items-center' href={homeHref}>
            <Image
              alt={siteSettings.companyName}
              className='h-[54px] w-auto max-w-none'
              height={BENROSO_LOGO_HEIGHT}
              priority
              src={BENROSO_LOGO_PATH}
              width={BENROSO_LOGO_WIDTH}
            />
          </Link>

          <TripAdvisorBadge />

          <div className='hidden items-center justify-end gap-8 lg:flex'>
            <div className='text-right text-sm leading-6'>
              <div className='flex items-center justify-end gap-2'>
                <Icons.phone className='h-4 w-4 shrink-0 text-[var(--benroso-lime)]' />
                <span className='whitespace-nowrap text-white/90'>
                  <a
                    className='hover:text-white'
                    href={`tel:${phoneHref(siteSettings.phoneSecondary)}`}
                  >
                    {siteSettings.phoneSecondary}
                  </a>
                  <span className='px-1 text-white/50'>/</span>
                  <a
                    className='hover:text-white'
                    href={`tel:${phoneHref(siteSettings.phonePrimary)}`}
                  >
                    {siteSettings.phonePrimary}
                  </a>
                </span>
              </div>
              <a
                className='mt-1 flex items-center justify-end gap-2 hover:text-white'
                href={`mailto:${siteSettings.email}`}
              >
                <Icons.mail className='h-4 w-4 shrink-0 text-[var(--benroso-lime)]' />
                {siteSettings.email}
              </a>
            </div>
            <a
              aria-label='Help me plan my safari on WhatsApp'
              className='group benroso-fill-hover inline-flex min-h-9 items-center justify-center gap-2 rounded-[var(--benroso-button-radius)] border border-[var(--benroso-lime)] bg-transparent px-4 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--benroso-lime)] transition-colors duration-200 hover:text-[var(--benroso-primary-dark)]'
              href={whatsappHref}
              rel='noopener noreferrer'
              target='_blank'
            >
              <span>Help Me Plan</span>
              <Icons.whatsapp aria-hidden className='hidden h-5 w-5 shrink-0 group-hover:block' />
            </a>
          </div>
        </div>
      </div>

      {/* Nav pins to viewport top once user scrolls past the utility bar */}
      <header
        className={cn(
          'z-50 overflow-visible border-b border-white/10 bg-[var(--benroso-primary)] text-white',
          isAtTop
            ? 'relative'
            : 'fixed inset-x-0 top-0 border-b border-[var(--benroso-primary-dark)]'
        )}
      >
        <div className='benroso-container relative flex h-[var(--benroso-header-h)] items-center justify-between gap-3 overflow-visible lg:justify-center lg:pr-16'>
          <Link className='inline-flex shrink-0 items-center lg:hidden' href={homeHref}>
            <Image
              alt={siteSettings.companyName}
              className='h-11 w-auto max-w-[min(52vw,200px)]'
              height={BENROSO_LOGO_HEIGHT}
              priority
              src={BENROSO_LOGO_PATH}
              width={BENROSO_LOGO_WIDTH}
            />
          </Link>

          <nav aria-label='Primary' className='hidden overflow-visible lg:block'>
            <ul className='flex flex-nowrap items-center gap-x-4 overflow-visible xl:gap-x-7'>
              {navOnlyItems.map((item) => {
                const isOpen = openGroup === item.label;
                const hasChildren = hasNavChildren(item);
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <li
                    className='relative shrink-0'
                    key={item.label}
                    onMouseEnter={() => hasChildren && setOpenGroup(item.label)}
                    onMouseLeave={() => hasChildren && setOpenGroup(null)}
                  >
                    <Link
                      className={cn(
                        'inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 border-transparent py-6 text-[15px] font-normal uppercase leading-none tracking-normal transition-colors xl:text-base',
                        'hover:border-[var(--benroso-lime)] hover:text-[var(--benroso-lime)]',
                        isActive && 'border-[var(--benroso-lime)] text-[var(--benroso-lime)]'
                      )}
                      href={item.href}
                    >
                      {item.label}
                      {hasChildren ? (
                        <Icons.chevronDown className={cn('h-3.5 w-3.5', isOpen && 'rotate-180')} />
                      ) : null}
                    </Link>
                    {isOpen && item.variant === 'mega' && destinationsMenu ? (
                      <DestinationsMegaPanel
                        key={destinationsMenu.columns.map((column) => column.country).join('-')}
                        menu={destinationsMenu}
                        viewAllHref={item.href}
                      />
                    ) : isOpen && item.variant === 'dynamic' && item.sections?.length ? (
                      <ExperiencesMegaPanel sections={item.sections} />
                    ) : hasChildren && isOpen ? (
                      <div
                        className={cn(
                          'absolute top-full z-50 min-w-[210px] pt-0',
                          getDropdownPositionClass(item.label)
                        )}
                      >
                        <ul className='overflow-hidden rounded-b-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white py-1'>
                          {(item.items ?? []).map((child) => (
                            <li key={`${item.label}-${child.href}`}>
                              <Link
                                className='block px-4 py-2.5 text-[15px] leading-snug text-[var(--benroso-muted)] transition-colors hover:bg-[var(--benroso-primary)] hover:text-white'
                                href={child.href}
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className='flex shrink-0 items-center gap-2 lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2 lg:gap-3'>
            <LanguageSelector locale={locale} pathname={pathname} />
            <button
              aria-expanded={mobileOpen}
              aria-label='Toggle menu'
              className='inline-flex h-10 w-10 items-center justify-center rounded-[var(--benroso-button-radius)] border border-white/25 text-white transition-colors hover:border-white hover:text-white lg:hidden'
              onClick={() => setMobileOpen((v) => !v)}
              type='button'
            >
              {mobileOpen ? (
                <Icons.close className='h-5 w-5' />
              ) : (
                <Icons.menu className='h-5 w-5' />
              )}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div className='border-t border-white/10 bg-[var(--benroso-primary)] lg:hidden'>
            <div className='benroso-container flex max-h-[min(calc(100dvh-var(--benroso-header-h)),560px)] flex-col'>
              <div className='flex-1 overflow-y-auto overscroll-contain bg-[var(--benroso-primary)] py-3'>
                <nav aria-label='Mobile primary'>
                  {navOnlyItems.map((item) => {
                    const expanded = openGroup === item.label;
                    const hasChildren = hasNavChildren(item);
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                    return (
                      <div className='border-b border-white/10 last:border-b-0' key={item.label}>
                        <div className='flex items-center justify-between gap-3'>
                          <Link
                            className={cn(
                              'flex-1 py-3.5 text-[15px] font-normal uppercase tracking-normal transition-colors',
                              isActive
                                ? 'text-[var(--benroso-lime)]'
                                : 'text-white hover:text-[var(--benroso-lime)]'
                            )}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                          >
                            {item.label}
                          </Link>
                          {hasChildren ? (
                            <button
                              aria-expanded={expanded}
                              aria-label={`Toggle ${item.label}`}
                              className='inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--benroso-button-radius)] border border-white/15 text-white transition-colors hover:border-white/30 hover:text-white'
                              onClick={() => setOpenGroup(expanded ? null : item.label)}
                              type='button'
                            >
                              <Icons.chevronDown
                                className={cn(
                                  'h-4 w-4 transition-transform',
                                  expanded && 'rotate-180'
                                )}
                              />
                            </button>
                          ) : null}
                        </div>
                        {hasChildren && expanded ? (
                          <div className='space-y-3 pb-3 pl-3'>
                            {item.variant === 'mega' && destinationsMenu ? (
                              <DestinationsMobileMenu
                                menu={destinationsMenu}
                                onNavigate={() => setMobileOpen(false)}
                                viewAllHref={item.href}
                              />
                            ) : item.sections?.length ? (
                              item.sections.map((section) => (
                                <div key={`mobile-${item.label}-${section.label}`}>
                                  <p className='pb-1 pt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--benroso-lime)]'>
                                    {section.label}
                                  </p>
                                  <ul className='space-y-0.5'>
                                    {section.items.map((child) => (
                                      <li key={`mobile-${child.href}`}>
                                        <Link
                                          className='block py-2 text-sm text-white/85 transition-colors hover:text-white'
                                          href={child.href}
                                          onClick={() => setMobileOpen(false)}
                                        >
                                          {child.label}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))
                            ) : (
                              <ul className='space-y-0.5'>
                                {(item.items ?? []).map((child) => (
                                  <li key={`mobile-${child.href}`}>
                                    <Link
                                      className='block py-2.5 text-sm text-white/85 transition-colors hover:text-white'
                                      href={child.href}
                                      onClick={() => setMobileOpen(false)}
                                    >
                                      {child.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </nav>
              </div>

              <div className='shrink-0 space-y-3 border-t border-white/10 bg-[var(--benroso-primary-dark)] py-4'>
                <div className='space-y-2.5 text-sm leading-6 text-white/85'>
                  <div className='flex min-h-10 items-center gap-2.5 px-1'>
                    <Icons.phone className='h-4 w-4 shrink-0 text-[var(--benroso-lime)]' />
                    <span className='text-white/90'>
                      <a
                        className='hover:text-white'
                        href={`tel:${phoneHref(siteSettings.phoneSecondary)}`}
                      >
                        {siteSettings.phoneSecondary}
                      </a>
                      <span className='px-1 text-white/50'>/</span>
                      <a
                        className='hover:text-white'
                        href={`tel:${phoneHref(siteSettings.phonePrimary)}`}
                      >
                        {siteSettings.phonePrimary}
                      </a>
                    </span>
                  </div>
                  <a
                    className='flex min-h-10 items-center gap-2.5 rounded-[var(--benroso-button-radius)] px-1 transition-colors hover:text-white'
                    href={`mailto:${siteSettings.email}`}
                  >
                    <Icons.mail className='h-4 w-4 shrink-0 text-[var(--benroso-lime)]' />
                    <span className='truncate'>{siteSettings.email}</span>
                  </a>
                </div>
                <a
                  aria-label='Help me plan my safari on WhatsApp'
                  className='group benroso-fill-hover flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--benroso-button-radius)] border border-[var(--benroso-lime)] bg-transparent px-4 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--benroso-lime)] transition-colors hover:text-[var(--benroso-primary-dark)]'
                  href={whatsappHref}
                  onClick={() => setMobileOpen(false)}
                  rel='noopener noreferrer'
                  target='_blank'
                >
                  <span>Help Me Plan</span>
                  <Icons.whatsapp aria-hidden className='h-5 w-5 shrink-0' />
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </header>
      {isAtTop ? null : <div aria-hidden className='h-[var(--benroso-header-h)] shrink-0' />}
    </>
  );
}

function ExperiencesMegaPanel({ sections }: { sections: NonNullable<PublicNavItem['sections']> }) {
  const visibleSections = sections.filter((section) => section.items.length);

  return (
    <div
      className={cn(
        'absolute top-full z-50 w-[min(520px,calc(100vw-2rem))]',
        getDropdownPositionClass('Experiences')
      )}
    >
      <div className='grid grid-cols-2 gap-8 rounded-b-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white px-6 py-5 text-left shadow-2xl'>
        {visibleSections.length ? (
          visibleSections.map((section) => (
            <div key={section.label}>
              <p className='mb-3 text-sm font-bold uppercase tracking-[0.06em] text-[var(--benroso-muted)]'>
                {section.label}
              </p>
              <ul className='space-y-2'>
                {section.items.map((child) => (
                  <li key={child.href}>
                    <Link
                      className='block text-[15px] leading-snug text-[var(--benroso-muted)] transition-colors hover:text-[var(--benroso-primary)]'
                      href={child.href}
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <div className='col-span-2'>
            <p className='text-sm text-[var(--benroso-muted)]'>
              Experience categories will appear here as they are added in the portal.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const DESTINATIONS_FIRST_COLUMN_COUNT = 10;

function splitDestinationLinks<T>(items: T[], firstColumnCount = DESTINATIONS_FIRST_COLUMN_COUNT) {
  if (items.length <= firstColumnCount) {
    return { primary: items, secondary: [] as T[] };
  }

  return {
    primary: items.slice(0, firstColumnCount),
    secondary: items.slice(firstColumnCount)
  };
}

function DestinationsMegaPanel({
  menu,
  viewAllHref
}: {
  menu: PublicMegaMenu;
  viewAllHref: string;
}) {
  const [activeIndex, setActiveIndex] = useState(() => getDefaultCountryIndex(menu.columns));
  const activeColumn = menu.columns[activeIndex] ?? menu.columns[0];

  if (!activeColumn) {
    return null;
  }

  const { primary, secondary } = splitDestinationLinks(activeColumn.destinations);
  const usesTwoColumns = secondary.length > 0;

  return (
    <div className={cn('absolute top-full z-50 pt-2', getDropdownPositionClass('Destinations'))}>
      <div className='w-[min(720px,calc(100vw-2rem))] overflow-hidden rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white text-left shadow-[0_24px_60px_-28px_rgba(15,35,24,0.45)]'>
        <div className='flex max-h-[min(420px,62vh)]'>
          <nav
            aria-label='Safari countries'
            className='w-[148px] shrink-0 border-r border-[var(--benroso-line)] bg-[var(--benroso-ivory)]/70 py-2'
          >
            <ul>
              {menu.columns.map((column, index) => {
                const isActive = index === activeIndex;
                const destinationCount = column.destinations.length;

                return (
                  <li key={column.country}>
                    <button
                      className={cn(
                        'flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-[13px] transition-colors',
                        isActive
                          ? 'bg-white font-semibold text-[var(--benroso-primary)] shadow-[inset_3px_0_0_var(--benroso-lime)]'
                          : 'text-[var(--benroso-muted)] hover:bg-white/80 hover:text-[var(--benroso-primary)]'
                      )}
                      onMouseEnter={() => setActiveIndex(index)}
                      type='button'
                    >
                      <span className='flex min-w-0 items-center gap-2'>
                        {column.flag ? (
                          <span aria-hidden className='text-base leading-none'>
                            {column.flag}
                          </span>
                        ) : null}
                        <span className='truncate'>{column.country}</span>
                      </span>
                      {destinationCount ? (
                        <span
                          className={cn(
                            'shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
                            isActive
                              ? 'bg-[var(--benroso-primary)]/10 text-[var(--benroso-primary)]'
                              : 'bg-white text-[var(--benroso-muted)]'
                          )}
                        >
                          {destinationCount}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className='benroso-thin-scrollbar min-w-0 flex-1 overflow-y-auto px-5 py-4'>
            <div className='mb-3 flex items-center justify-between gap-3 border-b border-[var(--benroso-line)] pb-3'>
              <Link
                className='inline-flex items-center gap-1.5 font-display text-lg font-semibold text-[var(--benroso-primary)] transition-colors hover:text-[var(--benroso-lime)]'
                href={activeColumn.href}
              >
                {activeColumn.country}
                <Icons.chevronRight className='h-4 w-4' />
              </Link>
              {activeColumn.destinations.length ? (
                <span className='text-xs font-medium uppercase tracking-[0.08em] text-[var(--benroso-muted)]'>
                  {activeColumn.destinations.length} guides
                </span>
              ) : null}
            </div>

            {activeColumn.destinations.length ? (
              <div className={cn(usesTwoColumns && 'grid grid-cols-2 gap-x-10')}>
                <ul className='space-y-0.5'>
                  {primary.map((destination) => (
                    <li key={destination.href}>
                      <Link
                        className='group/link flex items-center gap-2 rounded-[var(--benroso-radius)] px-2 py-2 text-[14px] leading-snug text-[var(--benroso-muted)] transition-colors hover:bg-[var(--benroso-ivory)] hover:text-[var(--benroso-primary)]'
                        href={destination.href}
                      >
                        <span
                          aria-hidden
                          className='h-1 w-1 shrink-0 rounded-full bg-[var(--benroso-lime)] opacity-0 transition-opacity group-hover/link:opacity-100'
                        />
                        {destination.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                {usesTwoColumns ? (
                  <ul className='space-y-0.5'>
                    {secondary.map((destination) => (
                      <li key={destination.href}>
                        <Link
                          className='group/link flex items-center gap-2 rounded-[var(--benroso-radius)] px-2 py-2 text-[14px] leading-snug text-[var(--benroso-muted)] transition-colors hover:bg-[var(--benroso-ivory)] hover:text-[var(--benroso-primary)]'
                          href={destination.href}
                        >
                          <span
                            aria-hidden
                            className='h-1 w-1 shrink-0 rounded-full bg-[var(--benroso-lime)] opacity-0 transition-opacity group-hover/link:opacity-100'
                          />
                          {destination.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : (
              <div className='py-2'>
                <p className='text-sm text-[var(--benroso-muted)]'>
                  Safari routes for {activeColumn.country} are being added.
                </p>
                <Link
                  className='mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[var(--benroso-primary)] transition-colors hover:text-[var(--benroso-lime)]'
                  href={activeColumn.href}
                >
                  Explore {activeColumn.country}
                  <Icons.arrowRight className='h-3.5 w-3.5' />
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className='flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-[var(--benroso-line)] bg-[var(--benroso-ivory)]/40 px-5 py-2.5'>
          <Link
            className='group/all inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--benroso-primary)] transition-colors hover:text-[var(--benroso-lime)]'
            href={viewAllHref}
          >
            View all destinations
            <Icons.arrowRight className='h-3.5 w-3.5 transition-transform duration-300 group-hover/all:translate-x-1' />
          </Link>
          {menu.featured ? (
            <Link
              className='inline-flex items-center gap-1 text-xs text-[var(--benroso-muted)] transition-colors hover:text-[var(--benroso-primary)]'
              href={menu.featured.href}
            >
              {menu.featured.cta}
              <Icons.arrowRight className='h-3 w-3' />
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DestinationsMobileMenu({
  menu,
  onNavigate,
  viewAllHref
}: {
  menu: PublicMegaMenu;
  onNavigate: () => void;
  viewAllHref: string;
}) {
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);

  return (
    <div className='space-y-0.5'>
      {menu.columns.map((column) => {
        const isExpanded = expandedCountry === column.country;
        const hasDestinations = column.destinations.length > 0;

        return (
          <div key={column.country}>
            {hasDestinations ? (
              <button
                aria-expanded={isExpanded}
                className='flex w-full items-center justify-between gap-2 py-2.5 text-left text-sm font-medium text-white/90 transition-colors hover:text-white'
                onClick={() => setExpandedCountry(isExpanded ? null : column.country)}
                type='button'
              >
                <span>{column.country}</span>
                <Icons.chevronDown
                  className={cn('h-3.5 w-3.5 shrink-0 text-white/70', isExpanded && 'rotate-180')}
                />
              </button>
            ) : (
              <Link
                className='flex w-full items-center justify-between gap-2 py-2.5 text-sm font-medium text-white/90 transition-colors hover:text-white'
                href={column.href}
                onClick={onNavigate}
              >
                <span>{column.country}</span>
                <span className='text-xs text-[var(--benroso-lime)]'>View</span>
              </Link>
            )}
            {isExpanded && hasDestinations ? (
              <ul className='mb-1 space-y-0.5 border-l border-white/15 pl-3'>
                <li>
                  <Link
                    className='block py-1.5 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--benroso-lime)]'
                    href={column.href}
                    onClick={onNavigate}
                  >
                    All {column.country}
                  </Link>
                </li>
                {column.destinations.map((destination) => (
                  <li key={destination.href}>
                    <Link
                      className='block py-1.5 text-sm text-white/75 transition-colors hover:text-white'
                      href={destination.href}
                      onClick={onNavigate}
                    >
                      {destination.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}
      <Link
        className='mt-2 inline-flex items-center gap-1.5 py-2 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--benroso-lime)]'
        href={viewAllHref}
        onClick={onNavigate}
      >
        View all destinations
        <Icons.arrowRight className='h-3.5 w-3.5' />
      </Link>
    </div>
  );
}

function TripAdvisorBadge() {
  return (
    <a
      className='hidden items-center justify-center gap-2.5 hover:opacity-90 lg:flex'
      href={BENROSO_TRIPADVISOR.url}
      rel='noopener noreferrer'
      target='_blank'
    >
      {/* Official TripAdvisor wordmark (dark-background variant) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt='Tripadvisor'
        className='h-7 w-[133px] shrink-0 object-contain object-left'
        height={28}
        src={BENROSO_TRIPADVISOR.wordmarkPath}
        width={133}
      />
      <span className='flex items-center gap-2'>
        <span className='text-sm font-normal leading-none text-white'>
          {BENROSO_TRIPADVISOR.rating}
        </span>
        <TripAdvisorRatingDots />
      </span>
      <span className='text-sm font-normal uppercase leading-none text-white'>
        {BENROSO_TRIPADVISOR.reviewLabel}
      </span>
    </a>
  );
}

function TripAdvisorRatingDots() {
  return (
    <svg aria-hidden className='h-4 w-[97px] shrink-0' fill='none' viewBox='0 0 97 16'>
      <circle cx='8.35156' cy='8' fill='#00AA6C' r='8' />
      <circle cx='28.3516' cy='8' fill='#00AA6C' r='8' />
      <circle cx='48.3516' cy='8' fill='#00AA6C' r='8' />
      <circle cx='68.3516' cy='8' fill='#00AA6C' r='8' />
      <circle cx='88.3516' cy='8' fill='#00AA6C' r='8' />
    </svg>
  );
}

function LanguageSelector({
  className,
  locale,
  pathname
}: {
  className?: string;
  locale: string;
  pathname: string;
}) {
  const basePath = stripLocalePrefix(pathname, locale);

  return (
    <details className={cn('relative', className)}>
      <summary className='flex h-10 min-w-10 cursor-pointer list-none items-center justify-center gap-1 rounded-[var(--benroso-button-radius)] border border-white/25 px-2.5 text-xs font-semibold uppercase tracking-wide transition-colors hover:border-white hover:text-white [&::-webkit-details-marker]:hidden'>
        <Icons.world className='h-3.5 w-3.5 shrink-0' />
        <span>{locale}</span>
      </summary>
      <ul className='absolute right-0 top-full z-50 mt-2 min-w-[120px] overflow-hidden rounded-[var(--benroso-radius)] border border-[var(--benroso-line)] bg-white py-1'>
        {SUPPORTED_LOCALES.map((code) => (
          <li key={code}>
            <Link
              className={cn(
                'block px-3 py-2 text-sm uppercase text-[var(--benroso-muted)] hover:bg-[var(--benroso-ivory)]',
                code === locale && 'font-semibold text-[var(--benroso-primary)]'
              )}
              href={localePath(code, basePath)}
            >
              {code}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
