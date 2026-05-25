import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AppLogo } from "@/components/AppLogo";
import { PublicLanguageBar } from "@/components/PublicLanguageBar";
import { SITE_NAME } from "@/lib/site";

export async function generateMetadata() {
  const t = await getTranslations("offline");
  return {
    title: t("title"),
  };
}

export default async function OfflinePage() {
  const t = await getTranslations("offline");

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center safe-top safe-bottom">
      <PublicLanguageBar />
      <AppLogo size={72} href="/" />
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{t("title")}</h1>
        <p className="mt-2 max-w-sm text-sm text-neutral-600">{t("body", { name: SITE_NAME })}</p>
      </div>
      <Link
        href="/"
        className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white"
      >
        {t("retry")}
      </Link>
    </main>
  );
}
