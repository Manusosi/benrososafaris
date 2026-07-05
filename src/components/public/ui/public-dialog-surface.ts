import { cn } from '@/lib/utils';

/**
 * Light-theme scope for public-site Radix dialogs (portaled to document.body).
 * Without this, dialogs inherit the dashboard/root dark tokens and render black.
 */
export const PUBLIC_LIGHT_DIALOG = cn(
  'public-site',
  'border-[var(--benroso-line)] bg-white text-[var(--benroso-ink)]',
  '[--benroso-primary:#3c5142] [--benroso-primary-dark:#2f4034] [--benroso-primary-light:#4a6354]',
  '[--benroso-accent:#3c5142] [--benroso-accent-hover:#2f4034] [--benroso-lime:#a9c038]',
  '[--benroso-ivory:#f8f5ef] [--benroso-ink:#1a1a1a] [--benroso-muted:#5c665f] [--benroso-line:#e4dfd4]',
  '[--background:#ffffff] [--foreground:#1a1a1a] [--card:#ffffff]',
  '[--popover:#ffffff] [--popover-foreground:#1a1a1a]',
  '[--muted:#f8f5ef] [--muted-foreground:#5c665f]',
  '[--accent:#f8f5ef] [--accent-foreground:#1a1a1a]',
  '[--border:#e4dfd4] [--input:#e4dfd4] [--ring:#3c5142]',
  '[&>button]:text-[var(--benroso-ink)] [&>button]:opacity-70 [&>button]:hover:opacity-100'
);
