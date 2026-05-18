"use client";

import { useEffect, useRef, useState } from "react";
import { useDashboardFetch } from "@/lib/client";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { PageLoader } from "@/components/ui/PageLoader";

export type Tag = { id: string; label: string };

type Props = {
  selected: string[];
  onChange: (next: string[]) => void;
  max?: number;
};

const DEFAULT_MAX = 3;

export function TagPicker({ selected, onChange, max = DEFAULT_MAX }: Props) {
  const authedFetch = useDashboardFetch();
  const createInputRef = useRef<HTMLInputElement>(null);
  const [tags, setTags] = useState<Tag[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [savingTag, setSavingTag] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authedFetch<{ tags: Tag[] }>("/api/tags")
      .then((d) => setTags(d.tags))
      .catch(() => setTags([]));
  }, [authedFetch]);

  function scrollInputIntoView() {
    requestAnimationFrame(() => {
      createInputRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  }

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
    setSavingTag(true);
    try {
      const { tag } = await authedFetch<{ tag: Tag }>("/api/tags", {
        method: "POST",
        body: JSON.stringify({ label }),
      });
      setTags((prev) => {
        const list = prev ?? [];
        return list.some((t) => t.id === tag.id)
          ? list
          : [...list, tag].sort((a, b) => a.label.localeCompare(b.label));
      });
      if (selected.length < max) onChange([...selected, tag.id]);
      setNewLabel("");
      setCreating(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSavingTag(false);
    }
  }

  if (tags === null) {
    return <PageLoader label="Tags…" className="py-4" />;
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
            onClick={() => {
              setCreating(true);
              scrollInputIntoView();
            }}
            className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-neutral-600 ring-1 ring-dashed ring-neutral-300 active:scale-95"
          >
            + Nouveau tag
          </button>
        )}
      </div>

      {creating && (
        <div className="mt-3 flex gap-2">
          <input
            ref={createInputRef}
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Ex. chambre Camille"
            maxLength={24}
            enterKeyHint="done"
            autoFocus
            onFocus={scrollInputIntoView}
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
            className="min-w-0 flex-1 rounded-2xl border border-neutral-300 bg-white px-3 py-2.5 text-base text-neutral-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
          <LoadingButton
            type="button"
            onClick={createTag}
            loading={savingTag}
            loadingText="…"
            variant="primary"
            className="shrink-0 rounded-2xl px-3 py-2.5 text-sm"
            disabled={!newLabel.trim()}
          >
            OK
          </LoadingButton>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <p className="mt-2 text-xs text-neutral-500">
        {selected.length}/{max} sélectionnés
      </p>
    </div>
  );
}
