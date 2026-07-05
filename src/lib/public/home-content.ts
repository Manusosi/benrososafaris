/**
 * Homepage showcase content.
 *
 * These are editorial fallbacks used until the dashboard CMS has published
 * matching experiences. Once `listPublishedExperiences()` returns data, the
 * homepage prefers live content and falls back to these entries.
 */

export type HomeShowcaseItem = {
  id: string;
  category: string;
  title: string;
  location: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  href: string;
};

/** Featured experiences for the GSAP card-stack showcase slider. */
export const HOME_SHOWCASE_ITEMS: HomeShowcaseItem[] = [
  {
    id: 'great-migration',
    category: 'Wildlife Spectacle',
    title: 'The Great Migration',
    location: 'Maasai Mara, Kenya & Serengeti, Tanzania',
    description:
      'Time your safari with the river crossings, when more than a million wildebeest brave the Mara River. We position you at the right camps on the right dates.',
    imageUrl: '/assets/Saruni-Basecamp-The-Great-Migration-river-crossing.jpg',
    imageAlt: 'Wildebeest crossing the Mara River during the Great Migration',
    href: '/experiences?category=Migration%20Safaris'
  },
  {
    id: 'balloon-safari',
    category: 'Signature Experience',
    title: 'Hot Air Balloon Safaris',
    location: 'Maasai Mara, Kenya',
    description:
      'Drift over the plains at sunrise and land to a champagne bush breakfast. A quarter century of relationships means we secure the best baskets in peak season.',
    imageUrl: '/assets/Masai-Mara-Hot-Air-Balloon-Safari-with-Champagne-Breakfast.jpg',
    imageAlt: 'Hot air balloon safari over the Maasai Mara at sunrise',
    href: '/experiences?category=Luxury%20Safaris'
  },
  {
    id: 'big-five',
    category: 'Game Viewing',
    title: 'Big Five Game Drives',
    location: 'Amboseli & Tsavo, Kenya',
    description:
      'Track elephant herds beneath Kilimanjaro, then search for lion, leopard, buffalo, and rhino with guides who have read these landscapes for decades.',
    imageUrl: '/assets/Elephant-in-Amboseli-National-Park-2.jpeg',
    imageAlt: 'Elephants in Amboseli National Park with Mount Kilimanjaro behind',
    href: '/experiences?category=Big%205%20Safaris'
  },
  {
    id: 'rhino-conservation',
    category: 'Conservation & Walking',
    title: 'Guided Rhino Tracking on Foot',
    location: 'Ol Pejeta & Laikipia, Kenya',
    description:
      'Step out of the vehicle with an armed ranger and track rhino on foot. A close, low-impact encounter that puts your visit behind serious conservation work.',
    imageUrl:
      '/assets/The-Ultimate-Guided-Rhino-Tracking-on-Foot-in-Kenya-Conservation-Safari-A-Journey-to-Save-the-Giants.jpg',
    imageAlt: 'Guided rhino tracking on foot during a conservation safari in Kenya',
    href: '/experiences?category=Conservation%20Safaris'
  },
  {
    id: 'cultural-maasai',
    category: 'Culture & People',
    title: 'Maasai Cultural Encounters',
    location: 'Mara Conservancies, Kenya',
    description:
      'Spend time with Maasai communities on their terms, not a staged performance. Honest cultural exchange that supports the families who host you.',
    imageUrl: '/assets/maasai-showing-1300by700-600x332.jpg',
    imageAlt: 'Maasai community members sharing their traditions with safari guests',
    href: '/experiences?category=Cultural%20Safaris'
  },
  {
    id: 'classic-game-drive',
    category: 'Classic Safari',
    title: 'Private 4x4 Safari Adventures',
    location: 'Across Kenya, Tanzania, Uganda & Rwanda',
    description:
      'Your own vehicle, your own pace, a driver-guide who knows where the light falls best. The original safari, done properly and tailored entirely to you.',
    imageUrl: '/assets/benroso-safaris-kenya.webp',
    imageAlt: 'Benroso Safaris 4x4 vehicle on the plains of Kenya',
    href: '/experiences?category=4X4%20Safari%20Tours'
  }
];

/** Maps homepage showcase slide ids to published experience slugs. */
const SHOWCASE_EXPERIENCE_SLUGS: Record<string, string> = {
  'balloon-safari': 'hot-air-baloon-safaris',
  'big-five': 'big-5-safaris',
  'classic-game-drive': '4x4-safari-tours',
  'cultural-maasai': 'maasai-cultural-encounters',
  'great-migration': 'great-migration-safaris',
  'rhino-conservation': 'conservation-safaris'
};

export function resolveShowcaseItemHrefs(
  items: HomeShowcaseItem[],
  experiences: { slug: string }[]
): HomeShowcaseItem[] {
  const publishedSlugs = new Set(experiences.map((experience) => experience.slug));

  return items.map((item) => {
    const slug = SHOWCASE_EXPERIENCE_SLUGS[item.id];
    if (!slug || !publishedSlugs.has(slug)) return item;

    return {
      ...item,
      href: `/experiences/${slug}`
    };
  });
}

