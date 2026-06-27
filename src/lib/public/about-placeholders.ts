/** Placeholder About page content — replace via dashboard CMS when team_members tables ship. */

export type AboutPerson = {
  id: string;
  name: string;
  role: string;
  department: string;
  bio: string;
  imageUrl: string;
  imageAlt: string;
  languages: string[];
  specialties: string[];
  yearsExperience?: number;
  certifications?: string[];
  featured?: boolean;
};

export type AboutTestimonial = {
  id: string;
  guestName: string;
  country: string;
  quote: string;
  tourLabel: string;
  rating: number;
  imageUrl?: string;
};

export type AboutPartner = {
  id: string;
  name: string;
  description: string;
  category: 'regulatory' | 'industry' | 'conservation' | 'platform';
  logoPath?: string;
  url?: string;
};

export const ABOUT_TAB_IDS = ['about', 'team', 'guides', 'drivers', 'partners', 'reviews'] as const;
export type AboutTabId = (typeof ABOUT_TAB_IDS)[number];

export const ABOUT_STATS = [
  { label: 'Years in operation', value: '25+' },
  { label: 'East African countries', value: '4' },
  { label: 'Driver-guides & guides', value: '20+' },
  { label: 'Safari fleet vehicles', value: '12+' }
] as const;

export const ABOUT_VALUES = [
  {
    title: 'Authenticity',
    description:
      'Local expertise, community lodges, and genuine bush experiences — not scripted performances.'
  },
  {
    title: 'Professionalism',
    description:
      'Licensed guides, maintained fleet, clear itineraries, and dependable logistics every day of your safari.'
  },
  {
    title: 'Responsible travel',
    description:
      'Park regulations, conservation partners, and fair employment practices across our operations.'
  },
  {
    title: 'Personalization',
    description:
      'Custom dates, private groups, and tailor-made routes built around how you actually want to travel.'
  }
] as const;

export const ABOUT_DESTINATIONS = [
  {
    country: 'Kenya',
    slug: 'kenya',
    highlights: 'Maasai Mara, Rift Valley lakes, Amboseli, Samburu, and so much more',
    imageUrl:
      'https://images.unsplash.com/photo-1516426122076-c23e76319801?auto=format&fit=crop&w=900&q=80'
  },
  {
    country: 'Tanzania',
    slug: 'tanzania',
    highlights: 'Serengeti, Ngorongoro Crater, Zanzibar, and so much more',
    imageUrl:
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=900&q=80'
  },
  {
    country: 'Uganda',
    slug: 'uganda',
    highlights: 'Gorilla trekking, chimpanzee tracking, scenic waterways, and great adventures',
    imageUrl:
      'https://images.unsplash.com/photo-1551632811-561732f81182?auto=format&fit=crop&w=900&q=80'
  },
  {
    country: 'Rwanda',
    slug: 'rwanda',
    highlights: 'Luxury primate safaris and conservation experiences',
    imageUrl:
      'https://images.unsplash.com/photo-1589652717521-10c0d092dea9?auto=format&fit=crop&w=900&q=80'
  }
] as const;

export const ABOUT_SERVICES = [
  {
    title: 'Private 4×4 safaris',
    description: 'Game drives in well-equipped Land Cruisers with experienced driver-guides.'
  },
  {
    title: 'Lodge & camping safaris',
    description: 'Comfortable lodges, tented camps, and classic bush camping combinations.'
  },
  {
    title: 'Gorilla & primate trekking',
    description: 'Uganda and Rwanda gorilla, chimpanzee, and primate-focused itineraries.'
  },
  {
    title: 'Beach extensions',
    description: 'Coastal add-ons to Diani, Zanzibar, and other Indian Ocean escapes.'
  },
  {
    title: 'Airport transfers & logistics',
    description: 'Seamless meet-and-greet, park fees, permits, and route coordination.'
  },
  {
    title: 'Group & corporate travel',
    description: 'Chama outings, family reunions, and tailored group safari programs.'
  }
] as const;

export const ABOUT_GALLERY_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=800&q=80',
    alt: 'Lion on the savanna during a Benroso safari game drive'
  },
  {
    url: 'https://images.unsplash.com/photo-1509316785289-025f5b84635d?auto=format&fit=crop&w=800&q=80',
    alt: 'Elephants with Mount Kilimanjaro in the background'
  },
  {
    url: 'https://images.unsplash.com/photo-1523805009345-7448845a9e3?auto=format&fit=crop&w=800&q=80',
    alt: 'Safari vehicle on a game drive track'
  },
  {
    url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74045?auto=format&fit=crop&w=800&q=80',
    alt: 'Lake and wildlife landscape in East Africa'
  },
  {
    url: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=80',
    alt: 'Giraffes on the open plains'
  },
  {
    url: 'https://images.unsplash.com/photo-1589652717521-10c0d092dea9?auto=format&fit=crop&w=800&q=80',
    alt: 'Mountain gorilla in the forest'
  }
] as const;

