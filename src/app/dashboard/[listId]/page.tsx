"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { LoadingButton } from "@/components/ui/LoadingButton";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useDashboardFetch } from "@/lib/client";
import { EmojiBadge } from "@/components/EmojiBadge";
import { getListKind, LIST_KINDS } from "@/lib/list-kinds";
import { MoveDialog } from "./MoveDialog";
import { InventoryPickModal } from "./InventoryPickModal";
import { PageLoader } from "@/components/ui/PageLoader";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { BackButton } from "@/components/ui/BackButton";
import { Spinner } from "@/components/ui/Spinner";

type Item = {
  id: string;
  imageUrl: string;
  label: string | null;
  room: string;
  category: string;
  sortOrder: number;
  tags: { id: string; label: string }[];
  votesYes: { visitorId: string; displayName: string }[];
  votesNo: { visitorId: string; displayName: string }[];
  match: { visitorId: string; displayName: string } | null;
};

type ResultsResponse = {
  list: { id: string; slug: string; title: string; kind: string };
  items: Item[];
};

type Tab = "items" | "results" | "share";

export default function ListDetailPage() {
  const router = useRouter();
  const params = useParams<{ listId: string }>();
  const searchParams = useSearchParams();
  const tabParam = (searchParams.get("tab") as Tab | null) ?? "items";
  const tList = useTranslations("listDetail");
  const authedFetch = useDashboardFetch();
  const [data, setData] = useState<ResultsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [moveItemId, setMoveItemId] = useState<string | null>(null);
  const [showInventoryPick, setShowInventoryPick] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [pending, setPending] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await authedFetch<ResultsResponse>(`/api/lists/${params.listId}/results`);
      setData(res);
      setTitleDraft(res.list.title);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [authedFetch, params.listId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const shareUrl =
    typeof window !== "undefined" && data ? `${window.location.origin}/l/${data.list.slug}` : "";

  async function copy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  async function createMatch(itemId: string, visitorId: string) {
    const key = `match:${itemId}:${visitorId}`;
    setPending(key);
    try {
      await authedFetch(`/api/matches`, {
        method: "POST",
        body: JSON.stringify({ itemId, visitorId }),
      });
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(null);
    }
  }

  async function deleteMatch(itemId: string) {
    const key = `unmatch:${itemId}`;
    setPending(key);
    try {
      await authedFetch(`/api/matches/${itemId}`, { method: "DELETE" });
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(null);
    }
  }

  async function deleteItem(itemId: string) {
    if (!confirm("Supprimer cet objet ? Les votes et le match associés seront perdus.")) return;
    const key = `deleteItem:${itemId}`;
    setPending(key);
    try {
      await authedFetch(`/api/items/${itemId}`, { method: "DELETE" });
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(null);
    }
  }

  async function deleteList() {
    if (!data) return;
    if (!confirm(`Supprimer définitivement « ${data.list.title} » ?`)) return;
    setPending("deleteList");
    try {
      await authedFetch(`/api/lists/${params.listId}`, { method: "DELETE" });
      router.replace("/dashboard/lists");
    } catch (e) {
      setError((e as Error).message);
      setPending(null);
    }
  }

  async function setKind(kind: string) {
    const key = `kind:${kind}`;
    setPending(key);
    try {
      await authedFetch(`/api/lists/${params.listId}`, {
        method: "PATCH",
        body: JSON.stringify({ kind }),
      });
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(null);
    }
  }

  async function saveTitle() {
    if (!titleDraft.trim() || !data) return;
    if (titleDraft.trim() === data.list.title) {
      setEditingTitle(false);
      return;
    }
    setPending("saveTitle");
    try {
      await authedFetch(`/api/lists/${params.listId}`, {
        method: "PATCH",
        body: JSON.stringify({ title: titleDraft.trim() }),
      });
      setEditingTitle(false);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(null);
    }
  }

  function setTab(tab: Tab) {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    router.replace(url.pathname + url.search);
  }

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        {error ? (
          <p className="px-6 text-center text-red-700">{error}</p>
        ) : (
          <PageLoader />
        )}
      </main>
    );
  }

  const kind = getListKind(data.list.kind);

  return (
    <main className="min-h-screen safe-top safe-bottom">
      <div className="mx-auto w-full max-w-md px-5 pb-8 pt-6">
        <BackButton href="/dashboard/lists">{tList("backToLists")}</BackButton>
        <div className="mt-2 flex items-start justify-between gap-3">
          {editingTitle ? (
            <div className="flex flex-1 gap-2">
              <input
                type="text"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    saveTitle();
                  }
                  if (e.key === "Escape") {
                    setEditingTitle(false);
                    setTitleDraft(data.list.title);
                  }
                }}
                autoFocus
                maxLength={80}
                className="flex-1 rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-lg font-bold text-neutral-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              />
              <LoadingButton
                loading={pending === "saveTitle"}
                loadingText="…"
                variant="primary"
                className="rounded-xl px-3 py-1.5 text-sm"
                onClick={saveTitle}
              >
                OK
              </LoadingButton>
            </div>
          ) : (
            <h1
              className="cursor-pointer text-2xl font-bold leading-tight"
              onClick={() => setEditingTitle(true)}
            >
              {data.list.title}
            </h1>
          )}
          <button
            type="button"
            onClick={deleteList}
            disabled={!!pending}
            className="shrink-0 rounded-xl px-2 py-1 text-sm text-neutral-500 hover:text-red-600 disabled:opacity-40"
            aria-label="Supprimer la liste"
          >
            {pending === "deleteList" ? <Spinner size="sm" /> : "🗑"}
          </button>
        </div>

        <AnimateIn className="mt-3 flex flex-wrap gap-2">
          {LIST_KINDS.map((k) => {
            const active = k.key === data.list.kind;
            return (
              <button
                key={k.key}
                type="button"
                disabled={!!pending}
                onClick={() => setKind(k.key)}
                className={`inline-flex min-h-11 items-center gap-1 rounded-2xl px-4 py-2.5 text-sm font-semibold shadow-sm ring-2 transition active:scale-[0.98] disabled:opacity-50 ${
                  active ? `${k.color} ring-transparent` : "bg-white text-neutral-800 ring-neutral-200 active:bg-neutral-50"
                }`}
              >
                {pending === `kind:${k.key}` ? <Spinner size="sm" /> : null}
                {k.emoji} {k.label}
              </button>
            );
          })}
        </AnimateIn>

        <nav className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-neutral-100 p-1.5 ring-2 ring-neutral-200">
          {(["items", "results", "share"] as Tab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setTab(tab)}
              className={`min-h-11 rounded-xl py-2.5 text-sm font-semibold transition active:scale-[0.98] ${
                tabParam === tab
                  ? "bg-white text-neutral-900 shadow-sm ring-2 ring-neutral-200"
                  : "text-neutral-600 active:bg-neutral-200/80"
              }`}
            >
              {tab === "items"
                ? tList("tabItems")
                : tab === "results"
                  ? tList("tabResults")
                  : tList("tabShare")}
            </button>
          ))}
        </nav>

        {tabParam === "items" && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              href={`/dashboard/${params.listId}/items/new`}
              className="rounded-2xl bg-brand-500 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm"
            >
              + {tList("addItem")}
            </Link>
            <button
              type="button"
              onClick={() => setShowInventoryPick(true)}
              className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-neutral-900 ring-1 ring-neutral-200 shadow-sm"
            >
              📦 {tList("fromInventory")}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {tabParam === "items" && (
          <ItemsTab
            listId={params.listId}
            items={data.items}
            pending={pending}
            onDelete={deleteItem}
            onMove={(id) => setMoveItemId(id)}
          />
        )}
        {tabParam === "results" && (
          <ResultsTab
            items={data.items}
            pending={pending}
            onMatch={createMatch}
            onUnmatch={deleteMatch}
          />
        )}
        {tabParam === "share" && (
          <ShareTab
            shareUrl={shareUrl}
            listTitle={data.list.title}
            copied={copied}
            onCopy={copy}
            kindLabel={kind.label}
          />
        )}
      </div>

      {showInventoryPick && (
        <InventoryPickModal
          listId={params.listId}
          onClose={() => setShowInventoryPick(false)}
          onDone={() => {
            setShowInventoryPick(false);
            refresh();
          }}
        />
      )}

      {moveItemId && (
        <MoveDialog
          itemId={moveItemId}
          currentListId={params.listId}
          onClose={() => setMoveItemId(null)}
          onDone={() => {
            setMoveItemId(null);
            refresh();
          }}
        />
      )}
    </main>
  );
}

