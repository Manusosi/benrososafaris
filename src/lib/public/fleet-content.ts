import type { DirectAnswer } from '@/lib/seo/direct-answers';

export const FLEET_PAGE_HERO_DESCRIPTION =
  'Private safari vehicles maintained for East African roads, long park days, and comfortable game drives across Kenya and Tanzania.';

export const FLEET_INTRO_TITLE = 'Why Our Fleet Works for You';

export const FLEET_INTRO_COLUMNS = [
  [
    'When you travel with Benroso Safaris, you keep the same private vehicle and the same driver guide from airport pickup through your final morning in the bush. That continuity matters on long driving days, when lodges change, and when a sighting deserves an extra hour rather than a rushed departure.',
    'Our four by four cruisers are serviced on a regular schedule for the roads, dust, and distances that East African safaris demand. Pop up roofs, charging points, and standing room are standard, so you can watch wildlife clearly without feeling cramped inside the vehicle.'
  ],
  [
    'Every journey is led by KPSGA certified guides who know the parks, read animal behaviour, and pace the day around how you actually want to travel. They understand when to wait at a sighting, when to move on, and how to position the vehicle for photography without disturbing the wildlife.',
    'We are a registered Kenya tour operator with close to three decades in the field. That experience shows in the small details: vehicles prepared before you arrive, safety kit on board, and a team in Nairobi who can respond quickly if plans shift while you are on safari.'
  ]
] as const;

export const FLEET_FEATURE_ITEMS = [
  'Pop up roofs and standing room for clear game viewing',
  'In vehicle charging for cameras and phones on long drive days',
  'Regular servicing for East African roads and park conditions',
  'KPSGA certified driver guides on every private safari',
  'Same vehicle and guide throughout your itinerary',
  'Night drive equipment where parks allow evening game drives'
] as const;

export const FLEET_FAQS: DirectAnswer[] = [
  {
    question: 'Will I have the same vehicle for my whole safari?',
    answer:
      'Yes. On a private Benroso safari you travel in the same vehicle with the same driver guide from start to finish, unless a rare operational issue requires a replacement. We plan that way so you are not meeting a new team halfway through your trip.'
  },
  {
    question: 'How many guests fit in a safari vehicle?',
    answer:
      'Most of our private safari cruisers comfortably seat up to six guests with window seats for everyone. If you are a larger group, we arrange additional vehicles so spacing and comfort stay consistent.'
  },
  {
    question: 'Are your vehicles suitable for photography?',
    answer:
      'They are. Pop up roofs give height and angle for lenses, and our guides know when to pause and how to position the vehicle with the light. Bring a bean bag or clamp for stability on bumpy tracks.'
  },
  {
    question: 'Can the vehicles handle long distances between parks?',
    answer:
      'That is what they are built for. We maintain them for inter park drives, tarmac sections, and rough tracks inside the reserves. Your guide will pace rest stops and keep water available on longer days.'
  }
];
