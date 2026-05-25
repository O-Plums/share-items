import { SITE_NAME, SITE_URL } from "@/lib/site";

const PLACEHOLDER = "[À compléter]";

/**
 * Editor identity surfaced in legal pages. No postal address required at this
 * stage — only the editor name and a contact email (LCEN art. 6 minimum for a
 * non-professional editor + RGPD contact requirement).
 *
 * Override at deploy time via:
 *   NEXT_PUBLIC_LEGAL_OWNER_NAME=...
 *   NEXT_PUBLIC_LEGAL_EMAIL=...
 */
export const LEGAL_OWNER_NAME = process.env.NEXT_PUBLIC_LEGAL_OWNER_NAME || PLACEHOLDER;
export const LEGAL_EMAIL = process.env.NEXT_PUBLIC_LEGAL_EMAIL || PLACEHOLDER;

/** Update when a substantive change is made — surfaced on every legal page. */
export const LEGAL_LAST_UPDATED = "2026-05-25";

export type LegalInterpolation = {
  owner: string;
  email: string;
  appName: string;
  siteUrl: string;
  lastUpdated: string;
};

export function legalVars(): LegalInterpolation {
  return {
    owner: LEGAL_OWNER_NAME,
    email: LEGAL_EMAIL,
    appName: SITE_NAME,
    siteUrl: SITE_URL,
    lastUpdated: LEGAL_LAST_UPDATED,
  };
}

/** Plain `{var}` interpolation — kept local to legal pages on purpose. */
export function interpolateLegal(text: string, vars: LegalInterpolation): string {
  return text.replace(/\{(\w+)\}/g, (_, key: string) => {
    if (key in vars) return vars[key as keyof LegalInterpolation];
    return `{${key}}`;
  });
}
