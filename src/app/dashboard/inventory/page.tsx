"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useDashboardFetch } from "@/lib/client";
import { CATEGORIES, ROOMS } from "@/lib/taxonomies";
import { EmojiBadge } from "@/components/EmojiBadge";
import { getListKind } from "@/lib/list-kinds";
import { AssignDialog } from "./AssignDialog";

type InventoryItem = {
  id: string;
  listId: string | null;
  listTitle: string | null;
  listKind: string | null;
  imageUrl: string;
  label: string | null;
  room: string;
  category: string;
  tags: { id: string; label: string }[];
};

type Filter = "all" | "unassigned" | "assigned";

export default function InventoryPage() {
  const router = useRouter();
  const search = useSearchParams();
  const assignTargetListId = search.get("assign");
  const authedFetch = useDashboardFetch();
  const [items, setItems] = useState<InventoryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>(assignTargetListId ? "unassigned" : "all");
  const [roomFilter, setRoomFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(!!assignTargetListId);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showAssign, setShowAssign] = useState(false);
  const [assigningToList, setAssigningToList] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter === "unassigned") params.set("assigned", "false");
      if (filter === "assigned") params.set("assigned", "true");
      if (roomFilter) params.set("room", roomFilter);
      if (categoryFilter) params.set("category", categoryFilter);
      const qs = params.toString();
      const data = await authedFetch<{ items: InventoryItem[] }>(`/api/inventory${qs ? `?${qs}` : ""}`);
      setItems(data.items);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [authedFetch, filter, roomFilter, categoryFilter]);

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

  async function unassign() {
    if (selected.size === 0) return;
    if (!confirm(`Retirer ${selected.size} objet(s) de leur liste ? Les votes et matchs seront perdus.`)) return;
    try {
      await authedFetch("/api/inventory/unassign", {
        method: "POST",
        body: JSON.stringify({ itemIds: [...selected] }),
      });
      setSelected(new Set());
      setSelectionMode(false);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function assignToTargetList() {
    if (!assignTargetListId || selected.size === 0) return;
    setAssigningToList(true);
    setError(null);
    try {
      await authedFetch("/api/inventory/assign", {
        method: "POST",
        body: JSON.stringify({ itemIds: [...selected], listId: assignTargetListId }),
      });
      router.replace(`/dashboard/${assignTargetListId}?tab=items`);
    } catch (e) {
      setError((e as Error).message);
      setAssigningToList(false);
    }
  }

  async function deleteSelected() {
    if (selected.size === 0) return;
    if (!confirm(`Supprimer ${selected.size} objet(s) définitivement ?`)) return;
    try {
      await Promise.all(
        [...selected].map((id) => authedFetch(`/api/items/${id}`, { method: "DELETE" })),
      );
      setSelected(new Set());
      setSelectionMode(false);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const stats = useMemo(() => {
    if (!items) return null;
    const unassignedCount = items.filter((i) => !i.listId).length;
    return { total: items.length, unassigned: unassignedCount };
  }, [items]);

  return (
    <main className="min-h-screen safe-top safe-bottom">
      <div className="mx-auto w-full max-w-md px-5 pb-40 pt-6">
        <header>
          <Link href="/dashboard/lists" className="text-sm text-neutral-500">
            ← Mes listes
          </Link>
          <p className="mt-3 text-xs uppercase tracking-widest text-neutral-500">Inventaire</p>
          <h1 className="mt-1 text-2xl font-bold">Bibliothèque d’objets</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Stocke tes photos ici, puis ajoute-les à une liste quand tu es prêt.
          </p>
          {stats && (
            <p className="mt-2 text-sm text-neutral-500">
              {stats.total} objet{stats.total > 1 ? "s" : ""} ·{" "}
              {stats.unassigned} non assigné{stats.unassigned > 1 ? "s" : ""}
            </p>
          )}
        </header>

        {!assignTargetListId && (
          <Link
            href="/dashboard/inventory/new"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 px-4 py-3.5 text-base font-semibold text-white shadow-sm transition active:bg-brand-600"
          >
            <span className="text-lg leading-none">＋</span>
            Nouvel objet
          </Link>
        )}

        {assignTargetListId && (
          <p className="mt-5 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-800 ring-1 ring-brand-200">
            Sélectionne les objets à ajouter à ta liste, puis valide en bas.
          </p>
        )}

        <div className="mt-5 -mx-1 flex gap-2 overflow-x-auto px-1 no-scrollbar">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            Tous
          </FilterChip>
          <FilterChip
            active={filter === "unassigned"}
            onClick={() => setFilter("unassigned")}
          >
            Non assignés
          </FilterChip>
          <FilterChip
            active={filter === "assigned"}
            onClick={() => setFilter("assigned")}
          >
            Dans une liste
          </FilterChip>
        </div>

        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-neutral-500">Filtres avancés</summary>
          <div className="mt-3 space-y-3">
            <div>
              <p className="text-xs font-medium text-neutral-500">Pièce</p>
              <div className="mt-1 flex flex-wrap gap-2">
                <FilterChip active={!roomFilter} onClick={() => setRoomFilter(null)}>
                  Toutes
                </FilterChip>
                {ROOMS.map((r) => (
                  <FilterChip
                    key={r.key}
                    active={roomFilter === r.key}
                    onClick={() => setRoomFilter(r.key)}
                  >
                    {r.emoji} {r.label}
                  </FilterChip>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-500">Type</p>
              <div className="mt-1 flex flex-wrap gap-2">
                <FilterChip active={!categoryFilter} onClick={() => setCategoryFilter(null)}>
                  Tous
                </FilterChip>
                {CATEGORIES.map((c) => (
                  <FilterChip
                    key={c.key}
                    active={categoryFilter === c.key}
                    onClick={() => setCategoryFilter(c.key)}
                  >
                    {c.emoji} {c.label}
                  </FilterChip>
                ))}
              </div>
            </div>
          </div>
        </details>

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setSelectionMode((v) => !v);
              setSelected(new Set());
            }}
            className="text-sm font-medium text-brand-500"
          >
            {selectionMode ? "Annuler" : "Sélectionner"}
          </button>
          {selectionMode && (
            <span className="text-sm text-neutral-500">{selected.size} choisi(s)</span>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {items === null && (
          <div className="mt-10 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-brand-500" />
          </div>
        )}

        {items && items.length === 0 && (
          <div className="mt-10 rounded-2xl bg-white p-6 text-center ring-1 ring-neutral-200">
            <p className="text-4xl">📦</p>
            <h2 className="mt-3 font-semibold">Aucun objet</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Ajoute ton premier objet à l’inventaire, puis assigne-le à une liste.
            </p>
            {!assignTargetListId && (
              <Link
                href="/dashboard/inventory/new"
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white"
              >
                ＋ Nouvel objet
              </Link>
            )}
          </div>
        )}

        {items && items.length > 0 && (
          <ul className="mt-4 grid grid-cols-2 gap-3">
            {items.map((item) => {
              const k = item.listKind ? getListKind(item.listKind) : null;
              const isSelected = selected.has(item.id);
              return (
                <li key={item.id}>
                  {selectionMode ? (
                    <button
                      type="button"
                      onClick={() => toggleSelected(item.id)}
                      className={`block w-full overflow-hidden rounded-2xl bg-white text-left ring-2 transition active:scale-[0.98] ${
                        isSelected ? "ring-brand-500" : "ring-neutral-200"
                      }`}
                    >
                      <ItemCardInner item={item} kind={k} selected={isSelected} />
                    </button>
                  ) : (
                    <Link
                      href={`/dashboard/inventory/${item.id}/edit`}
                      className="block overflow-hidden rounded-2xl bg-white ring-1 ring-neutral-200 transition active:scale-[0.98]"
                    >
                      <ItemCardInner item={item} kind={k} />
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {selectionMode && selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-20 z-30">
          <div className="mx-auto w-full max-w-md px-3">
            <div className="space-y-2 rounded-2xl bg-white p-3 shadow-lg ring-1 ring-neutral-200">
              {assignTargetListId ? (
                <button
                  type="button"
                  disabled={assigningToList}
                  onClick={assignToTargetList}
                  className="w-full rounded-xl bg-brand-500 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {assigningToList
                    ? "Ajout…"
                    : `Ajouter ${selected.size} objet${selected.size > 1 ? "s" : ""} → liste`}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAssign(true)}
                  className="w-full rounded-xl bg-brand-500 px-3 py-2.5 text-sm font-semibold text-white"
                >
                  Ajouter à une liste ({selected.size})
                </button>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={unassign}
                  className="rounded-xl bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-700"
                >
                  Retirer des listes
                </button>
                <button
                  type="button"
                  onClick={deleteSelected}
                  className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAssign && (
        <AssignDialog
          itemIds={[...selected]}
          onClose={() => setShowAssign(false)}
          onDone={() => {
            setShowAssign(false);
            setSelected(new Set());
            setSelectionMode(false);
            refresh();
          }}
        />
      )}
    </main>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ring-1 transition ${
        active
          ? "bg-brand-500 text-white ring-brand-500"
          : "bg-white text-neutral-700 ring-neutral-200"
      }`}
    >
      {children}
    </button>
  );
}

function ItemCardInner({
  item,
  kind,
  selected,
}: {
  item: InventoryItem;
  kind: ReturnType<typeof getListKind> | null;
  selected?: boolean;
}) {
  return (
    <>
      <div className="relative aspect-square bg-neutral-100">
        <Image src={item.imageUrl} alt={item.label ?? ""} fill sizes="50vw" className="object-cover" />
        {!item.listId && (
          <span className="absolute right-1.5 top-1.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-neutral-700 ring-1 ring-neutral-200">
            Non assigné
          </span>
        )}
        {item.listKind && kind && (
          <span className={`absolute right-1.5 top-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${kind.color}`}>
            {kind.emoji} {kind.label}
          </span>
        )}
        {selected && (
          <span className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
            ✓
          </span>
        )}
      </div>
      <div className="space-y-1 p-2.5">
        {item.label && <p className="truncate text-sm font-medium">{item.label}</p>}
        <div className="flex flex-wrap gap-1">
          <EmojiBadge kind="room" value={item.room} />
          <EmojiBadge kind="category" value={item.category} />
        </div>
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.map((t) => (
              <span
                key={t.id}
                className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700"
              >
                {t.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
