function tryParseUrl(raw: string): URL | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('//')) {
    try {
      return new URL(`https:${trimmed}`);
    } catch {
      return null;
    }
  }
  const candidate = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(candidate);
  } catch {
    return null;
  }
}

export function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('data:image/')) return trimmed;
  if (trimmed.startsWith('blob:')) return trimmed;

  const parsed = tryParseUrl(trimmed);
  if (!parsed) return null;
  if (parsed.protocol === 'http:') parsed.protocol = 'https:';
  if (parsed.protocol !== 'https:') return null;
  return parsed.toString();
}
