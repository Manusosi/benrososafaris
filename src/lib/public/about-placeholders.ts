/** Placeholder About page content for partners and testimonials until dedicated CMS ships. */

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

export const ABOUT_TAB_IDS = ['about', 'team', 'guides', 'drivers'] as const;
export type AboutTabId = (typeof ABOUT_TAB_IDS)[number];

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
