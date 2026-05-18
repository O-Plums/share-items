"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useDashboardFetch } from "@/lib/client";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { PageLoader } from "@/components/ui/PageLoader";
import { EmojiBadge } from "@/components/EmojiBadge";
import { getListKind } from "@/lib/list-kinds";

type InventoryItem = {
  id: string;
  listId: string | null;
  listKind: string | null;
  imageUrl: string;
  label: string | null;
  room: string;
  category: string;
  tags: { id: string; label: string }[];
};

type Props = {
  listId: string;
  onClose: () => void;
  onDone: () => void;
};

export function InventoryPickModal({ listId, onClose, onDone }: Props) {
  const authedFetch = useDashboardFetch();
  const [items, setItems] = useState<InventoryItem[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await authedFetch<{ items: InventoryItem[] }>("/api/inventory");
      setItems(data.items.filter((i) => i.listId !== listId));
    } catch (e) {
      setError((e as Error).message);
    }
  }, [authedFetch, listId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function assignSelected() {
    if (selected.size === 0) return;
    setAssigning(true);
    setError(null);
    try {
      await authedFetch("/api/inventory/assign", {
        method: "POST",
        body: JSON.stringify({ itemIds: [...selected], listId }),
      });
      onDone();
    } catch (e) {
      setError((e as Error).message);
      setAssigning(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-t-3xl bg-white ring-1 ring-neutral-200 sm:max-h-[85vh] sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <h2 className="text-lg font-bold">Inventaire</h2>
          <button type="button" onClick={onClose} className="text-neutral-500" aria-label="Fermer">
            ✕
          </button>
        </div>

        <p className="px-5 pt-3 text-sm text-neutral-600">
          Sélectionne un ou plusieurs objets à ajouter à cette liste.
        </p>

        {error && (
          <div className="mx-5 mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {items === null && <PageLoader label="Inventaire…" />}

          {items && items.length === 0 && (
            <div className="rounded-2xl bg-neutral-50 p-6 text-center text-sm text-neutral-600">
              <p className="text-3xl">📦</p>
              <p className="mt-2">Aucun objet disponible à ajouter.</p>
            </div>
          )}

          {items && items.length > 0 && (
            <ul className="grid grid-cols-2 gap-3">
              {items.map((item) => {
                const isSelected = selected.has(item.id);
                const kind = item.listKind ? getListKind(item.listKind) : null;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggleSelected(item.id)}
                      className={`block w-full overflow-hidden rounded-2xl bg-white text-left ring-2 transition active:scale-[0.98] ${
                        isSelected ? "ring-brand-500" : "ring-neutral-200"
                      }`}
                    >
                      <div className="relative aspect-square bg-neutral-100">
                        <Image
                          src={item.imageUrl}
                          alt={item.label ?? ""}
                          fill
                          sizes="50vw"
                          className="object-cover"
                        />
                        {!item.listId && (
                          <span className="absolute right-1.5 top-1.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-neutral-700 ring-1 ring-neutral-200">
                            Non assigné
                          </span>
                        )}
                        {kind && item.listId && (
                          <span
                            className={`absolute right-1.5 top-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${kind.color}`}
                          >
                            {kind.emoji}
                          </span>
                        )}
                        {isSelected && (
                          <span className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                            ✓
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 p-2.5">
                        {item.label && (
                          <p className="truncate text-sm font-medium">{item.label}</p>
                        )}
                        <div className="flex flex-wrap gap-1">
                          <EmojiBadge kind="room" value={item.room} />
                          <EmojiBadge kind="category" value={item.category} />
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-neutral-100 px-5 py-4 safe-bottom">
          <LoadingButton
            loading={assigning}
            loadingText="Ajout…"
            variant="primary"
            className="w-full rounded-2xl px-4 py-3 text-sm"
            disabled={selected.size === 0}
            onClick={assignSelected}
          >
            {selected.size > 0
              ? `Ajouter ${selected.size} objet${selected.size > 1 ? "s" : ""}`
              : "Sélectionne des objets"}
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}
