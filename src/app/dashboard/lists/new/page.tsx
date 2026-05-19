"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BackButton } from "@/components/ui/BackButton";
import { useTranslations, useLocale } from "next-intl";
import { useDashboardFetch } from "@/lib/client";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { useTranslatedListKinds } from "@/lib/i18n-labels";
import { isValidListKind } from "@/lib/list-kinds";

export default function NewListPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("lists");
  const tCommon = useTranslations("common");
  const translatedKinds = useTranslatedListKinds();
  const authedFetch = useDashboardFetch();
  const search = useSearchParams();
  const kindParam = search.get("kind");
  const initialKind = kindParam && isValidListKind(kindParam) ? kindParam : "custom";
  const fromInventory = search.get("from") === "inventory";
  const itemsParam = search.get("items") ?? "";
  const presetItems = itemsParam ? itemsParam.split(",").filter(Boolean) : [];

  const labelForKey = (key: string) =>
    translatedKinds.find((k) => k.key === key)?.label ?? "";
  const defaultLabels = useMemo(
    () => translatedKinds.map((k) => k.label),
    [translatedKinds],
  );

  const [kind, setKind] = useState(initialKind);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setKind(initialKind);
    setTitle(labelForKey(initialKind));
  }, [initialKind, locale]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { list } = await authedFetch<{ list: { id: string } }>("/api/lists", {
        method: "POST",
        body: JSON.stringify({ title, kind }),
      });
      if (presetItems.length > 0) {
        await authedFetch("/api/inventory/assign", {
          method: "POST",
          body: JSON.stringify({ itemIds: presetItems, listId: list.id }),
        });
      }
      router.replace(`/dashboard/${list.id}?welcome=1`);
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen safe-top safe-bottom">
      <div className="mx-auto w-full max-w-md px-5 pt-6">
        <BackButton href={fromInventory ? "/dashboard/inventory" : "/dashboard/lists"}>
          {tCommon("back")}
        </BackButton>
        <h1 className="mt-4 text-2xl font-bold">{t("newTitle")}</h1>
        <p className="mt-1 text-neutral-600">
          {presetItems.length > 0 ? t("itemsCount", { count: presetItems.length }) : t("newSubtitle")}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2">
          {(["keep", "donate", "sell", "custom"] as const).map((k) => {
            const kk = translatedKinds.find((tk) => tk.key === k) ?? translatedKinds[3];
            const active = kind === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setKind(k);
                  const next = labelForKey(k);
                  if (!title || defaultLabels.includes(title)) {
                    setTitle(next);
                  }
                }}
                className={`flex items-center gap-2 rounded-2xl px-3 py-3 text-left ring-1 transition ${
                  active ? "ring-brand-500 bg-brand-50" : "bg-white ring-neutral-200"
                }`}
              >
                <span className="text-2xl">{kk.emoji}</span>
                <span className="text-sm font-semibold">{kk.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={kind === "custom" ? t("listTitlePlaceholder") : labelForKey(kind)}
            maxLength={80}
            autoFocus
            className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-lg text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          <LoadingButton
            type="submit"
            loading={loading}
            loadingText={tCommon("saving")}
            variant="primary"
            className="w-full rounded-2xl px-4 py-4 text-lg"
            disabled={!title.trim()}
          >
            {t("create")}
          </LoadingButton>
        </form>
      </div>
    </main>
  );
}
