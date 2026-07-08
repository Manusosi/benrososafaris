function extractMetaContent(value: string): string | null {
  const match = value.match(/content=["']([^"']+)["']/i);
  return match?.[1]?.trim() ?? null;
}

export function normalizeSiteVerificationToken(value: string | null | undefined): string | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const fromMetaTag = extractMetaContent(trimmed);
  if (fromMetaTag) return fromMetaTag;

  if (trimmed.includes('<')) return null;

  return trimmed;
}
