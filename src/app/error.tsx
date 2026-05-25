"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AppLogo } from "@/components/AppLogo";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Segment-level error boundary — caught by Next.js for any runtime error
 * occurring in `app/**` rendering. Forces "/" as the safe fallback while
 * keeping a retry option for transient failures.
 */
export default function ErrorBoundary({ error, reset }: Props) {
  const t = useTranslations("errors.serverError");

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[error.tsx]", error);
    }
  }, [error]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center safe-top safe-bottom">
      <AppLogo size={64} href="/" />

      <div className="max-w-sm space-y-2">
        <p className="text-6xl font-bold text-brand-500" aria-hidden>
          500
        </p>
        <h1 className="text-2xl font-bold text-neutral-900">{t("title")}</h1>
        <p className="text-sm text-neutral-600">{t("body")}</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-2xl bg-white px-5 py-3 text-base font-semibold text-neutral-800 ring-2 ring-neutral-200 active:scale-[0.98] active:bg-neutral-50"
        >
          {t("retry")}
        </button>
        <Link
          href="/"
          className="rounded-2xl bg-brand-500 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-brand-500/20 active:scale-[0.98] active:bg-brand-600"
        >
          {t("goHome")}
        </Link>
      </div>

      {error.digest && (
        <details className="max-w-sm text-left text-xs text-neutral-500">
          <summary className="cursor-pointer">{t("details")}</summary>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-neutral-100 p-2 font-mono text-[11px]">
            {error.digest}
          </pre>
        </details>
      )}
    </main>
  );
}
