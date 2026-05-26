"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Locale } from "@/i18n/config";
import { LOCALE_COOKIE } from "@/i18n/config";

type Tone = "brand" | "voter";

type Props = {
  className?: string;
  compact?: boolean;
  /** Couleur de l'état actif. `brand` (rose, défaut) ou `voter` (bleu). */
  tone?: Tone;
};

const activeTone: Record<Tone, string> = {
  brand: "bg-primary-500 text-white",
  voter: "bg-secondary-500 text-white",
};

export function LanguageSwitcher({
  className = "",
  compact = false,
  tone = "brand",
}: Props) {
  const locale = useLocale() as Locale;
  const t = useTranslations("language");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function setLocale(next: Locale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;SameSite=Lax`;
    startTransition(() => router.refresh());
  }

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-full bg-white p-0.5 ring-1 ring-neutral-200 ${className}`}
      role="group"
      aria-label={t("label")}
    >
      {(["fr", "en"] as const).map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            disabled={pending}
            onClick={() => setLocale(code)}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase transition disabled:opacity-50 ${
              active ? activeTone[tone] : "text-neutral-600 hover:bg-neutral-50"
            }`}
            aria-pressed={active}
          >
            {compact ? code : t(code)}
          </button>
        );
      })}
    </div>
  );
}
