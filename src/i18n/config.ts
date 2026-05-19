export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";
export const LOCALE_COOKIE = "locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "fr" || value === "en";
}