export type HomeFaq = {
  question: string;
  answer: string;
};

/** Homepage FAQs. Plain editorial content, safe to edit freely. */
export const HOME_FAQS: HomeFaq[] = [
  {
    question: 'When is the best time to go on safari in East Africa?',
    answer:
      'It depends on what you want to see. The Great Migration river crossings in the Maasai Mara peak from July to October, while the calving season runs January to March. Wildlife viewing is excellent year round, and our planners will match your dates to the best parks and experiences.'
  },
  {
    question: 'Are your safaris private or group tours?',
    answer:
      'Both. Most of our guests travel on private safaris with their own vehicle and driver-guide, but we also arrange small group departures and tailor-made itineraries for families, couples, and larger parties.'
  },
  {
    question: 'What does a Benroso safari include?',
    answer:
      'Typically park fees, accommodation, a private 4x4 with a professional driver-guide, transfers, and game drives as set out in your itinerary. We send a clear day-by-day plan and a transparent price before you book, with no hidden costs.'
  },
  {
    question: 'Do you arrange gorilla trekking permits for Uganda and Rwanda?',
    answer:
      'Yes. We handle gorilla and chimpanzee permits, forest logistics, and lodge access, and we can combine primate trekking with savannah parks or a beach extension.'
  },
  {
    question: 'How do I pay, and is my booking protected?',
    answer:
      'You secure your safari with a deposit and settle the balance before travel under clear payment terms. As a KATO bonded and licensed tour operator, your booking is protected to recognised industry standards.'
  },
  {
    question: 'Can you combine a safari with a beach holiday?',
    answer:
      'Absolutely. Safari and beach combinations to Diani, Mombasa, or Zanzibar are some of our most popular itineraries, and we coordinate every flight and transfer in between.'
  }
];

export type HomeArticle = {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  imageUrl: string | null;
  imageAlt: string;
  href: string;
};

export type HomeExperienceCategory = {
  id: string;
  title: string;
  blurb: string;
  imageUrl: string;
  imageAlt: string;
  href: string;
};

/** Published experience slugs ordered by typical safari search demand (highest first). */
export const HOME_EXPERIENCE_SEARCH_POPULARITY_SLUGS = [
  'great-migration-safaris',
  'big-5-safaris',
  'gorilla-trekking-safaris',
  'luxury-safaris',
  'family-safaris',
  'safari-beach-holidays',
  'hot-air-baloon-safaris',
  'honeymoon-safaris',
  '4x4-safari-tours',
  'photography-safaris',
  'fly-in-safaris',
  'maasai-cultural-encounters',
  'conservation-safaris',
  'tailor-made-safaris',
  'mountain-climbing',
  'bird-watching-safaris',
  'night-game-drives',
  'excursions'
] as const;

/** Fallback grid ids aligned with the same popularity order as published slugs. */
const HOME_EXPERIENCE_FALLBACK_POPULARITY_IDS = [
  'migration',
  'big-five',
  'gorilla',
  'luxury',
  'family',
  'beach',
  'honeymoon',
  'photography',
  'walking',
  'fly-in'
] as const;

export function sortExperiencesBySearchPopularity<T extends { slug: string }>(
  experiences: T[]
): T[] {
  const rank = new Map<string, number>(
    HOME_EXPERIENCE_SEARCH_POPULARITY_SLUGS.map((slug, index) => [slug, index])
  );

  return [...experiences].sort((a, b) => {
    const aRank = rank.get(a.slug) ?? HOME_EXPERIENCE_SEARCH_POPULARITY_SLUGS.length;
    const bRank = rank.get(b.slug) ?? HOME_EXPERIENCE_SEARCH_POPULARITY_SLUGS.length;

    if (aRank !== bRank) return aRank - bRank;
    return a.slug.localeCompare(b.slug);
  });
}

export function sortExperienceCategoriesBySearchPopularity(
  categories: HomeExperienceCategory[]
): HomeExperienceCategory[] {
  const rank = new Map<string, number>(
    HOME_EXPERIENCE_FALLBACK_POPULARITY_IDS.map((id, index) => [id, index])
  );

  return [...categories].sort((a, b) => {
    const aRank = rank.get(a.id) ?? HOME_EXPERIENCE_FALLBACK_POPULARITY_IDS.length;
    const bRank = rank.get(b.id) ?? HOME_EXPERIENCE_FALLBACK_POPULARITY_IDS.length;

    if (aRank !== bRank) return aRank - bRank;
    return a.title.localeCompare(b.title);
  });
}

/**
 * Experience categories for the grid section, modelled on the kinds of safaris
 * Benroso runs across East and Southern Africa.
 */
