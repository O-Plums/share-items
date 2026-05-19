import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isLocale, LOCALE_COOKIE } from "./config";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;

  // French by default; English only when the user picks it (LanguageSwitcher cookie).
  const locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
