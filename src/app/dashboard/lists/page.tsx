"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDashboardFetch } from "@/lib/client";
import { getListKind } from "@/lib/list-kinds";

type ListSummary = {
  id: string;
  slug: string;
  title: string;
  kind: string;
  createdAt: string;
  _count: { items: number };
  items: { id: string; imageUrl: string }[];
};

export default function ListsPage() {
  const authedFetch = useDashboardFetch();
  const [lists, setLists] = useState<ListSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    authedFetch<{ lists: ListSummary[] }>("/api/lists")
      .then((d) => {
        if (alive) setLists(d.lists);
      })
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [authedFetch]);

  return (
    <main className="min-h-screen safe-top safe-bottom">
      <div className="mx-auto w-full max-w-md px-5 pb-32 pt-6">
        <header>
          <p className="text-xs uppercase tracking-widest text-neutral-500">Listes</p>
          <h1 className="mt-1 text-2xl font-bold">Tes campagnes</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Crée une liste, ajoute des objets, partage le lien aux votants.
          </p>
        </header>

        <Link
          href="/dashboard/lists/new"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 px-4 py-3.5 text-base font-semibold text-white shadow-sm transition active:bg-brand-600"
        >
          <span className="text-lg leading-none">＋</span>
          Nouvelle liste
        </Link>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <section className="mt-6">
          <p className="text-sm font-medium text-neutral-700">Mes listes</p>
          {lists === null ? (
            <div className="mt-6 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-brand-500" />
            </div>
          ) : lists.length === 0 ? (
            <div className="mt-3 rounded-2xl bg-white p-6 text-center ring-1 ring-neutral-200">
              <p className="text-3xl">📭</p>
              <p className="mt-2 text-sm text-neutral-600">
                Aucune liste pour l’instant. Crée ta première campagne ci-dessus.
              </p>
            </div>
          ) : (
            <ul className="mt-3 space-y-3">
              {lists.map((list) => {
                const kind = getListKind(list.kind);
                return (
                  <li key={list.id}>
                    <Link
                      href={`/dashboard/${list.id}`}
                      className="flex items-center gap-4 rounded-2xl bg-white p-3 ring-1 ring-neutral-200 transition active:scale-[0.98]"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                        {list.items[0] ? (
                          <Image
                            src={list.items[0].imageUrl}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-2xl">
                            {kind.emoji}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{list.title}</p>
                        <p className="mt-0.5 flex items-center gap-2 text-sm text-neutral-500">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${kind.color}`}
                          >
                            {kind.emoji} {kind.label}
                          </span>
                          <span>{list._count.items} obj.</span>
                        </p>
                      </div>
                      <span className="text-neutral-400">›</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="mt-8 border-t border-neutral-200 pt-6">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Créer par type
          </p>
          <p className="mt-0.5 text-sm text-neutral-600">Raccourcis pour démarrer vite.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {(["keep", "donate", "sell", "custom"] as const).map((k) => {
              const kind = getListKind(k);
              return (
                <Link
                  key={k}
                  href={`/dashboard/lists/new?kind=${k}`}
                  className={`flex flex-col items-start gap-1 rounded-2xl bg-white p-3 text-left ring-1 transition active:scale-[0.98] ${kind.color}`}
                >
                  <span className="text-2xl">{kind.emoji}</span>
                  <span className="text-sm font-semibold">{kind.label}</span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
