import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AppLogo } from "@/components/AppLogo";
import { PublicLanguageBar } from "@/components/PublicLanguageBar";
import { AutoRedirectHome } from "@/components/AutoRedirectHome";

const REDIRECT_SECONDS = 5;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("errors.notFound");
  return {
    title: t("title"),
    robots: { index: false, follow: false },
  };
}

export default async function NotFound() {
  const t = await getTranslations("errors.notFound");

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center safe-top safe-bottom">
      <PublicLanguageBar />
      <AppLogo size={64} href="/" />

      <div className="max-w-sm space-y-2">
        <p className="text-6xl font-bold text-brand-500" aria-hidden>
          404
        </p>
        <h1 className="text-2xl font-bold text-neutral-900">{t("title")}</h1>
        <p className="text-sm text-neutral-600">{t("body")}</p>
      </div>

      <Link
        href="/"
        className="rounded-2xl bg-brand-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand-500/20 active:scale-[0.98] active:bg-brand-600"
      >
        {t("goHome")}
      </Link>

      <AutoRedirectHome seconds={REDIRECT_SECONDS} label={t("redirecting")} />
    </main>
  );
}
