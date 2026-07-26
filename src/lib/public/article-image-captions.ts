import { createClient } from '@/lib/supabase/server';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function extractImageUrls(html: string): string[] {
  return [
    ...new Set(
      [...html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)].map((match) => match[1])
    )
  ];
}

export async function loadCaptionsByImageUrls(urls: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(urls.filter(Boolean))];
  const map = new Map<string, string>();
  if (!unique.length) return map;

  const supabase = await createClient();
  const { data } = await supabase
    .from('media_assets')
    .select('url, caption')
    .in('url', unique)
    .not('caption', 'is', null);

  for (const row of data ?? []) {
    const caption = row.caption?.trim();
    if (row.url && caption) map.set(row.url, caption);
  }
  return map;
}

/**
 * For legacy article HTML that stored bare `<img>` tags, wrap images that have a
 * media-library caption in `<figure>` + `<figcaption>` so captions show publicly.
 * Images already inside a figure are left alone.
 */
export function applyCaptionsToHtml(html: string, captionByUrl: Map<string, string>): string {
  if (!captionByUrl.size) return html;

  let result = '';
  let cursor = 0;
  const imgRegex = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  let match: RegExpExecArray | null;

  while ((match = imgRegex.exec(html)) !== null) {
    const imgTag = match[0];
    const src = match[1];
    const start = match.index;
    result += html.slice(cursor, start);

    const caption = captionByUrl.get(src)?.trim();
    const preceding = html.slice(Math.max(0, start - 240), start);
    const lastFigureOpen = preceding.toLowerCase().lastIndexOf('<figure');
    const lastFigureClose = preceding.toLowerCase().lastIndexOf('</figure>');
    const alreadyInFigure = lastFigureOpen > lastFigureClose;

    if (!caption || alreadyInFigure) {
      result += imgTag;
    } else {
      result += `<figure class="benroso-article-figure">${imgTag}<figcaption>${escapeHtml(caption)}</figcaption></figure>`;
    }

    cursor = start + imgTag.length;
  }

  result += html.slice(cursor);
  return result;
}

export async function enrichArticleHtmlWithCaptions(html: string): Promise<string> {
  const urls = extractImageUrls(html);
  if (!urls.length) return html;
  const captions = await loadCaptionsByImageUrls(urls);
  return applyCaptionsToHtml(html, captions);
}
