"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useDashboardFetch, uploadImage } from "@/lib/client";
import { CATEGORIES } from "@/lib/taxonomies";
import { EmojiGrid } from "@/components/EmojiGrid";
import { RoomPicker } from "@/components/RoomPicker";
import { TagPicker } from "@/components/TagPicker";
import { ImageUploadOverlay } from "@/components/ui/ImageUploadOverlay";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { PageLoader } from "@/components/ui/PageLoader";

type ItemData = {
  id: string;
  imageUrl: string;
  room: string;
  category: string;
  label: string | null;
  tags: { id: string; label: string }[];
};

type Preview = Pick<ItemData, "id" | "imageUrl" | "room" | "category" | "label" | "tags">;

type Props = {
  itemId: string | null;
  preview?: Preview | null;
  onClose: () => void;
  onSaved: () => void;
};

export function InventoryEditSheet({ itemId, preview, onClose, onSaved }: Props) {
  const authedFetch = useDashboardFetch();
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(preview?.imageUrl ?? null);
  const [room, setRoom] = useState<string | null>(preview?.room ?? null);
  const [category, setCategory] = useState<string | null>(preview?.category ?? null);
  const [label, setLabel] = useState(preview?.label ?? "");
  const [tagIds, setTagIds] = useState<string[]>(preview?.tags.map((t) => t.id) ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = !!itemId;

  useEffect(() => {
    if (!itemId) return;
    let alive = true;
    setLoading(true);
    setError(null);
    if (preview) {
      setImageUrl(preview.imageUrl);
      setRoom(preview.room);
      setCategory(preview.category);
      setLabel(preview.label ?? "");
      setTagIds(preview.tags.map((t) => t.id));
    }
    authedFetch<{ item: ItemData }>(`/api/items/${itemId}`)
      .then((d) => {
        if (!alive) return;
        setImageUrl(d.item.imageUrl);
        setRoom(d.item.room);
        setCategory(d.item.category);
        setLabel(d.item.label ?? "");
        setTagIds(d.item.tags.map((t) => t.id));
      })
      .catch((e: Error) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [authedFetch, itemId, preview?.id]);

  async function onFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setImageUrl(url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) onFile(f);
  }

  async function save() {
    if (!itemId || !imageUrl || !room || !category) return;
    setSaving(true);
    setError(null);
    try {
      await authedFetch(`/api/items/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify({
          imageUrl,
          room,
          category,
          label: label.trim() || null,
          tagIds,
        }),
      });
      onSaved();
      onClose();
    } catch (e) {
      setError((e as Error).message);
      setSaving(false);
    }
  }

  async function remove() {
    if (!itemId) return;
    if (!confirm("Supprimer cet objet définitivement ?")) return;
    setDeleting(true);
    setError(null);
    try {
      await authedFetch(`/api/items/${itemId}`, { method: "DELETE" });
      onSaved();
      onClose();
    } catch (e) {
      setError((e as Error).message);
      setDeleting(false);
    }
  }

  const canSave = !!imageUrl && !!room && !!category;
  const busy = saving || deleting || uploading;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) onClose();
            }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[92vh] w-full max-w-md rounded-t-3xl bg-white shadow-2xl"
          >
            <div className="safe-bottom flex max-h-[92vh] flex-col">
              <div className="flex justify-center pt-2">
                <div className="h-1.5 w-10 rounded-full bg-neutral-300" />
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <h2 className="text-lg font-bold">Modifier l’objet</h2>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={busy}
                  className="rounded-full px-3 py-1 text-sm text-neutral-500 active:bg-neutral-100 disabled:opacity-50"
                >
                  Fermer
                </button>
              </div>

              {error && (
                <div className="mx-5 mb-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4">
                {loading && !preview ? (
                  <PageLoader label="Chargement…" className="py-10" />
                ) : (
                  <div className="space-y-6 pb-2">
                    <section>
                      <p className="text-sm font-medium text-neutral-600">Photo</p>
                      <input
                        ref={cameraRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                        capture="environment"
                        hidden
                        onChange={pickFile}
                      />
                      <input
                        ref={galleryRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                        hidden
                        onChange={pickFile}
                      />
                      <div className="relative mt-2 aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-neutral-200">
                        {imageUrl && (
                          <Image src={imageUrl} alt="" fill sizes="100vw" className="object-cover" />
                        )}
                        <ImageUploadOverlay active={uploading} />
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <LoadingButton
                          loading={uploading}
                          loadingText="…"
                          variant="secondary"
                          className="rounded-xl py-2.5 text-sm"
                          disabled={busy}
                          onClick={() => cameraRef.current?.click()}
                        >
                          📸 Photo
                        </LoadingButton>
                        <LoadingButton
                          loading={uploading}
                          loadingText="…"
                          variant="secondary"
                          className="rounded-xl py-2.5 text-sm"
                          disabled={busy}
                          onClick={() => galleryRef.current?.click()}
                        >
                          🖼️ Galerie
                        </LoadingButton>
                      </div>
                    </section>

                    <section>
                      <p className="text-sm font-medium text-neutral-600">Pièce</p>
                      <div className="mt-2">
                        <RoomPicker selected={room} onSelect={setRoom} />
                      </div>
                    </section>

                    <section>
                      <p className="text-sm font-medium text-neutral-600">Type</p>
                      <div className="mt-2">
                        <EmojiGrid
                          items={CATEGORIES}
                          selected={category}
                          onSelect={setCategory}
                        />
                      </div>
                    </section>

                    <section>
                      <p className="text-sm font-medium text-neutral-600">Tags (optionnel)</p>
                      <div className="mt-2">
                        <TagPicker selected={tagIds} onChange={setTagIds} />
                      </div>
                    </section>

                    <section>
                      <label htmlFor="inv-edit-label" className="text-sm font-medium text-neutral-600">
                        Nom (optionnel)
                      </label>
                      <input
                        id="inv-edit-label"
                        type="text"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder="Ex. Frigo Samsung"
                        maxLength={60}
                        enterKeyHint="done"
                        disabled={busy}
                        className="mt-1 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 disabled:opacity-60"
                      />
                    </section>
                  </div>
                )}
              </div>

              <div className="shrink-0 space-y-2 border-t border-neutral-100 px-5 py-3">
                <LoadingButton
                  loading={saving}
                  loadingText="Enregistrement…"
                  variant="primary"
                  className="w-full rounded-2xl py-3.5 text-base"
                  disabled={!canSave || busy}
                  onClick={save}
                >
                  Enregistrer
                </LoadingButton>
                <LoadingButton
                  loading={deleting}
                  loadingText="Suppression…"
                  variant="danger"
                  className="w-full rounded-2xl py-2.5 text-sm"
                  disabled={busy}
                  onClick={remove}
                >
                  Supprimer l’objet
                </LoadingButton>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
