/**
 * Same-site vs outbound link classification for CMS SEO and the rich-text editor.
 * Absolute URLs on the public site host count as internal (not outbound).
 */

function addHost(hosts: Set<string>, raw?: string | null): void {
  if (!raw) return;
  try {
    const host = new URL(raw.includes('://') ? raw : `https://${raw}`).hostname.toLowerCase();
    if (!host) return;
    hosts.add(host);
    if (host.startsWith('www.')) hosts.add(host.slice(4));
    else hosts.add(`www.${host}`);
  } catch {
    // Ignore malformed env values.
  }
}

/** Public site hosts (apex + www). Portal subdomain is intentionally excluded. */
export function siteHosts(): Set<string> {
  const hosts = new Set<string>();
  addHost(hosts, process.env.NEXT_PUBLIC_SITE_URL);
  addHost(hosts, 'https://benrososafaris.com');
  return hosts;
}

export type LinkKind = 'internal' | 'outbound' | 'ignore';

export function classifyHref(href: string): LinkKind {
  const value = href.trim();
  if (!value || value.startsWith('#') || /^(mailto|tel|javascript):/i.test(value)) {
    return 'ignore';
  }
  if (value.startsWith('/') || value.startsWith('./') || value.startsWith('../')) {
    return 'internal';
  }
  if (value.startsWith('//') || /^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value.startsWith('//') ? `https:${value}` : value);
      return siteHosts().has(url.hostname.toLowerCase()) ? 'internal' : 'outbound';
    } catch {
      return 'ignore';
    }
  }
  return 'ignore';
}

/** True when the href points at this site (relative path or absolute same-host URL). */
export function isInternalHref(href: string): boolean {
  return classifyHref(href) === 'internal';
}

/**
 * Normalize a same-site URL to a root-relative path for storage in the editor.
 * Returns null when the href is not on this site.
 */
export function toSitePath(href: string): string | null {
  const value = href.trim();
  if (!value) return null;
  if (value.startsWith('/')) {
    return value;
  }
  if (value.startsWith('./') || value.startsWith('../')) {
    return value;
  }
  if (!value.startsWith('//') && !/^https?:\/\//i.test(value)) {
    return null;
  }
  try {
    const url = new URL(value.startsWith('//') ? `https:${value}` : value);
    if (!siteHosts().has(url.hostname.toLowerCase())) return null;
    return `${url.pathname}${url.search}${url.hash}` || '/';
  } catch {
    return null;
  }
}
