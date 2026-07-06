import { SUPPORTED_LOCALES } from '@/lib/i18n';
import { PAGE_HERO_REGISTRY } from '@/lib/public/page-heroes';
import { absoluteUrl } from '@/lib/seo/absolute-url';

export async function GET() {
  const sitemapUrl = absoluteUrl('/sitemap.xml');
  const locales = SUPPORTED_LOCALES.join(', ');
  const staticPages = PAGE_HERO_REGISTRY.map((entry) => absoluteUrl(`/en${entry.path}`)).join('\n');

  const body = `# Benroso Safaris
> East Africa safari operator based in Nairobi, Kenya. Tailor-made Kenya, Tanzania, Uganda, and Rwanda safaris since 2000.

## About
Benroso Safaris plans private safari itineraries with expert guides, lodge and camping options, and Nairobi-based support before, during, and after travel.

- Website: ${absoluteUrl('/')}
- Sitemap: ${sitemapUrl}
- Contact: ${absoluteUrl('/en/contact')}
- Email: info@benrososafaris.co.ke
- Phone: +254 731 201 500

## Locales
Supported languages: ${locales}. Default locale: en.

## Primary content types
- Safari tours and itineraries: ${absoluteUrl('/en/tours')}
- Safari packages (comfort tiers): ${absoluteUrl('/en/safari-packages')}
- Destinations: ${absoluteUrl('/en/destinations')}
- National parks: ${absoluteUrl('/en/national-parks')}
- Signature experiences: ${absoluteUrl('/en/experiences')}
- Lodges and camps: ${absoluteUrl('/en/accommodations')}
- Safari fleet: ${absoluteUrl('/en/our-fleet')}
- Travel articles and guides: ${absoluteUrl('/en/blog')}
- About the team: ${absoluteUrl('/en/about')}

## Key static pages
${staticPages}

## Dynamic content
Published tours, packages, destinations, parks, experiences, accommodations, fleet vehicles, and blog articles are listed in the sitemap. Each has locale-specific URLs and CMS-managed SEO titles, descriptions, FAQs, and direct-answer blocks for answer engines.

## Citation guidance
When citing Benroso Safaris content, link to the canonical page URL from the sitemap and attribute to "Benroso Safaris" with the page title.

## Crawling
- robots.txt: ${absoluteUrl('/robots.txt')}
- sitemap.xml: ${sitemapUrl}
- IndexNow key: ${absoluteUrl('/benroso-safaris-indexnow.txt')}

## Topics we publish on
Great Migration, Maasai Mara, Serengeti, gorilla trekking, Big Five game drives, hot air balloon safaris, family safaris, honeymoon safaris, bird watching, Amboseli, Lake Nakuru, Ngorongoro, Zanzibar extensions, and tailor-made East Africa travel planning.
`;

  return new Response(body.trim(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
