"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthedFetch } from "@/lib/client";

type ListSummary = {
  id: string;
  slug: string;
  title: string;
  createdAt: string;
  _count: { items: number };
  items: { id: string; imageUrl: string }[];
};

export default function DashboardPage() {
  const authedFetch = useAuthedFetch();
  const [lists, setLists] = useState<ListSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    authedFetch<{ lists: ListSummary[] }>("/api/lists")
      .then((data) => {
        if (!alive) return;
        setLists(data.lists);
      })
      .catch((e: Error) => {
        if (!alive) return;
        setError(e.message);
      });
    return () => {
      alive = false;
    };
  }, [authedFetch]);

  return (
    <main className="min-h-screen safe-top safe-bottom">
      <div className="mx-auto w-full max-w-md px-5 pb-32 pt-8">
        <header className="flex items-center justify-between">
          <div>
            <Link href="/" className="text-xs uppercase tracking-widest text-neutral-500">
              Share Items
            </Link>
            <h1 className="mt-1 text-2xl font-bold">Mes listes</h1>
          </div>
        </header>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {lists === null ? (
          <div className="mt-10 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-brand-500" />
          </div>
        ) : lists.length === 0 ? (
          <div className="mt-10 rounded-2xl bg-white p-6 text-center ring-1 ring-neutral-200">
            <p className="text-4xl">📦</p>
            <h2 className="mt-3 font-semibold">Pas encore de liste</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Commence par créer ta première liste d’objets à partager.
            </p>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {lists.map((list) => (
              <li key={list.id}>
                <Link
                  href={`/dashboard/${list.id}`}
                  className="flex items-center gap-4 rounded-2xl bg-white p-3 ring-1 ring-neutral-200 transition active:scale-[0.98]"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                    {list.items[0] && (
                      <Image
                        src={list.items[0].imageUrl}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{list.title}</p>
                    <p className="text-sm text-neutral-500">
                      {list._count.items} objet{list._count.items > 1 ? "s" : ""}
                    </p>
                  </div>
                  <span className="text-neutral-400">›</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 safe-bottom">
        <div className="mx-auto w-full max-w-md px-5 pb-3">
          <Link
            href="/dashboard/new"
            className="block w-full rounded-2xl bg-brand-500 px-4 py-4 text-center text-lg font-semibold text-white shadow-lg shadow-brand-500/20 transition active:bg-brand-600"
          >
            + Nouvelle liste
          </Link>
        </div>
      </div>
    </main>
  );
}