function ItemsTab({
  listId,
  items,
  pending,
  onDelete,
  onMove,
}: {
  listId: string;
  items: Item[];
  pending: string | null;
  onDelete: (itemId: string) => void;
  onMove: (itemId: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-2xl bg-white p-6 text-center ring-1 ring-neutral-200">
        <p className="text-4xl">📸</p>
        <h2 className="mt-3 font-semibold">Pas encore d’objets</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Ajoute depuis l’inventaire ou crée un nouvel objet.
        </p>
      </div>
    );
  }
  return (
    <AnimateIn as="ul" className="mt-5 grid grid-cols-2 gap-3">
      {items.map((item) => (
        <li key={item.id} className="overflow-hidden rounded-2xl bg-white ring-1 ring-neutral-200">
          <Link href={`/dashboard/${listId}/items/${item.id}/edit`} className="block">
            <div className="relative aspect-square bg-neutral-100">
              <Image src={item.imageUrl} alt={item.label ?? ""} fill sizes="50vw" className="object-cover" />
            </div>
            <div className="space-y-1 p-2.5">
              {item.label && <p className="truncate text-sm font-medium">{item.label}</p>}
              <div className="flex flex-wrap gap-1">
                <EmojiBadge kind="room" value={item.room} />
                <EmojiBadge kind="category" value={item.category} />
              </div>
              {(item.tags ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {(item.tags ?? []).map((t) => (
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
          </Link>
          <div className="grid grid-cols-2 border-t border-neutral-100 text-xs">
            <button
              type="button"
              disabled={!!pending}
              onClick={() => onMove(item.id)}
              className="inline-flex items-center justify-center gap-1 py-2 text-neutral-600 hover:text-brand-500 disabled:opacity-40"
            >
              Déplacer
            </button>
            <button
              type="button"
              disabled={!!pending}
              onClick={() => onDelete(item.id)}
              className="inline-flex items-center justify-center gap-1 border-l border-neutral-100 py-2 text-neutral-500 hover:text-red-600 disabled:opacity-40"
            >
              {pending === `deleteItem:${item.id}` ? <Spinner size="sm" /> : null}
              Supprimer
            </button>
          </div>
        </li>
      ))}
    </AnimateIn>
  );
}

function ResultsTab({
  items,
  pending,
  onMatch,
  onUnmatch,
}: {
  items: Item[];
  pending: string | null;
  onMatch: (itemId: string, visitorId: string) => void;
  onUnmatch: (itemId: string) => void;
}) {
  const t = useTranslations("listDetail");
  const totalVotes = items.reduce((sum, it) => sum + it.votesYes.length + it.votesNo.length, 0);

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-2xl bg-white p-6 text-center ring-1 ring-neutral-200">
        <p className="text-4xl">📊</p>
        <p className="mt-3 text-sm text-neutral-600">{t("resultsEmpty")}</p>
      </div>
    );
  }

  return (
    <AnimateIn className="mt-5 space-y-4">
      <p className="text-sm text-neutral-500">
        {items.length} objet{items.length > 1 ? "s" : ""} · {totalVotes} vote{totalVotes > 1 ? "s" : ""}
      </p>
      {items.map((item) => {
        const total = item.votesYes.length + item.votesNo.length;
        const ratio = total > 0 ? Math.round((item.votesYes.length / total) * 100) : 0;
        return (
          <div key={item.id} className="overflow-hidden rounded-2xl bg-white ring-1 ring-neutral-200">
            <div className="flex gap-3 p-3">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                <Image src={item.imageUrl} alt="" fill sizes="80px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                {item.label && <p className="truncate font-semibold">{item.label}</p>}
                <div className="mt-1 flex flex-wrap gap-1">
                  <EmojiBadge kind="room" value={item.room} />
                  <EmojiBadge kind="category" value={item.category} />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                    <div className="h-full bg-emerald-500" style={{ width: `${ratio}%` }} />
                  </div>
                  <span className="text-xs text-neutral-600">
                    ✓ {item.votesYes.length} · ✗ {item.votesNo.length}
                  </span>
                </div>
              </div>
            </div>

            {item.match && (
              <div className="flex items-center justify-between gap-2 border-t border-neutral-100 bg-brand-50 px-3 py-2">
                <p className="text-sm">
                  {t("assignedTo", { name: item.match.displayName })}
                </p>
                <button
                  type="button"
                  disabled={!!pending}
                  onClick={() => onUnmatch(item.id)}
                  className="inline-flex min-h-9 items-center gap-1 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 ring-2 ring-neutral-200 active:bg-neutral-50 disabled:opacity-40"
                >
                  {pending === `unmatch:${item.id}` ? <Spinner size="sm" /> : null}
                  {t("unmatch")}
                </button>
              </div>
            )}

            {item.votesYes.length > 0 && (
              <div className="space-y-1 border-t border-neutral-100 p-3">
                {item.votesYes.map((v) => (
                  <div
                    key={v.visitorId}
                    className="flex items-center justify-between gap-2 rounded-xl bg-neutral-50 px-3 py-2"
                  >
                    <span className="truncate text-sm">✓ {v.displayName}</span>
                    {!item.match && (
                      <button
                        type="button"
                        disabled={!!pending}
                        onClick={() => onMatch(item.id, v.visitorId)}
                        className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-sm ring-2 ring-brand-600 active:scale-[0.98] active:bg-brand-600 disabled:opacity-50"
                      >
                        {pending === `match:${item.id}:${v.visitorId}` ? (
                          <Spinner size="sm" tone="white" />
                        ) : null}
                        {t("match")}
                      </button>
                    )}
                    {item.match && item.match.visitorId === v.visitorId && (
                      <span className="shrink-0 rounded-xl bg-brand-100 px-3 py-1.5 text-xs font-semibold text-brand-800 ring-1 ring-brand-200">
                        ✓ {t("assignedBadge")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </AnimateIn>
  );
}

function ShareTab({
  shareUrl,
  listTitle,
  copied,
  onCopy,
  kindLabel,
}: {
  shareUrl: string;
  listTitle: string;
  copied: boolean;
  onCopy: () => void;
  kindLabel: string;
}) {
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  async function onNativeShare() {
    if (!shareUrl) return;
    setShareError(null);

    if (!canNativeShare) {
      onCopy();
      return;
    }

    setSharing(true);
    try {
      await navigator.share({
        title: listTitle,
        text: `Vote sur ma liste « ${listTitle} » (${kindLabel.toLowerCase()})`,
        url: shareUrl,
      });
    } catch (e) {
      const err = e as Error;
      if (err.name !== "AbortError") {
        setShareError("Partage impossible. Copie le lien ci-dessous.");
      }
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="mt-6 space-y-4">
      <p className="text-sm text-neutral-600">
        Envoie le lien de ta liste <strong>{kindLabel.toLowerCase()}</strong> par WhatsApp, Messenger, SMS… Les votants n’ont pas besoin de compte, juste leur prénom.
      </p>
      <div className="break-all rounded-2xl bg-white p-4 font-mono text-sm ring-1 ring-neutral-200">
        {shareUrl}
      </div>
      <LoadingButton
        loading={sharing}
        loadingText="Ouverture…"
        variant="primary"
        className="w-full rounded-2xl px-4 py-3.5 text-lg"
        disabled={!shareUrl}
        onClick={onNativeShare}
      >
        <span aria-hidden>📤</span> Partager
      </LoadingButton>
      {canNativeShare && (
        <p className="text-center text-xs text-neutral-500">
          Ouvre le menu de partage de ton téléphone (apps installées).
        </p>
      )}
      <button
        type="button"
        onClick={onCopy}
        className="w-full rounded-2xl bg-white px-4 py-3 text-base font-semibold text-neutral-900 ring-1 ring-neutral-200 transition active:bg-neutral-50"
      >
        {copied ? "Lien copié ✓" : "Copier le lien"}
      </button>
      {shareError && (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">{shareError}</p>
      )}
      <p className="text-center text-xs text-neutral-500">
        Ajoute cette page à tes favoris pour retrouver les résultats.
      </p>
    </div>
  );
}
