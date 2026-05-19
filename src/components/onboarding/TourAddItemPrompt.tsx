"use client";

import { useTranslations } from "next-intl";

type Props = {
  onYes: () => void;
  onNo: () => void;
};

export function TourAddItemPrompt({ onYes, onNo }: Props) {
  const t = useTranslations("tour");

  return (
    <div
      className="fixed inset-0 z-[100001] flex items-end justify-center bg-neutral-900/55 p-4 safe-bottom"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-add-item-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-2 ring-neutral-200">
        <h2 id="tour-add-item-title" className="text-lg font-bold text-neutral-900">
          {t("readyAddTitle")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">{t("readyAddBody")}</p>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onNo}
            className="min-h-11 rounded-2xl bg-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-800 ring-2 ring-neutral-200 active:scale-[0.98]"
          >
            {t("no")}
          </button>
          <button
            type="button"
            onClick={onYes}
            className="min-h-11 rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-sm active:scale-[0.98] active:bg-brand-600"
          >
            {t("yes")}
          </button>
        </div>
      </div>
    </div>
  );
}
