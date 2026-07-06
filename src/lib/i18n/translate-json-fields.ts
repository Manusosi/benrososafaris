import { translateStringList, translateText } from '@/lib/i18n/google-translate';
import { normalizeDirectAnswers, type DirectAnswer } from '@/lib/seo/direct-answers';

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]).filter(Boolean) : [];
}

export function parseRichTextHtml(value: unknown): string {
  const record = (value && typeof value === 'object' ? value : null) as {
    html?: string;
    text?: string;
  } | null;

  if (!record) return '';
  if (record.html) return record.html;
  if (record.text) return record.text;
  return '';
}

export async function translateDirectAnswers(
  value: unknown,
  targetLocale: string
): Promise<DirectAnswer[]> {
  const items = normalizeDirectAnswers(value);
  if (!items.length) return [];

  const translated = await Promise.all(
    items.map(async (item) => ({
      question: await translateText(item.question, targetLocale),
      answer: await translateText(item.answer, targetLocale)
    }))
  );

  return translated;
}

export async function translateKeywords(value: unknown, targetLocale: string): Promise<string[]> {
  const keywords = toStringArray(value);
  if (!keywords.length) return [];
  return translateStringList(keywords, targetLocale);
}
