/**
 * UTM / referrer capture — pure helpers (no DOM imports at module load) so the
 * module can be unit-tested under happy-dom + reused on the server if needed.
 */

export const ATTRIBUTION_STORAGE_KEY = "sortyourlife.attribution";
export const ATTRIBUTION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export type AttributionFields = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  referrer: string | null;
  landingPath: string | null;
  gclid: string | null;
  fbclid: string | null;
};

export type StoredAttribution = AttributionFields & { capturedAt: number };

const EMPTY: AttributionFields = {
  utmSource: null,
  utmMedium: null,
  utmCampaign: null,
  utmContent: null,
  utmTerm: null,
  referrer: null,
  landingPath: null,
  gclid: null,
  fbclid: null,
};

function trimOrNull(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 200);
}

/** Extract host from a referrer URL string. Returns null for empty/invalid/own host. */
export function normalizeReferrer(
  referrer: string | null | undefined,
  ownHost: string | null,
): string | null {
  if (!referrer) return null;
  try {
    const u = new URL(referrer);
    if (ownHost && u.host === ownHost) return null;
    return u.host;
  } catch {
    return null;
  }
}

/**
 * Build attribution fields from a URL + referrer. Pure function — easy to test.
 */
export function readAttributionFromUrl(
  url: string,
  referrer: string | null,
): AttributionFields {
  let params: URLSearchParams;
  let pathname: string;
  let ownHost: string;
  try {
    const parsed = new URL(url);
    params = parsed.searchParams;
    pathname = parsed.pathname;
    ownHost = parsed.host;
  } catch {
    return { ...EMPTY };
  }

  const utmSource = trimOrNull(params.get("utm_source"));
  const utmMedium = trimOrNull(params.get("utm_medium"));
  const utmCampaign = trimOrNull(params.get("utm_campaign"));
  const utmContent = trimOrNull(params.get("utm_content"));
  const utmTerm = trimOrNull(params.get("utm_term"));
  const gclid = trimOrNull(params.get("gclid"));
  const fbclid = trimOrNull(params.get("fbclid"));
  const ref = normalizeReferrer(referrer, ownHost);

  const anySignal =
    utmSource || utmMedium || utmCampaign || utmContent || utmTerm || gclid || fbclid || ref;

  if (!anySignal) return { ...EMPTY };

  return {
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    utmTerm,
    referrer: ref,
    landingPath: pathname || null,
    gclid,
    fbclid,
  };
}

export function isAttributionEmpty(a: AttributionFields): boolean {
  return (
    !a.utmSource &&
    !a.utmMedium &&
    !a.utmCampaign &&
    !a.utmContent &&
    !a.utmTerm &&
    !a.referrer &&
    !a.gclid &&
    !a.fbclid
  );
}

/** Read stored attribution, ignoring expired entries. */
export function loadStoredAttribution(now: number = Date.now()): StoredAttribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAttribution;
    if (typeof parsed?.capturedAt !== "number") return null;
    if (now - parsed.capturedAt > ATTRIBUTION_TTL_MS) {
      window.localStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Persist attribution to localStorage. First-touch wins: if a non-empty
 * record already exists, keep it. New empty captures don't overwrite.
 */
export function persistAttribution(
  fields: AttributionFields,
  now: number = Date.now(),
): StoredAttribution | null {
  if (typeof window === "undefined") return null;
  if (isAttributionEmpty(fields)) return loadStoredAttribution(now);

  const existing = loadStoredAttribution(now);
  if (existing && !isAttributionEmpty(existing)) return existing;

  const stored: StoredAttribution = { ...fields, capturedAt: now };
  try {
    window.localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    return null;
  }
  return stored;
}

export function clearStoredAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
  } catch {
    /* noop */
  }
}
