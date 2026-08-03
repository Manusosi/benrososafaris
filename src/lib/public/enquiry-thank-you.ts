import { localePath } from '@/lib/public/locale-path';

export type EnquiryThankYouSource = 'tour' | 'contact' | 'accommodation' | 'destination';

export function enquiryThankYouPath(locale: string, source: EnquiryThankYouSource): string {
  return `${localePath(locale, '/thank-you')}?source=${source}`;
}

export function parseEnquiryThankYouSource(
  source: string | string[] | undefined
): EnquiryThankYouSource {
  const value = Array.isArray(source) ? source[0] : source;
  if (
    value === 'tour' ||
    value === 'contact' ||
    value === 'accommodation' ||
    value === 'destination'
  ) {
    return value;
  }
  return 'contact';
}

export function thankYouCopy(source: EnquiryThankYouSource): {
  body: string;
  heading: string;
  secondaryHref: string;
  secondaryLabel: string;
} {
  switch (source) {
    case 'tour':
      return {
        heading: 'Woohoo! Your trip enquiry is with us',
        body: 'Our safari planners have received your trip request and will reply with a tailored quote. We aim to respond within 24 hours.',
        secondaryLabel: 'Browse safari trips',
        secondaryHref: '/tours'
      };
    case 'accommodation':
      return {
        heading: 'Woohoo! Your availability enquiry is with us',
        body: 'We have received your lodge request and will check availability for your dates. We aim to respond within 24 hours.',
        secondaryLabel: 'Browse accommodations',
        secondaryHref: '/accommodations'
      };
    case 'destination':
      return {
        heading: 'Woohoo! Your safari enquiry is with us',
        body: 'Our team has received your destination enquiry and will follow up with ideas matched to your travel plans. We aim to respond within 24 hours.',
        secondaryLabel: 'Explore destinations',
        secondaryHref: '/destinations'
      };
    default:
      return {
        heading: 'Woohoo! Your enquiry is with us',
        body: 'Our safari team has received your message and will be in touch shortly. We aim to respond within 24 hours.',
        secondaryLabel: 'Browse safari trips',
        secondaryHref: '/tours'
      };
  }
}
