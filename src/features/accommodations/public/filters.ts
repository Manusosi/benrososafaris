export function parseFilterList(value?: string) {
  if (!value?.trim()) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
