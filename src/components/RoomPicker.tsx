"use client";

import { useState } from "react";
import { ROOMS } from "@/lib/taxonomies";
import type { Taxonomy } from "@/lib/taxonomies";
import { EmojiGrid } from "./EmojiGrid";
import { useUserRooms } from "./UserRoomsProvider";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { PageLoader } from "@/components/ui/PageLoader";
import { useDashboardFetch } from "@/lib/client";

const ROOM_EMOJI_OPTIONS = [
  "🏠",
  "🏡",
  "🛏️",
  "🛋️",
  "🍳",
  "🚿",
  "🧺",
  "🏚️",
  "🌳",
  "📦",
  "🚪",
  "💼",
  "📚",
  "🎮",
  "🔧",
  "🪴",
] as const;

type Props = {
  selected: string | null;
  onSelect: (key: string) => void;
};

export function RoomPicker({ selected, onSelect }: Props) {
  const authedFetch = useDashboardFetch();
  const { rooms, loaded, addRoom } = useUserRooms();
  const [creating, setCreating] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newEmoji, setNewEmoji] = useState<string>(ROOM_EMOJI_OPTIONS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetCreateForm() {
    setCreating(false);
    setNewLabel("");
    setNewEmoji(ROOM_EMOJI_OPTIONS[0]);
    setError(null);
  }

  const customItems: Taxonomy[] = rooms.map((r) => ({
    key: r.id,
    emoji: r.emoji,
    label: r.label,
  }));

  async function createRoom() {
    const label = newLabel.trim();
    if (!label) return;
    setError(null);
    setSaving(true);
    try {
      const { room } = await authedFetch<{ room: { id: string; label: string; emoji: string } }>(
        "/api/rooms",
        { method: "POST", body: JSON.stringify({ label, emoji: newEmoji }) },
      );
      addRoom(room);
      onSelect(room.id);
      resetCreateForm();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) {
    return <PageLoader label="Pièces…" className="py-4" />;
  }

  return (
    <div className="space-y-6">
      <EmojiGrid items={ROOMS} selected={selected} onSelect={onSelect} />

      {customItems.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-medium text-neutral-600">Mes pièces</p>
          <EmojiGrid items={customItems} selected={selected} onSelect={onSelect} />
        </div>
      )}

      {!creating ? (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="w-full rounded-2xl border border-dashed border-neutral-300 bg-white py-3 text-sm font-medium text-neutral-600 active:scale-[0.99]"
        >
          + Nouvelle pièce
        </button>
      ) : (
        <div className="rounded-2xl border border-neutral-200 bg-white p-3">
          <p className="text-sm font-medium text-neutral-700">Créer une pièce</p>

          <p className="mt-3 text-xs font-medium text-neutral-500">Emoji</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {ROOM_EMOJI_OPTIONS.map((emoji) => {
              const active = newEmoji === emoji;
              return (
                <button
                  key={emoji}
                  type="button"
                  aria-label={`Emoji ${emoji}`}
                  aria-pressed={active}
                  onClick={() => setNewEmoji(emoji)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition active:scale-95 ${
                    active
                      ? "bg-brand-50 ring-2 ring-brand-500"
                      : "bg-neutral-50 ring-1 ring-neutral-200 hover:ring-neutral-300"
                  }`}
                >
                  {emoji}
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-xs font-medium text-neutral-500">Nom</p>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Ex. Bureau, Cave…"
              maxLength={24}
              enterKeyHint="done"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  createRoom();
                }
                if (e.key === "Escape") resetCreateForm();
              }}
              className="flex-1 rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-base text-neutral-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
            <LoadingButton
              type="button"
              onClick={createRoom}
              loading={saving}
              loadingText="…"
              variant="primary"
              className="shrink-0 rounded-xl px-4 py-2.5 text-sm"
              disabled={!newLabel.trim()}
            >
              OK
            </LoadingButton>
          </div>
          <button type="button" onClick={resetCreateForm} className="mt-2 text-xs text-neutral-500">
            Annuler
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