export const PLACEHOLDER_TEAM: AboutPerson[] = [
  {
    id: 'team-1',
    name: 'Benjamin Waiganjo',
    role: 'Founder & Managing Director',
    department: 'Leadership',
    bio: 'Founded Benroso Safaris in 2000 with a vision to showcase East Africa authentically. Oversees operations, partnerships, and guest experience standards.',
    imageUrl:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Benjamin Waiganjo — Founder & Managing Director',
    languages: ['English', 'Swahili'],
    specialties: ['Operations', 'Partnerships', 'Safari planning'],
    yearsExperience: 25,
    featured: true
  },
  {
    id: 'team-2',
    name: 'Grace Muthoni',
    role: 'Operations Manager',
    department: 'Operations',
    bio: 'Coordinates fleet logistics, lodge bookings, park permits, and daily safari schedules so every itinerary runs smoothly in the field.',
    imageUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Grace Muthoni — Operations Manager',
    languages: ['English', 'Swahili'],
    specialties: ['Logistics', 'Permits', 'Fleet coordination'],
    yearsExperience: 12,
    featured: true
  },
  {
    id: 'team-3',
    name: 'Peter Kariuki',
    role: 'Reservations Lead',
    department: 'Guest care',
    bio: 'First point of contact for enquiries — builds quotes, refines itineraries, and keeps guests informed from booking through departure.',
    imageUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Peter Kariuki — Reservations Lead',
    languages: ['English', 'Swahili'],
    specialties: ['Itinerary design', 'Guest communication'],
    yearsExperience: 9
  },
  {
    id: 'team-4',
    name: 'Sarah Njeri',
    role: 'Guest Relations Coordinator',
    department: 'Guest care',
    bio: 'Supports travelers before and during their safari — special requests, dietary needs, and on-trip assistance when plans shift.',
    imageUrl:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Sarah Njeri — Guest Relations Coordinator',
    languages: ['English', 'Swahili', 'French'],
    specialties: ['Guest support', 'Special requests'],
    yearsExperience: 7
  },
  {
    id: 'team-5',
    name: 'David Ochieng',
    role: 'Fleet & Maintenance Supervisor',
    department: 'Operations',
    bio: 'Ensures every safari vehicle meets safety and comfort standards — daily checks, servicing schedules, and roadside readiness.',
    imageUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'David Ochieng — Fleet & Maintenance Supervisor',
    languages: ['English', 'Swahili'],
    specialties: ['Vehicle maintenance', 'Safety compliance'],
    yearsExperience: 14
  },
  {
    id: 'team-6',
    name: 'Amina Hassan',
    role: 'Marketing & Partnerships',
    department: 'Marketing',
    bio: 'Connects Benroso with lodge partners, conservation initiatives, and digital channels that bring new guests to East Africa.',
    imageUrl:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Amina Hassan — Marketing & Partnerships',
    languages: ['English', 'Swahili', 'Arabic'],
    specialties: ['Partnerships', 'Content', 'Social media'],
    yearsExperience: 6
  }
];

