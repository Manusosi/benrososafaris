# Benroso Safaris — SEO / AEO / GEO Content Map

Production site: **https://benrososafaris.com**

This document maps every indexable route, metadata sources, structured data, crawl files, and instant-indexing behavior.

---

## Crawl infrastructure

| Asset | URL | Implementation |
|-------|-----|----------------|
| Sitemap | `/sitemap.xml` | `src/app/sitemap.ts` — dynamic, all published routes × locales |
| Robots | `/robots.txt` | `src/app/robots.ts` — disallows portal/admin/api/dashboard |
| LLMs file | `/llms.txt` | `src/app/llms.txt/route.ts` — AEO/GEO site summary for AI crawlers |
| IndexNow key | `/benroso-safaris-indexnow.txt` | `src/app/benroso-safaris-indexnow.txt/route.ts` |

### Google Search Console setup (manual)

1. Verify ownership at [Google Search Console](https://search.google.com/search-console) using the verification code in **Portal → Settings → Analytics** (`googleSiteVerification` → root layout metadata).
2. Submit sitemap: `https://benrososafaris.com/sitemap.xml`
3. Request indexing for homepage after first deploy of this SEO stack.

### Bing Webmaster setup (manual)

1. Verify at [Bing Webmaster Tools](https://www.bing.com/webmasters) via `bingSiteVerification` in CMS settings.
2. Submit the same sitemap URL.
3. IndexNow is auto-configured when `INDEXNOW_API_KEY` is set in production env.

---

## Locales

| Locale | Code | URL prefix |
|--------|------|------------|
| English (default) | `en` | `/en/...` |
| Swahili | `sw` | `/sw/...` |
| French | `fr` | `/fr/...` |
| German | `de` | `/de/...` |
| Spanish | `es` | `/es/...` |
| Italian | `it` | `/it/...` |
| Chinese | `zh` | `/zh/...` |

Root `/` redirects to `/{defaultLocale}`.

---

## Static pages (per locale)

| Path | Index | Title/description source | JSON-LD |
|------|-------|--------------------------|---------|
| `/{locale}` | Yes | CMS `page_heroes.home` → `buildListingPageMetadata` | `TravelAgency` (locale layout) |
| `/{locale}/about` | Yes | CMS `page_heroes.about` + `ABOUT_HERO_DEFAULTS` | `TravelAgency` |
| `/{locale}/contact` | Yes | CMS `page_heroes.contact` | `TravelAgency` |
| `/{locale}/destinations` | Yes* | CMS `page_heroes.destinations` | `TravelAgency` |
| `/{locale}/tours` | Yes* | CMS `page_heroes.tours` | `TravelAgency` |
| `/{locale}/experiences` | Yes* | Static + CMS hero on page | `TravelAgency` |
| `/{locale}/accommodations` | Yes | Static listing metadata | `TravelAgency` |
| `/{locale}/national-parks` | Yes | Static listing metadata | `TravelAgency` |
| `/{locale}/blog` | Yes | CMS `page_heroes.blog` | `TravelAgency` |
| `/{locale}/our-fleet` | Yes | Static + CMS hero | `TravelAgency` |
| `/{locale}/safari-packages` | Yes | CMS `page_heroes.packages` | `TravelAgency` |
| `/{locale}/privacy-policy` | Yes | `legal-content.ts` | — |
| `/{locale}/cookie-policy` | Yes | `legal-content.ts` | — |
| `/{locale}/terms-conditions` | Yes | `legal-content.ts` | — |
| `/{locale}/payment-terms` | Yes | `legal-content.ts` | — |
| `/{locale}/service-level-agreement` | Yes | `legal-content.ts` | — |

\* Filtered URLs (`?country=`, `?tier=`, etc.) use `noindex, follow` via `buildListingPageMetadata`.

### Excluded from sitemap / noindex

| Path | Reason |
|------|--------|
| `/portal/**` | CMS admin |
| `/dashboard/**` | Template demo |
| `/api/**` | API routes |
| `/{locale}/newsletter/unsubscribe` | Transactional |
| `/{locale}/safari-guides` | 301 redirect → `/about` |
| `/{locale}/travel-by-month` | Placeholder (not in sitemap) |

---

## Dynamic content (CMS → Supabase)

Each published translation row generates `/{locale}/{prefix}/{slug}` in the sitemap.

| Content type | URL prefix | Translation table | CMS SEO fields | Public metadata | JSON-LD |
|--------------|------------|-------------------|----------------|----------------|---------|
| Safari tours | `/tours/` | `tour_translations` | `seo_title`, `seo_description`, `og_image_id`, `faqs`, `direct_answers` | ✅ `generateMetadata` | `TouristTrip` |
| Safari packages | `/safari-packages/` | `package_translations` | Same pattern | ✅ `generateMetadata` | — |
| Destinations | `/destinations/` | `destination_translations` | Same + hreflang | ✅ | `TouristDestination`, `FAQPage` |
| Blog articles | `/blog/` | `blog_translations` | Same + keywords | ✅ | `BlogPosting` |
| Experiences | `/experiences/` | `experience_translations` | Same | ✅ | `FAQPage` (when FAQs exist) |
| Accommodations | `/accommodations/` | `accommodation_translations` | Same | ✅ | — |
| National parks | `/national-parks/` | `national_park_translations` | Same | ✅ | `FAQPage` (when FAQs exist) |
| Fleet vehicles | `/our-fleet/` | `fleet_vehicle_translations` | Same | ✅ | `FAQPage` (when FAQs exist) |

### CMS SEO analyzer fields (portal only)

Stored in translation tables, used in CMS scoring (`src/features/portal/cms/seo/analyze.ts`):

- `seo_title`, `seo_description`
- `focus_keyword`, `keywords`
- `og_image_id`
- `canonical_override` (reserved — not yet wired to public metadata)
- `direct_answers`, `faqs` (AEO on-page + JSON-LD where implemented)

---

## Metadata stack

| Layer | File | Purpose |
|-------|------|---------|
| Site defaults | `src/app/layout.tsx` | Title template, favicons, GSC/Bing verification, `metadataBase` |
| Listing helper | `src/lib/seo/listing-metadata.ts` | Hero CMS + hreflang + filter noindex |
| Detail helper | `src/lib/seo/metadata.ts` | Canonical, OG, Twitter cards |
| Hreflang | `src/lib/seo/alternates.ts` | Published translation slugs per entity |
| Absolute URLs | `src/lib/seo/absolute-url.ts` | `NEXT_PUBLIC_SITE_URL` |

---

## Instant indexing on publish

When CMS content is saved with `status: 'published'`, `notifyPublishedContent()` fires:

1. **IndexNow** — submits URLs to Bing/Yandex partners
2. **Sitemap ping** — notifies Google and Bing of sitemap updates

Wired in:

- `blog/editor/service.ts`
- `tours/service.ts`
- `destinations/service.ts`
- `packages/service.ts`
- `experiences/service.ts`
- `accommodations/service.ts`
- `national-parks/service.ts`

Env: `INDEXNOW_API_KEY` (default `benroso-safaris-indexnow`)

---

## AEO / GEO (Answer & Generative Engine Optimization)

| Signal | Where |
|--------|-------|
| FAQ sections | Detail pages + homepage (`HOME_FAQS`) |
| `direct_answers` | CMS → on-page FAQ blocks |
| `FAQPage` JSON-LD | Destinations, experiences, parks, fleet |
| `llms.txt` | Site summary, content types, citation guidance |
| Blog articles | Long-form guides with TOC, related articles |

---

## Remaining backlog (optional)

1. Wire `canonical_override` from CMS when set
2. Add `BreadcrumbList` JSON-LD on detail pages
3. Add `LodgingBusiness` schema for accommodations
4. Enforce Supabase `redirects` table at edge (301/302)
5. Per-locale `<html lang={locale}>` in locale layout
6. Google Indexing API (requires service account + GSC owner access)

---

## File index

```
src/app/sitemap.ts
src/app/robots.ts
src/app/llms.txt/route.ts
src/app/benroso-safaris-indexnow.txt/route.ts
src/lib/seo/sitemap-data.ts
src/lib/seo/indexing.ts
src/lib/seo/publish-notify.ts
src/lib/seo/listing-metadata.ts
src/lib/seo/metadata.ts
docs/seo-content-map.md
```
