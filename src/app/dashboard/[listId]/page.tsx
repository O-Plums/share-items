"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useAuthedFetch } from "@/lib/client";
import { EmojiBadge } from "@/components/EmojiBadge";

type Item = {
  id: string;
  imageUrl: string;
  label: string | null;
  room: string;
  category: string;
  sortOrder: number;
  votesYes: { visitorId: string; displayName: string }[];
  votesNo: { visitorId: string; displayName: string }[];
  match: { visitorId: string; displayName: string } | null;
};

type ResultsResponse = {
  list: { id: string; slug: string; title: string };
  items: Item[];
};

type Tab = "items" | "results" | "share";

export default function ListDetailPage() {
  const router = useRouter();
  const params = useParams<{ listId: string }>();
  const searchParams = useSearchParams();
  const tabParam = (searchParams.get("tab") as Tab | null) ?? "items";
  const authedFetch = useAuthedFetch();
  const [data, setData] = useState<ResultsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await authedFetch<ResultsResponse>(`/api/lists/${params.listId}/results`);
      setData(res);
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
    try {
      await authedFetch(`/api/matches`, {
        method: "POST",
        body: JSON.stringify({ itemId, visitorId }),
      });
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function deleteMatch(itemId: string) {
    try {
      await authedFetch(`/api/matches/${itemId}`, { method: "DELETE" });
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function deleteItem(itemId: string) {
    if (!confirm("Supprimer cet objet ? Les votes et le match associés seront perdus.")) return;
    try {
      await authedFetch(`/api/items/${itemId}`, { method: "DELETE" });
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function deleteList() {
    if (!data) return;
    if (!confirm(`Supprimer définitivement « ${data.list.title} » ?`)) return;
    try {
      await authedFetch(`/api/lists/${params.listId}`, { method: "DELETE" });
      router.replace("/dashboard");
    } catch (e) {
      setError((e as Error).message);
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
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-brand-500" />
        )}
      </main>
    );
  }

  return (
    <main className="min-h-screen safe-top safe-bottom">
      <div className="mx-auto w-full max-w-md px-5 pb-32 pt-6">
        <Link href="/dashboard" className="text-sm text-neutral-500">
          ← Mes listes
        </Link>
        <div className="mt-2 flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold leading-tight">{data.list.title}</h1>
          <button
            type="button"
            onClick={deleteList}
            className="shrink-0 rounded-xl px-2 py-1 text-sm text-neutral-500 hover:text-red-600"
            aria-label="Supprimer la liste"
          >
            🗑
          </button>
        </div>

        <nav className="mt-5 grid grid-cols-3 gap-1 rounded-2xl bg-neutral-200/60 p-1">
          {(["items", "results", "share"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-xl py-2 text-sm font-medium transition ${
                tabParam === t ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600"
              }`}
            >
              {t === "items" ? "Objets" : t === "results" ? "Résultats" : "Lien"}
            </button>
          ))}
        </nav>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {tabParam === "items" && (
          <ItemsTab
            listId={params.listId}
            items={data.items}
            onDelete={deleteItem}
          />
        )}
        {tabParam === "results" && (
          <ResultsTab items={data.items} onMatch={createMatch} onUnmatch={deleteMatch} />
        )}
        {tabParam === "share" && (
          <ShareTab shareUrl={shareUrl} copied={copied} onCopy={copy} />
        )}
      </div>

      {tabParam === "items" && (
        <div className="fixed inset-x-0 bottom-0 safe-bottom">
          <div className="mx-auto w-full max-w-md px-5 pb-3">
            <Link
              href={`/dashboard/${params.listId}/items/new`}
              className="block w-full rounded-2xl bg-brand-500 px-4 py-4 text-center text-lg font-semibold text-white shadow-lg shadow-brand-500/20 transition active:bg-brand-600"
            >
              + Ajouter un objet
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

function ItemsTab({
  listId,
  items,
  onDelete,
}: {
  listId: string;
  items: Item[];
  onDelete: (itemId: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-2xl bg-white p-6 text-center ring-1 ring-neutral-200">
        <p className="text-4xl">📸</p>
        <h2 className="mt-3 font-semibold">Pas encore d’objets</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Ajoute une photo + 2 emojis et c’est parti.
        </p>
      </div>
    );
  }
  return (
    <ul className="mt-5 grid grid-cols-2 gap-3">
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
            </div>
          </Link>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="block w-full border-t border-neutral-100 py-2 text-xs text-neutral-500 hover:text-red-600"
          >
            Supprimer
          </button>
        </li>
      ))}
    </ul>
  );
}

function ResultsTab({
  items,
  onMatch,
  onUnmatch,
}: {
  items: Item[];
  onMatch: (itemId: string, visitorId: string) => void;
  onUnmatch: (itemId: string) => void;
}) {
  const totalVotes = items.reduce((sum, it) => sum + it.votesYes.length + it.votesNo.length, 0);

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-2xl bg-white p-6 text-center ring-1 ring-neutral-200">
        <p className="text-4xl">📊</p>
        <p className="mt-3 text-sm text-neutral-600">Ajoute des objets pour voir les résultats.</p>
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-4">
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
                  🤝 Matché à <span className="font-semibold">{item.match.displayName}</span>
                </p>
                <button
                  type="button"
                  onClick={() => onUnmatch(item.id)}
                  className="rounded-lg px-2 py-1 text-xs font-medium text-neutral-700 hover:text-red-600"
                >
                  Annuler
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
                        onClick={() => onMatch(item.id, v.visitorId)}
                        className="shrink-0 rounded-lg bg-brand-500 px-3 py-1 text-xs font-semibold text-white active:bg-brand-600"
                      >
                        Matcher
                      </button>
                    )}
                    {item.match && item.match.visitorId === v.visitorId && (
                      <span className="shrink-0 rounded-lg bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                        ✓ matché
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ShareTab({
  shareUrl,
  copied,
  onCopy,
}: {
  shareUrl: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="mt-6 space-y-4">
      <p className="text-sm text-neutral-600">
        Partage ce lien à tes proches. Pas besoin de compte, ils saisissent juste leur prénom.
      </p>
      <div className="break-all rounded-2xl bg-white p-4 font-mono text-sm ring-1 ring-neutral-200">
        {shareUrl}
      </div>
      <button
        type="button"
        onClick={onCopy}
        className="w-full rounded-2xl bg-brand-500 px-4 py-3 text-lg font-semibold text-white transition active:bg-brand-600"
      >
        {copied ? "Lien copié ✓" : "Copier le lien"}
      </button>
      <p className="text-center text-xs text-neutral-500">
        Ajoute cette page à tes favoris pour retrouver les résultats.
      </p>
    </div>
  );
}
