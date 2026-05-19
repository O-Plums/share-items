export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";
export const LOCALE_COOKIE = "locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "fr" || value === "en";
}

/** Pick fr/en from Accept-Language (browser default). */
export function localeFromAcceptLanguage(header: string | null): Locale {
  if (!header) return defaultLocale;

  const preferred = header
    .split(",")
    .map((part) => {
      const [lang, qPart] = part.trim().split(";q=");
      const code = lang.split("-")[0]?.toLowerCase() ?? "";
      const q = qPart ? Number.parseFloat(qPart) : 1;
      return { code, q: Number.isFinite(q) ? q : 0 };
    })
    .filter((e) => e.code)
    .sort((a, b) => b.q - a.q);

  for (const { code } of preferred) {
    if (isLocale(code)) return code;
  }
  return defaultLocale;
}
