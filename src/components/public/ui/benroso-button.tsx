import Link from 'next/link';

import { cn } from '@/lib/utils';

const variants = {
  primary:
    'border border-[var(--benroso-primary)] bg-[var(--benroso-primary)] text-white hover:text-white',
  'accent-outline':
    'border border-[var(--benroso-primary)] bg-transparent text-[var(--benroso-primary)] hover:bg-[var(--benroso-primary)] hover:text-white',
  'gold-outline':
    'border border-[var(--benroso-lime)] bg-transparent text-white hover:text-[var(--benroso-primary-dark)]',
  gold: 'border border-[var(--benroso-lime)] bg-[var(--benroso-lime)] text-[var(--benroso-primary-dark)] hover:border-[var(--benroso-lime-hover)] hover:bg-[var(--benroso-lime-hover)]',
  accent:
    'border border-[var(--benroso-primary)] bg-[var(--benroso-primary)] text-white hover:text-white',
  ghost: 'border border-transparent text-white hover:text-[var(--benroso-lime)]',
  white:
    'border border-white bg-white text-[var(--benroso-primary)] hover:bg-[var(--benroso-ivory)] hover:border-[var(--benroso-ivory)]'
} as const;

/**
 * These variants get the animated highlight fill (`.benroso-fill-hover`): a lime
 * layer wipes in from the left on hover. The fill colour is lime by default and
 * can be overridden per-button via the `--benroso-fill` custom property (e.g.
 * the hero "Plan My Safari" button fills with the primary green instead).
 */
const FILL_HOVER_VARIANTS = new Set<keyof typeof variants>(['primary', 'accent', 'gold-outline']);

type BenrosoButtonProps = {
  children: React.ReactNode;
  className?: string;
  href?: string;
  size?: 'default' | 'sm';
  variant?: keyof typeof variants;
};

export function BenrosoButton({
  children,
  className,
  href,
  size = 'default',
  variant = 'accent'
}: BenrosoButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-[var(--benroso-button-radius)] font-semibold uppercase tracking-[0.08em] transition-colors duration-200',
    size === 'default' ? 'min-h-11 px-6 text-sm' : 'min-h-9 px-4 text-xs',
    variants[variant],
    FILL_HOVER_VARIANTS.has(variant) && 'benroso-fill-hover',
    className
  );

  if (href) {
    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return <span className={classes}>{children}</span>;
}
