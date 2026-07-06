import { indexNowKey } from '@/lib/seo/indexing';

export async function GET() {
  return new Response(indexNowKey(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    }
  });
}
