"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useDashboardFetch } from "@/lib/client";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { getListKind, isValidListKind } from "@/lib/list-kinds";

const DEFAULT_TITLES: Record<string, string> = {
  keep: "À garder",
  donate: "À donner",
  sell: "À vendre",
  custom: "",
};

export default function NewListPage() {
  const router = useRouter();
  const authedFetch = useDashboardFetch();
  const search = useSearchParams();
  const kindParam = search.get("kind");
  const initialKind = kindParam && isValidListKind(kindParam) ? kindParam : "custom";
  const fromInventory = search.get("from") === "inventory";
  const itemsParam = search.get("items") ?? "";
  const presetItems = itemsParam ? itemsParam.split(",").filter(Boolean) : [];

  const [kind, setKind] = useState(initialKind);
  const [title, setTitle] = useState(DEFAULT_TITLES[initialKind] ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      router.replace(`/dashboard/${list.id}`);
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen safe-top safe-bottom">
      <div className="mx-auto w-full max-w-md px-5 pt-6">
        <Link href={fromInventory ? "/dashboard/inventory" : "/dashboard/lists"} className="text-sm text-neutral-500">
          ← Retour
        </Link>
        <h1 className="mt-4 text-2xl font-bold">Nouvelle liste</h1>
        <p className="mt-1 text-neutral-600">
          {presetItems.length > 0
            ? `${presetItems.length} objet${presetItems.length > 1 ? "s" : ""} sera${presetItems.length > 1 ? "ont" : ""} ajouté${presetItems.length > 1 ? "s" : ""}.`
            : "Donne un nom à ta liste."}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2">
          {(["keep", "donate", "sell", "custom"] as const).map((k) => {
            const kk = getListKind(k);
            const active = kind === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setKind(k);
                  if (!title || Object.values(DEFAULT_TITLES).includes(title)) {
                    setTitle(DEFAULT_TITLES[k] ?? "");
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
            placeholder={kind === "custom" ? "Ex. Débarras appart" : DEFAULT_TITLES[kind]}
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
            loadingText="Création…"
            variant="primary"
            className="w-full rounded-2xl px-4 py-4 text-lg"
            disabled={!title.trim()}
          >
            Créer
          </LoadingButton>
        </form>
      </div>
    </main>
  );
}
