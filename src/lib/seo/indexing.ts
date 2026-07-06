import { absoluteUrl } from './absolute-url';

const INDEXNOW_ENDPOINTS = ['https://api.indexnow.org/indexnow', 'https://www.bing.com/indexnow'];

function siteHost() {
  try {
    return new URL(absoluteUrl('/')).host;
  } catch {
    return 'benrososafaris.com';
  }
}

export function indexNowKey() {
  return process.env.INDEXNOW_API_KEY || 'benroso-safaris-indexnow';
}

export function indexNowKeyLocation() {
  return absoluteUrl(`/${indexNowKey()}.txt`);
}

function normalizeUrls(urls: string[]) {
  const seen = new Set<string>();
  return urls
    .map((url) => {
      if (url.startsWith('http')) return url;
      return absoluteUrl(url.startsWith('/') ? url : `/${url}`);
    })
    .filter((url) => {
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    });
}

async function submitIndexNow(urls: string[]) {
  const key = indexNowKey();
  const host = siteHost();
  const payload = {
    host,
    key,
    keyLocation: indexNowKeyLocation(),
    urlList: urls.slice(0, 10_000)
  };

  await Promise.allSettled(
    INDEXNOW_ENDPOINTS.map((endpoint) =>
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload)
      })
    )
  );
}

async function pingSitemap() {
  const sitemapUrl = encodeURIComponent(absoluteUrl('/sitemap.xml'));
  const endpoints = [
    `https://www.google.com/ping?sitemap=${sitemapUrl}`,
    `https://www.bing.com/ping?sitemap=${sitemapUrl}`
  ];

  await Promise.allSettled(endpoints.map((endpoint) => fetch(endpoint, { method: 'GET' })));
}

/**
 * Notify search engines that URLs were published or updated.
 * Fire-and-forget from CMS server actions — errors are swallowed.
 */
export async function notifySearchEngines(pathsOrUrls: string[]) {
  const urls = normalizeUrls(pathsOrUrls);
  if (!urls.length) return;

  try {
    await Promise.allSettled([submitIndexNow(urls), pingSitemap()]);
  } catch {
    // Non-blocking: indexing must never break CMS publish flows.
  }
}

export function notifySearchEnginesLater(pathsOrUrls: string[]) {
  void notifySearchEngines(pathsOrUrls);
}
