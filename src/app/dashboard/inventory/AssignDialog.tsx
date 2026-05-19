"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useDashboardFetch } from "@/lib/client";
import { PageLoader } from "@/components/ui/PageLoader";
import { Spinner } from "@/components/ui/Spinner";
import { useTranslatedListKinds } from "@/lib/i18n-labels";

type SimpleList = { id: string; title: string; kind: string };

type Props = {
  itemIds: string[];
  onClose: () => void;
  onDone: () => void;
};

export function AssignDialog({ itemIds, onClose, onDone }: Props) {
  const router = useRouter();
  const t = useTranslations("inventory");
  const tCommon = useTranslations("common");
  const translatedKinds = useTranslatedListKinds();
  const authedFetch = useDashboardFetch();
  const [lists, setLists] = useState<SimpleList[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [assigningListId, setAssigningListId] = useState<string | null>(null);

  useEffect(() => {
    authedFetch<{ lists: SimpleList[] }>("/api/lists")
      .then((d) => setLists(d.lists))
      .catch((e: Error) => setError(e.message));
  }, [authedFetch]);

  async function assign(listId: string) {
    setAssigning(true);
    setAssigningListId(listId);
    setError(null);
    try {
      await authedFetch("/api/inventory/assign", {
        method: "POST",
        body: JSON.stringify({ itemIds, listId }),
      });
      onDone();
    } catch (e) {
      setError((e as Error).message);
      setAssigning(false);
      setAssigningListId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl bg-white p-5 ring-1 ring-neutral-200 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{t("assignTitle")}</h2>
          <button type="button" onClick={onClose} className="text-neutral-500" aria-label={tCommon("close")}>
            ✕
          </button>
        </div>

        <p className="text-sm text-neutral-600">{t("assignCount", { count: itemIds.length })}</p>

        {error && (
          <div className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <div className="mt-4 max-h-[50vh] space-y-2 overflow-y-auto">
          {lists === null && <PageLoader label={tCommon("loading")} className="py-6" />}

          {lists && lists.length === 0 && (
            <div className="rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-600">{t("assignEmpty")}</div>
          )}

          {lists?.map((l) => {
            const k = translatedKinds.find((kk) => kk.key === l.kind) ?? translatedKinds[3];
            return (
              <button
                key={l.id}
                type="button"
                disabled={assigning}
                onClick={() => assign(l.id)}
                className="flex w-full items-center gap-3 rounded-2xl bg-neutral-50 px-3 py-3 text-left ring-1 ring-neutral-200 active:scale-[0.98] disabled:opacity-50"
              >
                <span className="text-xl">{k.emoji}</span>
                <span className="flex-1 truncate font-medium">{l.title}</span>
                {assigningListId === l.id ? (
                  <Spinner size="sm" />
                ) : (
                  <span className={`rounded-full px-2 py-0.5 text-xs ring-1 ${k.color}`}>{k.label}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 border-t border-neutral-100 pt-3">
          <button
            type="button"
            onClick={() =>
              router.push(`/dashboard/lists/new?from=inventory&items=${encodeURIComponent(itemIds.join(","))}`)
            }
            className="block w-full rounded-2xl bg-brand-500 px-3 py-3 text-center text-sm font-semibold text-white"
          >
            {t("assignCreate")}
          </button>
        </div>
      </div>
    </div>
  );
}