export const HOME_EXPERIENCE_CATEGORIES: HomeExperienceCategory[] = [
  {
    id: 'family',
    title: 'Family Safaris',
    blurb: 'Paced itineraries and child-friendly lodges for travelers of every age.',
    imageUrl: '/assets/Elephant-in-Amboseli-National-Park-2.jpeg',
    imageAlt: 'Elephant herd viewed on a family safari in Amboseli',
    href: '/experiences?category=Family%20Safaris'
  },
  {
    id: 'honeymoon',
    title: 'Honeymoon Safaris',
    blurb: 'Private vehicles, romantic camps, and seamless safari-to-beach combinations.',
    imageUrl: '/assets/Masai-Mara-Hot-Air-Balloon-Safari-with-Champagne-Breakfast.jpg',
    imageAlt: 'Romantic hot air balloon safari over the Maasai Mara',
    href: '/experiences?category=Honeymoon%20Safaris'
  },
  {
    id: 'luxury',
    title: 'Luxury Safaris',
    blurb: 'The finest tented camps and lodges, with every detail handled for you.',
    imageUrl: '/assets/Saruni-Basecamp-The-Great-Migration-river-crossing.jpg',
    imageAlt: 'Luxury safari camp overlooking a Great Migration river crossing',
    href: '/experiences?category=Luxury%20Safaris'
  },
  {
    id: 'migration',
    title: 'Migration Safaris',
    blurb: 'Front-row dates for the wildebeest crossings in the Mara and Serengeti.',
    imageUrl: '/assets/great%20migration%20of%20wildebeasts%20in%20across%20mara%20river.jpg',
    imageAlt: 'Wildebeest migration crossing the Mara River',
    href: '/experiences?category=Migration%20Safaris'
  },
  {
    id: 'big-five',
    title: 'Big 5 Safaris',
    blurb: 'Lion, leopard, elephant, buffalo, and rhino across our flagship parks.',
    imageUrl: '/assets/benroso-safaris-kenya.webp',
    imageAlt: 'Safari vehicle searching for the Big Five on the Kenyan plains',
    href: '/experiences?category=Big%205%20Safaris'
  },
  {
    id: 'gorilla',
    title: 'Gorilla & Chimp Trekking',
    blurb: 'Permits and forest logistics for Uganda and Rwanda primate encounters.',
    imageUrl: '/assets/maasai-showing-1300by700-600x332.jpg',
    imageAlt: 'Forest trekking experience in East Africa',
    href: '/experiences?category=Gorilla%20Trekking'
  },
  {
    id: 'photography',
    title: 'Photography Safaris',
    blurb: 'Guides who chase the light and the angles, in vehicles built for the lens.',
    imageUrl: '/assets/The-Great-Wildebeest-Migration-1024x683.jpg.webp',
    imageAlt: 'Photographing the Great Wildebeest Migration from a safari vehicle',
    href: '/experiences?category=Photography%20Safaris'
  },
  {
    id: 'walking',
    title: 'Walking Safaris',
    blurb: 'Track wildlife on foot with armed rangers in private conservancies.',
    imageUrl:
      '/assets/The-Ultimate-Guided-Rhino-Tracking-on-Foot-in-Kenya-Conservation-Safari-A-Journey-to-Save-the-Giants.jpg',
    imageAlt: 'Walking safari tracking rhino on foot in Kenya',
    href: '/experiences?category=Walking%20Safaris'
  },
  {
    id: 'beach',
    title: 'Safari & Beach Holidays',
    blurb: 'Pair your game drives with Diani, Zanzibar, or the Kenyan coast.',
    imageUrl: '/assets/benroso-safaris-kenya.webp',
    imageAlt: 'Safari and beach combination holiday in East Africa',
    href: '/experiences?category=Safari%20%26%20Beach%20Holidays'
  },
  {
    id: 'fly-in',
    title: 'Fly-In Safaris',
    blurb: 'Skip the long transfers with light-aircraft hops between reserves.',
    imageUrl: '/assets/Masai-Mara-Hot-Air-Balloon-Safari-with-Champagne-Breakfast.jpg',
    imageAlt: 'Aerial view of the Maasai Mara on a fly-in safari',
    href: '/experiences?category=Fly-In%20Safaris'
  },
  {
    id: 'conservation',
    title: 'Conservation Safaris',
    blurb: 'Travel that supports rhino sanctuaries and community conservancies.',
    imageUrl:
      '/assets/The-Ultimate-Guided-Rhino-Tracking-on-Foot-in-Kenya-Conservation-Safari-A-Journey-to-Save-the-Giants.jpg',
    imageAlt: 'Conservation safari supporting rhino protection in Kenya',
    href: '/experiences?category=Conservation%20Safaris'
  },
  {
    id: 'tailor-made',
    title: 'Tailor-Made Safaris',
    blurb: 'Built from scratch around your dates, budget, and travel style.',
    imageUrl: '/assets/Saruni-Basecamp-The-Great-Migration-river-crossing.jpg',
    imageAlt: 'Tailor-made safari experience in East Africa',
    href: '/contact'
  }
];
