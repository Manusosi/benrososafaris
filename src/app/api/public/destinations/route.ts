import { NextResponse } from 'next/server';

import { getPublicDestinations } from '@/lib/public/site-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale') || 'en';

  const destinations = await getPublicDestinations(locale);

  return NextResponse.json(
    destinations.map((destination) => ({
      country: destination.country,
      id: destination.id,
      name: destination.name,
      slug: destination.slug
    }))
  );
}
