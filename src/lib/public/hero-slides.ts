import type { HeroSlide } from './types';

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

/** Defensively parse the site_settings.hero_slides JSON into typed slides. */
export function normalizeHeroSlides(value: unknown): HeroSlide[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry, index): HeroSlide | null => {
      if (!entry || typeof entry !== 'object') return null;
      const record = entry as Record<string, unknown>;
      const mediaUrl = asString(record.mediaUrl);
      if (!mediaUrl) return null;

      const mediaType = record.mediaType === 'video' ? 'video' : 'image';

      return {
        alt: asString(record.alt),
        heading: asString(record.heading),
        isActive: record.isActive !== false,
        mediaType,
        mediaUrl,
        posterUrl: asString(record.posterUrl),
        sortOrder: typeof record.sortOrder === 'number' ? record.sortOrder : index,
        subheading: asString(record.subheading)
      };
    })
    .filter((slide): slide is HeroSlide => slide !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Slides that should appear on the public hero (active only). */
export function activeHeroSlides(slides: HeroSlide[]): HeroSlide[] {
  return slides.filter((slide) => slide.isActive);
}
