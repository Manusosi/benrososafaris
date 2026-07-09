export const ABOUT_HERO_DEFAULTS = {
  eyebrow: 'About Benroso Safaris',
  title: 'East Africa Safari Experts Since 2000',
  description:
    'Meet the Nairobi team, the guides on the ground, and the fleet that carries you from park to park. This is where you learn who plans your safari, how we work, and what a Benroso journey feels like.'
} as const;

export const ABOUT_STORY = {
  title: 'Who We Are',
  paragraphs: [
    'Benroso Safaris was established in 2000 with a vision to make East Africa a truly memorable destination for travelers worldwide.',
    'More than twenty years later, we still plan every itinerary by hand: the parks, the lodges, the driving days, and the guide who stays with you throughout. We operate across Kenya, Tanzania, Uganda, and Rwanda with a Nairobi team that answers before you travel and stays reachable while you are on the road.'
  ]
} as const;

export const ABOUT_STORY_IMAGE = {
  imageUrl: '/assets/leopard-lake-nakuru.png',
  imageAlt: 'Leopard resting in a tree near Lake Nakuru, Kenya'
} as const;

export type AboutAdvantageItem = {
  iconSrc: string;
  text: string;
};

export const ABOUT_WHY_TRAVEL = {
  eyebrow: 'Why Choose Us',
  title: 'Committed to the Best, Still Personal',
  intro:
    'Every itinerary is shaped around your dates, pace, and interests, with competitive pricing that never feels off the shelf. You work directly with planners who know the parks, the lodges, and the roads between them.',
  advantagesTitle: 'Advantages of Booking With Benroso Safaris',
  ctaLabel: 'Help Me Plan',
  items: [
    {
      iconSrc: '/assets/cta-icon-1.svg',
      text: 'Personalized service by East Africa travel experts with first hand knowledge'
    },
    {
      iconSrc: '/assets/cta-icon-2.svg',
      text: 'Customizable safaris built around your dates, pace, and preferences'
    },
    {
      iconSrc: '/assets/cta-icon-3.svg',
      text: 'Verified guest reviews and booking security from an established Nairobi operator'
    },
    {
      iconSrc: '/assets/cta-icon-4.svg',
      text: 'Booking security and Nairobi support before, during, and after your trip'
    }
  ] satisfies AboutAdvantageItem[]
};

export const ABOUT_VISION_MISSION = {
  vision: {
    label: 'Our Vision',
    body: 'Our vision is to be a trusted African safari partner, known globally for authenticity, professionalism, and responsible travel.'
  },
  mission: {
    label: 'Our Mission',
    body: 'To conduct ethical and profitable business by providing services to our customers through committed personnel and upholding the spirit of comradeship among all the players in East Africa travel industry.'
  },
  teamImageUrl: '/assets/benroso-safaris-kenya.webp',
  teamImageAlt: 'Benroso Safaris team in East Africa'
} as const;

export const ABOUT_GUIDES_INTRO = {
  eyebrow: 'Safari Guides',
  title: 'Professional Guides Who Know the Bush',
  description:
    'Guides bring interpretation, walking safaris, primate trekking expertise, and deep park knowledge to every itinerary.',
  imageUrl: '/assets/benroso-fleet-lion.png',
  imageAlt: 'Benroso Safaris guide on a game drive near wildlife'
} as const;

export const ABOUT_DRIVERS_INTRO = {
  eyebrow: 'Driver Guides',
  title: 'Skilled on the Tracks, Focused on Your Comfort',
  description:
    'Driver guides are the face of your safari, expert at wildlife spotting, bush driving, and guest safety on every mile of your route.',
  imageUrl: '/assets/benroso-fleet-branded.png',
  imageAlt: 'Benroso Safaris Land Cruiser ready for off road game drives'
} as const;

export const ABOUT_TEAM_SECTION = {
  staff: {
    eyebrow: 'Company Team',
    title: 'The People Behind Your Safari',
    description:
      'Leadership, operations, reservations, and guest care. The Nairobi team that coordinates every safari before your vehicle leaves the city.',
    emptyTitle: 'Team profiles coming soon',
    emptyMessage:
      'Published staff profiles will appear here once they are added in the Benroso portal under Team Members.'
  },
  safari_guide: {
    eyebrow: 'Safari Guides',
    title: 'Meet Our Professional Safari Guides',
    description: ABOUT_GUIDES_INTRO.description,
    emptyTitle: 'Safari guides coming soon',
    emptyMessage:
      'Published safari guide profiles will appear here once they are added and published in the Benroso portal under Team Members.'
  },
  driver: {
    eyebrow: 'Driver Guides',
    title: 'Meet Our Driver Guides',
    description: ABOUT_DRIVERS_INTRO.description,
    emptyTitle: 'Driver guides coming soon',
    emptyMessage:
      'Published driver-guide profiles will appear here once they are added and published in the Benroso portal under Team Members.'
  }
} as const;

export const ABOUT_TAB_CONFIG = [
  { id: 'about', label: 'Who We Are' },
  { id: 'team', label: 'Our Team' },
  { id: 'guides', label: 'Safari Guides' },
  { id: 'drivers', label: 'Driver Guides' }
] as const;
