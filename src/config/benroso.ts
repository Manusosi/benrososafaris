export const BENROSO_CONTACT_DEFAULTS = {
  companyName: 'Benroso Safaris Ltd',
  email: 'info@benrososafaris.co.ke',
  phonePrimary: '+254 720 092309',
  phoneSecondary: '+254 731 201500',
  phoneOffice: '+254 20 2147799',
  addressShort: 'Magadi Rd, Ongata Rongai, Nairobi, Kenya',
  postalAddress: 'P.O. Box 6868-00100 Nairobi',
  katoAddress: 'Kitaru Road off Magadi Road near Magenche'
} as const;

/** Google Maps embed query for the contact page map. */
export const BENROSO_MAP_QUERY = 'Benuki Safaris, Langata road, Muiri Ln, Nairobi';

export const BENROSO_BRAND_COLORS = {
  primary: '#3C5142',
  primaryDark: '#2F4034',
  warmGold: '#D99A2B',
  espressoBrown: '#5D2411',
  charcoal: '#2A2A2A',
  ivory: '#F8F5EF',
  white: '#FFFFFF'
} as const;

export const BENROSO_LOGO_PATH = '/assets/benroso-logo.jpg';
export const BENROSO_LOGO_WIDTH = 514;
export const BENROSO_LOGO_HEIGHT = 150;

export const BENROSO_PORTAL_AUTH_IMAGE = {
  src: '/assets/Elephant-in-Amboseli-National-Park-2.jpeg',
  alt: 'Elephants walking across Amboseli National Park with Mount Kilimanjaro in the background'
} as const;

export const BENROSO_TRIPADVISOR = {
  url: 'https://www.tripadvisor.com/Attraction_Review-g294207-d28227680-Reviews-Benroso_Safaris_Ltd-Nairobi.html',
  wordmarkPath: '/assets/tripadvisor-wordmark-dark.svg',
  rating: '5.0',
  reviewLabel: 'Reviews'
} as const;

export const BENROSO_KATO = {
  url: 'https://katokenya.org/membership-account/profile/benroso-safaris-ltd/',
  logoPath: '/assets/kato-logo.jpg',
  logoWidth: 217,
  logoHeight: 217,
  alt: 'KATO Bonded Member'
} as const;

export const BENROSO_CONTACT_RESPONSE = {
  imagePath: '/assets/TravellerQuestion@2x.png',
  imageWidth: 140,
  imageHeight: 180,
  alt: 'Safari quote response within 24 hours'
} as const;

export const BENROSO_SAFARI_BOOKINGS = {
  url: 'https://www.safaribookings.com/',
  logoPath: '/assets/safari_bookings.png',
  logoWidth: 200,
  logoHeight: 80,
  alt: 'SafariBookings.com'
} as const;

export const BENROSO_WHATSAPP = {
  phone: '+254 731 201500',
  message: 'Hello Benroso Safaris, I would like help planning my safari.'
} as const;

/** Hero background for the public contact page. */
export const BENROSO_CONTACT_HERO = {
  imageUrl: '/assets/Elephant-in-Amboseli-National-Park-2.jpeg',
  imageAlt:
    'Elephants in Amboseli National Park — plan your East Africa safari with Benroso Safaris'
} as const;

/** Replace with /assets/about-hero.jpg when a brand team photo is ready. */
export const BENROSO_ABOUT_HERO = {
  imageUrl:
    'https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=2200&q=80',
  imageAlt: 'Benroso Safaris team on safari in East Africa'
} as const;

export const BENROSO_PUBLIC_HERO_IMAGES = {
  experiences: {
    imageUrl: '/assets/Saruni-Basecamp-The-Great-Migration-river-crossing.jpg',
    imageAlt: 'Wildebeest crossing the Mara River during the Great Migration in Kenya'
  },
  destinations: {
    imageUrl: '/assets/benroso-safaris-kenya.webp',
    imageAlt: 'Safari vehicle on the plains of Kenya with acacia trees on the horizon'
  },
  tours: {
    imageUrl: '/assets/Elephant-in-Amboseli-National-Park-2.jpeg',
    imageAlt: 'Elephants walking across Amboseli National Park with Mount Kilimanjaro behind'
  },
  accommodations: {
    imageUrl: '/assets/Saruni-Basecamp-The-Great-Migration-river-crossing.jpg',
    imageAlt: 'Luxury safari camp overlooking the Mara River during the Great Migration'
  }
} as const;

export const BENROSO_SOCIAL_DEFAULTS = {
  facebook: 'https://web.facebook.com/profile.php?id=100037323015707',
  instagram: 'https://www.instagram.com/benrososafaris/',
  linkedin: 'https://www.linkedin.com/in/benroso-safaris-a5612b13/',
  twitter: 'https://x.com/Benrosoltd',
  youtube: 'https://www.youtube.com/@BenrosoSafarisEastAfrica/'
} as const;
