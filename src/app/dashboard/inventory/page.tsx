"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useDashboardFetch } from "@/lib/client";
import { EmojiBadge } from "@/components/EmojiBadge";
import { useUserRooms } from "@/components/UserRoomsProvider";
import type { RoomMeta } from "@/lib/user-room";
import {
  useTranslatedCategories,
  useTranslatedListKinds,
  useTranslatedRooms,
} from "@/lib/i18n-labels";
import { AssignDialog } from "./AssignDialog";
import { InventoryEditSheet } from "./InventoryEditSheet";
import { BackButton } from "@/components/ui/BackButton";
import { FilterChip } from "@/components/ui/FilterChip";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { PageLoader } from "@/components/ui/PageLoader";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { TextActionButton } from "@/components/ui/TextActionButton";

type InventoryItem = {
  id: string;
  listId: string | null;
  listTitle: string | null;
  listKind: string | null;
  imageUrl: string;
  label: string | null;
  room: string;
  roomMeta?: RoomMeta;
  category: string;
  tags: { id: string; label: string }[];
};

type Filter = "all" | "unassigned" | "assigned";

export default function InventoryPage() {
  const router = useRouter();
  const search = useSearchParams();
  const assignTargetListId = search.get("assign");
  const t = useTranslations("inventory");
  const tCommon = useTranslations("common");
  const translatedRooms = useTranslatedRooms();
  const translatedCategories = useTranslatedCategories();
  const translatedKinds = useTranslatedListKinds();
  const authedFetch = useDashboardFetch();
  const { rooms: customRooms } = useUserRooms();
  const [items, setItems] = useState<InventoryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>(assignTargetListId ? "unassigned" : "all");
  const [roomFilter, setRoomFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(!!assignTargetListId);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showAssign, setShowAssign] = useState(false);
  const [assigningToList, setAssigningToList] = useState(false);
  const [bulkAction, setBulkAction] = useState<"unassign" | "delete" | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

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
    if (!confirm(t("unassignConfirm", { count: selected.size }))) return;
    setBulkAction("unassign");
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
    } finally {
      setBulkAction(null);
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
    setBulkAction("delete");
    try {
      await Promise.all(
        [...selected].map((id) => authedFetch(`/api/items/${id}`, { method: "DELETE" })),
      );
      setSelected(new Set());
      setSelectionMode(false);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBulkAction(null);
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
          <BackButton href="/dashboard/lists">{t("backToLists")}</BackButton>
          <p className="mt-3 text-xs uppercase tracking-widest text-neutral-500">{t("label")}</p>
          <h1 className="mt-1 text-2xl font-bold">{t("title")}</h1>
          <p className="mt-1 text-sm text-neutral-600">{t("subtitle")}</p>
          {stats && (
            <p className="mt-2 text-sm text-neutral-500">
              {t("stats", { total: stats.total, unassigned: stats.unassigned })}
            </p>
          )}
        </header>

        {!assignTargetListId && (
          <Link
            href="/dashboard/inventory/new"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 px-4 py-3.5 text-base font-semibold text-white shadow-sm transition active:bg-brand-600"
          >
            <span className="text-lg leading-none">＋</span>
            {t("newItem")}
          </Link>
        )}

        {assignTargetListId && (
          <p className="mt-5 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-800 ring-1 ring-brand-200">
            {t("assignHint")}
          </p>
        )}

        <AnimateIn className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 py-2 no-scrollbar">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            {t("filterAll")}
          </FilterChip>
          <FilterChip
            active={filter === "unassigned"}
            onClick={() => setFilter("unassigned")}
          >
            {t("filterUnassigned")}
          </FilterChip>
          <FilterChip
            active={filter === "assigned"}
            onClick={() => setFilter("assigned")}
          >
            {t("filterAssigned")}
          </FilterChip>
        </AnimateIn>

        <details className="group mt-3">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 shadow-sm ring-2 ring-neutral-200 marker:content-none active:bg-neutral-50 [&::-webkit-details-marker]:hidden">
            <span>{t("advancedFilters")}</span>
            <span className="text-neutral-400 transition group-open:rotate-180" aria-hidden>
              ▼
            </span>
          </summary>
          <div className="mt-3 space-y-3">
            <div>
              <p className="text-xs font-medium text-neutral-500">{t("filterRoom")}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                <FilterChip active={!roomFilter} onClick={() => setRoomFilter(null)}>
                  {tCommon("allF")}
                </FilterChip>
                {translatedRooms.map((r) => (
                  <FilterChip
                    key={r.key}
                    active={roomFilter === r.key}
                    onClick={() => setRoomFilter(r.key)}
                  >
                    {r.emoji} {r.label}
                  </FilterChip>
                ))}
                {customRooms.map((r) => (
                  <FilterChip
                    key={r.id}
                    active={roomFilter === r.id}
                    onClick={() => setRoomFilter(r.id)}
                  >
                    {r.emoji} {r.label}
                  </FilterChip>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-500">{t("filterType")}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                <FilterChip active={!categoryFilter} onClick={() => setCategoryFilter(null)}>
                  {tCommon("all")}
                </FilterChip>
                {translatedCategories.map((c) => (
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
          <TextActionButton
            onClick={() => {
              setSelectionMode((v) => !v);
              setSelected(new Set());
            }}
          >
            {selectionMode ? t("cancelSelect") : t("select")}
          </TextActionButton>
          {selectionMode && (
            <span className="text-sm text-neutral-500">{t("selected", { count: selected.size })}</span>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {items === null && <PageLoader label={tCommon("loading")} className="mt-10" />}

        {items && items.length === 0 && (
          <div className="mt-10 rounded-2xl bg-white p-6 text-center ring-1 ring-neutral-200">
            <p className="text-4xl">📦</p>
            <h2 className="mt-3 font-semibold">{t("emptyTitle")}</h2>
            <p className="mt-1 text-sm text-neutral-600">{t("emptyBody")}</p>
            {!assignTargetListId && (
              <Link
                href="/dashboard/inventory/new"
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white"
              >
                ＋ {t("newItem")}
              </Link>
            )}
          </div>
        )}

        {items && items.length > 0 && (
          <AnimateIn as="ul" className="mt-4 grid grid-cols-2 gap-3">
            {items.map((item) => {
              const k =
                item.listKind
                  ? translatedKinds.find((kk) => kk.key === item.listKind) ?? translatedKinds[3]
                  : null;
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
                    <button
                      type="button"
                      onClick={() => setEditingItem(item)}
                      className="block w-full overflow-hidden rounded-2xl bg-white text-left ring-1 ring-neutral-200 transition active:scale-[0.98]"
                    >
                      <ItemCardInner item={item} kind={k} />
                    </button>
                  )}
                </li>
              );
            })}
          </AnimateIn>
        )}
      </div>

      {selectionMode && selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-20 z-30">
          <div className="mx-auto w-full max-w-md px-3">
            <div className="space-y-2 rounded-2xl bg-white p-3 shadow-lg ring-1 ring-neutral-200">
              {assignTargetListId ? (
                <LoadingButton
                  loading={assigningToList}
                  loadingText={t("assignAdding")}
                  variant="primary"
                  className="w-full rounded-xl px-3 py-2.5 text-sm"
                  onClick={assignToTargetList}
                >
                  {t("addToListTarget", { count: selected.size })}
                </LoadingButton>
              ) : (
                <LoadingButton
                  variant="primary"
                  className="w-full rounded-xl px-3 py-2.5 text-sm"
                  onClick={() => setShowAssign(true)}
                  disabled={!!bulkAction}
                >
                  {t("addToList", { count: selected.size })}
                </LoadingButton>
              )}
              <div className="grid grid-cols-2 gap-2">
                <LoadingButton
                  loading={bulkAction === "unassign"}
                  loadingText={tCommon("loading")}
                  variant="secondary"
                  className="rounded-xl px-3 py-2 text-sm font-medium"
                  onClick={unassign}
                  disabled={!!bulkAction && bulkAction !== "unassign"}
                >
                  {t("unassign")}
                </LoadingButton>
                <LoadingButton
                  loading={bulkAction === "delete"}
                  loadingText={tCommon("loading")}
                  variant="danger"
                  className="rounded-xl px-3 py-2 text-sm font-medium"
                  onClick={deleteSelected}
                  disabled={!!bulkAction && bulkAction !== "delete"}
                >
                  {t("deleteSelected")}
                </LoadingButton>
              </div>
            </div>
          </div>
        </div>
      )}

      <InventoryEditSheet
        itemId={editingItem?.id ?? null}
        preview={editingItem}
        onClose={() => setEditingItem(null)}
        onSaved={refresh}
      />

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

function ItemCardInner({
  item,
  kind,
  selected,
}: {
  item: InventoryItem;
  kind: { emoji: string; label: string; color: string; key: string } | null;
  selected?: boolean;
}) {
  const t = useTranslations("inventory");
  return (
    <>
      <div className="relative aspect-square bg-neutral-100">
        <Image src={item.imageUrl} alt={item.label ?? ""} fill sizes="50vw" className="object-cover" />
        {!item.listId && (
          <span className="absolute right-1.5 top-1.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-neutral-700 ring-1 ring-neutral-200">
            {t("unassigned")}
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
          <EmojiBadge kind="room" value={item.room} roomMeta={item.roomMeta} />
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
