"use client";

import { useEffect, useState } from "react";
import { useDashboardFetch } from "@/lib/client";

export type Tag = { id: string; label: string };

type Props = {
  selected: string[];
  onChange: (next: string[]) => void;
  max?: number;
};

const DEFAULT_MAX = 3;

export function TagPicker({ selected, onChange, max = DEFAULT_MAX }: Props) {
  const authedFetch = useDashboardFetch();
  const [tags, setTags] = useState<Tag[]>([]);
  const [creating, setCreating] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authedFetch<{ tags: Tag[] }>("/api/tags")
      .then((d) => setTags(d.tags))
      .catch(() => {});
  }, [authedFetch]);

  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else if (selected.length < max) {
      onChange([...selected, id]);
    }
  }

  async function createTag() {
    const label = newLabel.trim();
    if (!label) return;
    setError(null);
    try {
      const { tag } = await authedFetch<{ tag: Tag }>("/api/tags", {
        method: "POST",
        body: JSON.stringify({ label }),
      });
      setTags((prev) => (prev.some((t) => t.id === tag.id) ? prev : [...prev, tag].sort((a, b) => a.label.localeCompare(b.label))));
      if (selected.length < max) onChange([...selected, tag.id]);
      setNewLabel("");
      setCreating(false);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => {
          const active = selected.includes(t.id);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => toggle(t.id)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ring-1 transition active:scale-95 ${
                active
                  ? "bg-brand-500 text-white ring-brand-500"
                  : "bg-white text-neutral-700 ring-neutral-200 hover:ring-neutral-300"
              }`}
            >
              {t.label}
            </button>
          );
        })}
        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-neutral-600 ring-1 ring-dashed ring-neutral-300 active:scale-95"
          >
            + Nouveau tag
          </button>
        )}
      </div>

      {creating && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Ex. chambre Camille"
            maxLength={24}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                createTag();
              }
              if (e.key === "Escape") {
                setCreating(false);
                setNewLabel("");
              }
            }}
            className="flex-1 rounded-2xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
          <button
            type="button"
            onClick={createTag}
            disabled={!newLabel.trim()}
            className="rounded-2xl bg-brand-500 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            OK
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <p className="mt-2 text-xs text-neutral-500">
        {selected.length}/{max} sélectionnés
      </p>
    </div>
  );
}
