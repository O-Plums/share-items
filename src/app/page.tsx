import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AppLogo } from "@/components/AppLogo";
import { PublicLanguageBar } from "@/components/PublicLanguageBar";

export default async function HomePage() {
  const t = await getTranslations("site");
  const th = await getTranslations("home");

  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-hidden safe-top safe-bottom">
      <PublicLanguageBar />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-between gap-4 px-5 py-6 sm:py-8">
        <header className="text-center">
          <div className="flex justify-center">
            <AppLogo size={72} href={null} priority />
          </div>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-neutral-900 sm:text-4xl">
            {t("tagline")}
          </h1>
          <p className="mt-2 text-sm leading-snug text-neutral-600 sm:text-base">{t("description")}</p>
        </header>

        <section className="space-y-2">
          <div className="rounded-2xl bg-white p-3 ring-1 ring-neutral-200">
            <p className="text-lg font-semibold">{th("step1Title")}</p>
            <p className="mt-0.5 text-sm text-neutral-600">{th("step1Body")}</p>
          </div>
          <div className="rounded-2xl bg-white p-3 ring-1 ring-neutral-200">
            <p className="text-lg font-semibold">{th("step2Title")}</p>
            <p className="mt-0.5 text-sm text-neutral-600">{th("step2Body")}</p>
          </div>
          <div className="rounded-2xl bg-white p-3 ring-1 ring-neutral-200">
            <p className="text-lg font-semibold">{th("step3Title")}</p>
            <p className="mt-0.5 text-sm text-neutral-600">{th("step3Body")}</p>
          </div>
        </section>

        <nav className="space-y-2 pb-1">
          <Link
            href="/dashboard"
            className="block w-full rounded-2xl bg-brand-500 px-4 py-3.5 text-center text-lg font-semibold text-white transition active:bg-brand-600"
          >
            {th("createList")}
          </Link>
          <p className="text-center text-xs text-neutral-500 sm:text-sm">{th("hasLink")}</p>
        </nav>
      </div>
    </main>
  );
}
