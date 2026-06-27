/**
 * Real guest reviews sourced from Benroso Safaris' Google / Tripadvisor profiles.
 * Names, locations and ratings are taken from the live public reviews; quote text is
 * lightly condensed from each original review for display. Update via the dashboard
 * once a live reviews integration ships.
 */

export type HomeReview = {
  id: string;
  guestName: string;
  location?: string;
  source: 'Google' | 'Tripadvisor';
  quote: string;
  rating: number;
};

export const HOME_REVIEWS_SUMMARY = {
  count: '120+',
  label: 'Reviews on Google + Tripadvisor'
} as const;

export const HOME_REVIEWS: HomeReview[] = [
  {
    id: 'review-lucy-s',
    guestName: 'Lucy S',
    source: 'Tripadvisor',
    rating: 5,
    quote:
      'Benroso made our Kenya trip seamless and incredible. Being able to plan our itinerary directly with Ben was a huge help, and our guide Stan and the drivers were exceptional — we formed real bonds throughout the journey.'
  },
  {
    id: 'review-andrea-d',
    guestName: 'Andrea D',
    location: 'Milwaukee, Wisconsin',
    source: 'Tripadvisor',
    rating: 5,
    quote:
      'Travelling all the way from the US to Kenya felt daunting, but Benroso made the complicated arrangements simple. The team was friendly, responsive and helpful, and our drivers were punctual and knowledgeable at every location.'
  },
  {
    id: 'review-ryan-m',
    guestName: 'Ryan M',
    location: 'Crystal Lake, Illinois',
    source: 'Tripadvisor',
    rating: 5,
    quote:
      'The best safari guides in Kenya! Ben and Duncan arranged everything and gave us excellent guidance, knowledge and service across two unforgettable days of game drives packed with wildlife.'
  },
  {
    id: 'review-vicky-d',
    guestName: 'Vicky D',
    location: 'Weyhill, United Kingdom',
    source: 'Tripadvisor',
    rating: 5,
    quote:
      'Brilliant service from start to finish on our 10-day safari. The staff were always on time and went out of their way to make us feel comfortable and safe in an unfamiliar country.'
  },
  {
    id: 'review-stan-m',
    guestName: 'Stan M',
    location: 'California, Maryland',
    source: 'Tripadvisor',
    rating: 5,
    quote:
      'A 10/10 Moshi to Arusha trip. From the airport pickup to the hotels and activities, every part of our three-day trip was handled incredibly well. Highly recommended.'
  },
  {
    id: 'review-marianne-d',
    guestName: 'Marianne D',
    source: 'Tripadvisor',
    rating: 5,
    quote:
      'The organisation was fantastic and the support responsive throughout. Benroso put together an excellent combination of safari and resort that made the whole holiday effortless. Highly recommend.'
  },
  {
    id: 'review-benbenja',
    guestName: 'Benjamin N',
    location: 'Kenya',
    source: 'Google',
    rating: 5,
    quote:
      'Excellent planning of the trip — from a helpful sales team to the airport pick-up and a great choice of hotels. Together with my family we had a wonderful time. It was all magic, thanks to our tour guide who made everything amazing.'
  },
  {
    id: 'review-muteroh-e',
    guestName: 'Muteroh E',
    source: 'Tripadvisor',
    rating: 5,
    quote:
      'A thrilling Kenyan safari adventure. The staff were first class, the guides genuinely knowledgeable and the vehicles in great condition. I can already say I will be booking another trip with Benroso.'
  }
];
