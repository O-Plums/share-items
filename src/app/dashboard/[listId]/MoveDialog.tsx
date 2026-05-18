"use client";

import { useEffect, useState } from "react";
import { useDashboardFetch } from "@/lib/client";
import { getListKind } from "@/lib/list-kinds";

type SimpleList = { id: string; title: string; kind: string };

type Props = {
  itemId: string;
  currentListId: string;
  onClose: () => void;
  onDone: () => void;
};

export function MoveDialog({ itemId, currentListId, onClose, onDone }: Props) {
  const authedFetch = useDashboardFetch();
  const [lists, setLists] = useState<SimpleList[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authedFetch<{ lists: SimpleList[] }>("/api/lists")
      .then((d) => setLists(d.lists.filter((l) => l.id !== currentListId)))
      .catch((e: Error) => setError(e.message));
  }, [authedFetch, currentListId]);

  async function move(listId: string | null) {
    if (!confirm("Déplacer cet objet ? Les votes et le match sur cette liste seront supprimés.")) return;
    setBusy(true);
    setError(null);
    try {
      await authedFetch("/api/inventory/move", {
        method: "POST",
        body: JSON.stringify({ itemId, listId }),
      });
      onDone();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl bg-white p-5 ring-1 ring-neutral-200 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Déplacer vers…</h2>
          <button type="button" onClick={onClose} className="text-neutral-500" aria-label="Fermer">✕</button>
        </div>

        {error && (
          <div className="mt-1 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <div className="mt-2 max-h-[55vh] space-y-2 overflow-y-auto">
          <button
            type="button"
            disabled={busy}
            onClick={() => move(null)}
            className="flex w-full items-center gap-3 rounded-2xl bg-neutral-50 px-3 py-3 text-left ring-1 ring-dashed ring-neutral-300 active:scale-[0.98] disabled:opacity-50"
          >
            <span className="text-xl">📦</span>
            <span className="flex-1 truncate font-medium">Retirer de la liste (inventaire)</span>
          </button>

          {lists === null && (
            <div className="flex justify-center py-6">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-brand-500" />
            </div>
          )}
          {lists?.length === 0 && (
            <p className="rounded-2xl bg-neutral-50 p-3 text-sm text-neutral-600">
              Aucune autre liste.
            </p>
          )}
          {lists?.map((l) => {
            const k = getListKind(l.kind);
            return (
              <button
                key={l.id}
                type="button"
                disabled={busy}
                onClick={() => move(l.id)}
                className="flex w-full items-center gap-3 rounded-2xl bg-neutral-50 px-3 py-3 text-left ring-1 ring-neutral-200 active:scale-[0.98] disabled:opacity-50"
              >
                <span className="text-xl">{k.emoji}</span>
                <span className="flex-1 truncate font-medium">{l.title}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs ring-1 ${k.color}`}>{k.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