export const PLACEHOLDER_GUIDES: AboutPerson[] = [
  {
    id: 'guide-1',
    name: 'James Elkanah',
    role: 'Senior Safari Guide',
    department: 'Guides',
    bio: 'KPSGA-certified guide with deep knowledge of Maasai Mara, Amboseli, and northern Kenya circuits. Passionate about big cats and birding.',
    imageUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'James Elkanah — Senior Safari Guide',
    languages: ['English', 'Swahili', 'Maasai'],
    specialties: ['Big cats', 'Birding', 'Maasai Mara'],
    yearsExperience: 18,
    certifications: ['KPSGA Silver', 'First Aid'],
    featured: true
  },
  {
    id: 'guide-2',
    name: 'Stanley Muchemi',
    role: 'Walking Safari Specialist',
    department: 'Guides',
    bio: 'Expert in guided bush walks, conservancy experiences, and interpretive guiding across Laikipia and Samburu.',
    imageUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Stanley Muchemi — Walking Safari Specialist',
    languages: ['English', 'Swahili'],
    specialties: ['Walking safaris', 'Conservancies', 'Samburu'],
    yearsExperience: 12,
    certifications: ['KPSGA Bronze', 'Walking guide']
  },
  {
    id: 'guide-3',
    name: 'Faith Wanjiru',
    role: 'Primate & Forest Guide',
    department: 'Guides',
    bio: 'Specializes in gorilla and chimpanzee trekking logistics and forest ecology across Uganda and Rwanda.',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Faith Wanjiru — Primate & Forest Guide',
    languages: ['English', 'Swahili', 'French'],
    specialties: ['Gorilla trekking', 'Chimpanzees', 'Forest ecology'],
    yearsExperience: 10,
    certifications: ['KPSGA Bronze', 'Primate trekking']
  },
  {
    id: 'guide-4',
    name: 'Ezekiel Kingori',
    role: 'Photography Safari Guide',
    department: 'Guides',
    bio: 'Helps guests capture the best light and angles on game drives — experienced with Mara crossings and Amboseli elephant herds.',
    imageUrl:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Ezekiel Kingori — Photography Safari Guide',
    languages: ['English', 'Swahili'],
    specialties: ['Photography', 'Great Migration', 'Amboseli'],
    yearsExperience: 15,
    certifications: ['KPSGA Silver']
  },
  {
    id: 'guide-5',
    name: 'Lucy Akinyi',
    role: 'Cultural & Community Guide',
    department: 'Guides',
    bio: 'Connects guests with Maasai communities, cultural visits, and conservation education at partner conservancies.',
    imageUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Lucy Akinyi — Cultural & Community Guide',
    languages: ['English', 'Swahili', 'Maasai'],
    specialties: ['Cultural visits', 'Community tourism', 'Conservation'],
    yearsExperience: 8,
    certifications: ['KPSGA Bronze']
  },
  {
    id: 'guide-6',
    name: 'Michael Otieno',
    role: 'Northern Circuit Guide',
    department: 'Guides',
    bio: 'Covers Samburu, Lake Turkana approaches, and cross-border routes into southern Ethiopia border regions when requested.',
    imageUrl:
      'https://images.unsplash.com/photo-1463453091185-820950117da7?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Michael Otieno — Northern Circuit Guide',
    languages: ['English', 'Swahili', 'Samburu'],
    specialties: ['Samburu', 'Northern Kenya', 'Remote routes'],
    yearsExperience: 11,
    certifications: ['KPSGA Bronze', 'First Aid']
  }
];

export const PLACEHOLDER_DRIVERS: AboutPerson[] = [
  {
    id: 'driver-1',
    name: 'John Kamau',
    role: 'Lead Driver-Guide',
    department: 'Driver-guides',
    bio: 'Twenty years on East African roads — Mara, Nakuru, Naivasha loops and cross-border Tanzania routes. Known for calm, guest-focused driving.',
    imageUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'John Kamau — Lead Driver-Guide',
    languages: ['English', 'Swahili'],
    specialties: ['Mara circuits', 'Cross-border', 'Family safaris'],
    yearsExperience: 20,
    certifications: ['Defensive driving', 'KPSGA Bronze'],
    featured: true
  },
  {
    id: 'driver-2',
    name: 'Samuel Waweru',
    role: 'Senior Driver-Guide',
    department: 'Driver-guides',
    bio: 'Expert tracker and narrator on game drives — pairs with our flagship Land Cruisers for private group safaris.',
    imageUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Samuel Waweru — Senior Driver-Guide',
    languages: ['English', 'Swahili'],
    specialties: ['Wildlife tracking', 'Private groups', 'Photography stops'],
    yearsExperience: 16,
    certifications: ['Defensive driving', 'First Aid']
  },
  {
    id: 'driver-3',
    name: 'Joseph Mutua',
    role: 'Driver-Guide — Coastal & Safari',
    department: 'Driver-guides',
    bio: 'Handles safari-to-beach combinations — Diani, Malindi, and inland park transfers with the same care on tarmac and bush tracks.',
    imageUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Joseph Mutua — Driver-Guide',
    languages: ['English', 'Swahili'],
    specialties: ['Coastal transfers', 'Beach extensions', 'Park logistics'],
    yearsExperience: 13,
    certifications: ['Defensive driving']
  },
  {
    id: 'driver-4',
    name: 'Daniel Kiprop',
    role: 'Driver-Guide — Rift Valley Specialist',
    department: 'Driver-guides',
    bio: 'Knows every viewpoint on the Nakuru–Naivasha–Mara corridor — ideal for multi-park itineraries and lake-region safaris.',
    imageUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Daniel Kiprop — Driver-Guide',
    languages: ['English', 'Swahili', 'Kalenjin'],
    specialties: ['Rift Valley', 'Lake Nakuru', 'Lake Naivasha'],
    yearsExperience: 11,
    certifications: ['Defensive driving', 'KPSGA Bronze']
  },
  {
    id: 'driver-5',
    name: 'Robert Omondi',
    role: 'Driver-Guide — Tanzania Routes',
    department: 'Driver-guides',
    bio: 'Cross-border specialist for Serengeti, Ngorongoro, and Tarangire combinations departing from Nairobi or Arusha.',
    imageUrl:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Robert Omondi — Driver-Guide',
    languages: ['English', 'Swahili'],
    specialties: ['Tanzania', 'Serengeti', 'Cross-border permits'],
    yearsExperience: 14,
    certifications: ['Defensive driving', 'Cross-border compliance']
  },
  {
    id: 'driver-6',
    name: 'Kevin Mwangi',
    role: 'Driver-Guide — Airport & City Transfers',
    department: 'Driver-guides',
    bio: 'Meet-and-greet specialist for Jomo Kenyatta and Wilson Airport transfers, plus Nairobi city connections to safari departures.',
    imageUrl:
      'https://images.unsplash.com/photo-1463453091185-820950117da7?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Kevin Mwangi — Driver-Guide',
    languages: ['English', 'Swahili'],
    specialties: ['Airport transfers', 'Nairobi logistics', 'Group arrivals'],
    yearsExperience: 8,
    certifications: ['Defensive driving', 'First Aid']
  }
];

