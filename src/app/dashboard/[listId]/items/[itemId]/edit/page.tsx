"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ItemWizard } from "@/components/ItemWizard";
import { useAuthedFetch } from "@/lib/client";

type Item = {
  id: string;
  imageUrl: string;
  room: string;
  category: string;
  label: string | null;
};

export default function EditItemPage() {
  const { listId, itemId } = useParams<{ listId: string; itemId: string }>();
  const authedFetch = useAuthedFetch();
  const [item, setItem] = useState<Item | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    authedFetch<{ list: { items: Item[] } }>(`/api/lists/${listId}`)
      .then((data) => {
        if (!alive) return;
        const found = data.list.items.find((i) => i.id === itemId);
        if (!found) setError("Objet introuvable");
        else setItem(found);
      })
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [authedFetch, listId, itemId]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <p className="text-center text-red-700">{error}</p>
      </main>
    );
  }
  if (!item) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-brand-500" />
      </main>
    );
  }
  return (
    <ItemWizard
      listId={listId}
      itemId={itemId}
      initial={{
        imageUrl: item.imageUrl,
        room: item.room,
        category: item.category,
        label: item.label,
      }}
    />
  );
}
