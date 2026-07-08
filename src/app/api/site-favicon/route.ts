import { getPublicSiteSettings } from '@/lib/public/site-data';
import { resolveSiteFaviconUrl } from '@/lib/site-favicon';

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = await getPublicSiteSettings();
  const faviconUrl = resolveSiteFaviconUrl(settings.faviconUrl);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://benrososafaris.com';
  const absoluteUrl = faviconUrl.startsWith('http')
    ? faviconUrl
    : new URL(faviconUrl, siteUrl).toString();

  const upstream = await fetch(absoluteUrl, { next: { tags: ['site-settings'] } });
  if (!upstream.ok) {
    return new Response('Favicon not found', { status: 404 });
  }

  const bytes = await upstream.arrayBuffer();

  return new Response(bytes, {
    headers: {
      'Content-Type': upstream.headers.get('content-type') || 'image/png',
      'Cache-Control': 'public, max-age=3600, must-revalidate'
    }
  });
}