export const PLACEHOLDER_TESTIMONIALS: AboutTestimonial[] = [
  {
    id: 'review-1',
    guestName: 'Helen & Mark',
    country: 'United Kingdom',
    quote:
      'Our driver-guide made every game drive feel personal. The wildlife was incredible, the logistics were seamless, and the whole team was warm from start to finish.',
    tourLabel: '7-Day Kenya Safari, Mara, Nakuru, Naivasha and Amboseli',
    rating: 5
  },
  {
    id: 'review-2',
    guestName: 'Thomas Berger',
    country: 'Germany',
    quote:
      'Benroso coordinated lodges, park fees, and a private vehicle without us worrying about a single detail. The Mara crossings were unforgettable.',
    tourLabel: 'Maasai Mara Private Safari',
    rating: 5
  },
  {
    id: 'review-3',
    guestName: 'The Okafor Family',
    country: 'Nigeria',
    quote:
      'Traveling with three generations is not easy, yet Benroso paced the itinerary perfectly and our guide kept everyone engaged and comfortable the whole way.',
    tourLabel: 'Family Safari in Kenya and Tanzania',
    rating: 5
  },
  {
    id: 'review-4',
    guestName: 'Sophie Laurent',
    country: 'France',
    quote:
      'From gorilla trekking in Uganda to a beach finish in Zanzibar, every transition was smooth. The team was professional and responsive well before the trip.',
    tourLabel: 'East Africa Combo, Primates and Beach',
    rating: 5
  },
  {
    id: 'review-5',
    guestName: 'James & Patricia',
    country: 'United States',
    quote:
      'We chose Benroso after reading their reviews and the experience matched every promise. Amboseli at sunrise was worth the journey on its own.',
    tourLabel: 'Amboseli and Tsavo Safari',
    rating: 5
  },
  {
    id: 'review-6',
    guestName: 'Chama Group, Nairobi',
    country: 'Kenya',
    quote:
      'Our chama outing was flawlessly organized. Comfortable cruiser, a great guide, and pricing that worked well for our group size.',
    tourLabel: 'Weekend Safari, Lake Naivasha and Nakuru',
    rating: 5
  }
];

export const PLACEHOLDER_PARTNERS: AboutPartner[] = [
  {
    id: 'partner-tra',
    name: 'Tourism Regulatory Authority (TRA)',
    description:
      'Benroso Safaris is a fully registered and licensed tour operator regulated by TRA.',
    category: 'regulatory'
  },
  {
    id: 'partner-kato',
    name: 'Kenya Association of Tour Operators (KATO)',
    description: 'Proud KATO member — bonded operator standards and industry best practices.',
    category: 'industry',
    logoPath: '/assets/kato-logo.jpg',
    url: 'https://www.kato.org/'
  },
  {
    id: 'partner-kpsga',
    name: 'Kenya Professional Safari Guides Association (KPSGA)',
    description:
      'Our guides and driver-guides align with KPSGA professional certification standards.',
    category: 'industry',
    url: 'https://kpsga.org/'
  },
  {
    id: 'partner-safaribookings',
    name: 'SafariBookings.com',
    description: 'Verified operator profile with guest reviews and transparent safari listings.',
    category: 'platform',
    url: 'https://www.safaribookings.com/'
  },
  {
    id: 'partner-olpejeta',
    name: 'Ol Pejeta Conservancy',
    description:
      'Conservation partner for rhino sanctuary visits and educational safari experiences.',
    category: 'conservation'
  },
  {
    id: 'partner-mara',
    name: 'Maasai Mara National Reserve',
    description: 'Long-standing operations across the Mara ecosystem and adjacent conservancies.',
    category: 'conservation'
  }
];
