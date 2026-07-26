import { createSign } from 'crypto';

import { absoluteUrl } from './absolute-url';

const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const INDEXING_ENDPOINT = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
const INDEXING_SCOPE = 'https://www.googleapis.com/auth/indexing';

type ServiceAccount = {
  client_email: string;
  private_key: string;
};

type CachedToken = {
  accessToken: string;
  expiresAt: number;
};

let cachedToken: CachedToken | null = null;

function base64Url(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input;
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function parseServiceAccount(): ServiceAccount | null {
  const raw = process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return null;

  try {
    const json = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
    const parsed = JSON.parse(json) as Partial<ServiceAccount>;
    if (!parsed.client_email || !parsed.private_key) return null;
    return {
      client_email: parsed.client_email,
      private_key: parsed.private_key.replace(/\\n/g, '\n')
    };
  } catch {
    return null;
  }
}

function signJwt(account: ServiceAccount): string {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64Url(
    JSON.stringify({
      iss: account.client_email,
      scope: INDEXING_SCOPE,
      aud: TOKEN_ENDPOINT,
      iat: now,
      exp: now + 3600
    })
  );
  const unsigned = `${header}.${claim}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  return `${unsigned}.${base64Url(signer.sign(account.private_key))}`;
}

async function getAccessToken(account: ServiceAccount): Promise<string | null> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.accessToken;
  }

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: signJwt(account)
    })
  });

  if (!response.ok) return null;

  const data = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) return null;

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000
  };
  return data.access_token;
}

/** Prefer content detail URLs so listing pages do not burn the daily quota. */
function isContentDetailUrl(url: string): boolean {
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    return parts.length >= 3;
  } catch {
    return false;
  }
}

async function publishUrlNotification(accessToken: string, url: string): Promise<void> {
  await fetch(INDEXING_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({ url, type: 'URL_UPDATED' })
  });
}

/**
 * Notify Google Search Console (Indexing API) that URLs were published/updated.
 * Requires GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON and the service account as a
 * Search Console owner. No-ops when credentials are missing.
 */
export async function submitGoogleIndexing(pathsOrUrls: string[]): Promise<void> {
  const account = parseServiceAccount();
  if (!account) return;

  const urls = [
    ...new Set(
      pathsOrUrls.map((value) =>
        value.startsWith('http') ? value : absoluteUrl(value.startsWith('/') ? value : `/${value}`)
      )
    )
  ].filter(isContentDetailUrl);

  if (!urls.length) return;

  const accessToken = await getAccessToken(account);
  if (!accessToken) return;

  // Cap per publish burst; remaining URLs are still in the sitemap for crawl.
  await Promise.allSettled(
    urls.slice(0, 20).map((url) => publishUrlNotification(accessToken, url))
  );
}

export function isGoogleIndexingConfigured(): boolean {
  return parseServiceAccount() !== null;
}
