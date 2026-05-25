import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isLocale, LOCALE_COOKIE } from "./config";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;

  // French by default; English only when the user picks it (LanguageSwitcher cookie).
  const locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;

  // Legal wording lives in its own file under messages/legal/ so the doc can
  // grow without polluting the global namespace. Merged here under "legal".
  const [base, legal] = await Promise.all([
    import(`../../messages/${locale}.json`),
    import(`../../messages/legal/${locale}.json`),
  ]);

  return {
    locale,
    messages: { ...base.default, legal: legal.default },
  };
});
