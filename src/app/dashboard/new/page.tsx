"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthedFetch } from "@/lib/client";

export default function NewListPage() {
  const router = useRouter();
  const authedFetch = useAuthedFetch();
  const [title, setTitle] = useState("");
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
        body: JSON.stringify({ title }),
      });
      router.replace(`/dashboard/${list.id}`);
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen safe-top safe-bottom">
      <div className="mx-auto w-full max-w-md px-5 pt-6">
        <Link href="/dashboard" className="text-sm text-neutral-500">
          ← Mes listes
        </Link>
        <h1 className="mt-4 text-2xl font-bold">Nouvelle liste</h1>
        <p className="mt-1 text-neutral-600">Donne un nom à ta liste.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex. Débarras appart"
            maxLength={80}
            autoFocus
            className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-lg text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="w-full rounded-2xl bg-brand-500 px-4 py-4 text-lg font-semibold text-white transition disabled:opacity-40 active:bg-brand-600"
          >
            {loading ? "Création…" : "Créer"}
          </button>
        </form>
      </div>
    </main>
  );
}
