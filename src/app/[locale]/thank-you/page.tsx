import type { Metadata } from 'next';

import { ThankYouContent } from '@/components/public/thank-you-content';

export const metadata: Metadata = {
  title: 'Thank You',
  description: 'Your enquiry has been received. Our safari team will be in touch shortly.',
  robots: { index: false, follow: false }
};

type ThankYouPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ source?: string | string[] }>;
};

export default async function ThankYouPage({ params, searchParams }: ThankYouPageProps) {
  const { locale } = await params;
  const sp = await searchParams;

  return <ThankYouContent locale={locale} sourceParam={sp.source} />;
}
