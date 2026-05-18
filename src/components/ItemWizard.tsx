"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDashboardFetch, uploadImage } from "@/lib/client";
import { CATEGORIES, ROOMS } from "@/lib/taxonomies";
import { EmojiGrid } from "./EmojiGrid";
import { TagPicker } from "./TagPicker";

type Mode =
  | { kind: "inventory" }
  | { kind: "list"; listId: string }
  | { kind: "edit"; itemId: string };

type Props = {
  mode: Mode;
  initial?: {
    imageUrl: string;
    room: string;
    category: string;
    label: string | null;
    tagIds?: string[];
  };
  redirectTo?: string;
};

type Step = 1 | 2 | 3;

type PermissionError = "camera" | "gallery" | null;

export function ItemWizard({ mode, initial, redirectTo }: Props) {
  const router = useRouter();
  const authedFetch = useDashboardFetch();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>(initial ? 2 : 1);
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.imageUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [room, setRoom] = useState<string | null>(initial?.room ?? null);
  const [category, setCategory] = useState<string | null>(initial?.category ?? null);
  const [label, setLabel] = useState(initial?.label ?? "");
  const [tagIds, setTagIds] = useState<string[]>(initial?.tagIds ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState<PermissionError>(null);

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

  function openSource(source: "camera" | "gallery") {
    setPermissionDenied(null);
    const ref = source === "camera" ? cameraInputRef : galleryInputRef;
    const input = ref.current;
    if (!input) return;
    try {
      input.value = "";
      input.click();
    } catch {
      setPermissionDenied(source);
    }
  }

  function onInputChange(source: "camera" | "gallery", e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) {
      // user dismissed picker — could be permission denied on mobile
      return;
    }
    setPermissionDenied(null);
    onFile(f);
  }

  async function save() {
    if (!imageUrl || !room || !category) return;
    setSaving(true);
    setError(null);
    try {
      const body = {
        imageUrl,
        room,
        category,
        label: label.trim() || null,
        tagIds,
      };
      if (mode.kind === "edit") {
        await authedFetch(`/api/items/${mode.itemId}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      } else if (mode.kind === "list") {
        await authedFetch(`/api/lists/${mode.listId}/items`, {
          method: "POST",
          body: JSON.stringify(body),
        });
      } else {
        await authedFetch(`/api/inventory/items`, {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      const dest =
        redirectTo ??
        (mode.kind === "list"
          ? `/dashboard/${mode.listId}?tab=items`
          : "/dashboard/inventory");
      router.replace(dest);
    } catch (e) {
      setError((e as Error).message);
      setSaving(false);
    }
  }

  function goBack() {
    if (step === 1) router.back();
    else setStep(((step - 1) as Step) || 1);
  }

  function next() {
    if (step === 1 && imageUrl) setStep(2);
    else if (step === 2 && room) setStep(3);
  }

  const canNextFrom1 = !!imageUrl;
  const canNextFrom2 = !!room;
  const canSave = !!imageUrl && !!room && !!category;

  return (
    <main className="min-h-screen safe-top safe-bottom">
      <div className="mx-auto w-full max-w-md px-5 pb-24 pt-6">
        <button type="button" onClick={goBack} className="text-sm text-neutral-500">
          ← Retour
        </button>

        <div className="mt-4 flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition ${
                s <= step ? "bg-brand-500" : "bg-neutral-200"
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {step === 1 && (
          <section className="mt-6">
            <h1 className="text-2xl font-bold">Une photo de l’objet</h1>
            <p className="mt-1 text-neutral-600">
              Prends une photo ou choisis-en une dans ta galerie.
            </p>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              capture="environment"
              hidden
              onChange={(e) => onInputChange("camera", e)}
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              hidden
              onChange={(e) => onInputChange("gallery", e)}
            />

            <div className="mt-6 space-y-3">
              <button
                type="button"
                disabled={uploading}
                onClick={() => openSource("camera")}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 px-4 py-4 text-lg font-semibold text-white transition disabled:opacity-40 active:bg-brand-600"
              >
                <span>📸</span>
                <span>Prendre une photo</span>
              </button>
              <button
                type="button"
                disabled={uploading}
                onClick={() => openSource("gallery")}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-4 text-lg font-semibold text-neutral-900 ring-1 ring-neutral-200 transition disabled:opacity-40 active:bg-neutral-50"
              >
                <span>🖼️</span>
                <span>Choisir dans la galerie</span>
              </button>

              {permissionDenied && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {permissionDenied === "camera"
                    ? "L’accès à la caméra a été refusé. Autorise la caméra pour ce site dans les réglages du navigateur, puis réessaie."
                    : "L’accès aux photos a été refusé. Autorise l’accès aux photos pour ce site dans les réglages du navigateur, puis réessaie."}
                </div>
              )}

              {uploading && (
                <div className="rounded-xl bg-neutral-100 px-4 py-3 text-sm text-neutral-700">
                  Envoi de la photo…
                </div>
              )}

              {imageUrl && (
                <>
                  <div className="relative mt-3 aspect-square overflow-hidden rounded-2xl bg-neutral-100">
                    <Image src={imageUrl} alt="" fill sizes="100vw" className="object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={next}
                    disabled={!canNextFrom1}
                    className="w-full rounded-2xl bg-brand-500 px-4 py-3 text-base font-semibold text-white transition disabled:opacity-40 active:bg-brand-600"
                  >
                    Continuer →
                  </button>
                </>
              )}
            </div>
          </section>
        )}

        {step === 2 && imageUrl && (
          <section className="mt-6">
            <h1 className="text-2xl font-bold">Où se trouve l’objet&nbsp;?</h1>
            <p className="mt-1 text-neutral-600">Choisis une pièce.</p>
            <div className="mt-6">
              <EmojiGrid items={ROOMS} selected={room} onSelect={(k) => setRoom(k)} />
            </div>
            <button
              type="button"
              disabled={!canNextFrom2}
              onClick={next}
              className="mt-8 w-full rounded-2xl bg-brand-500 px-4 py-4 text-lg font-semibold text-white transition disabled:opacity-40 active:bg-brand-600"
            >
              Suivant
            </button>
          </section>
        )}

        {step === 3 && imageUrl && (
          <section className="mt-6">
            <h1 className="text-2xl font-bold">Quel type d’objet&nbsp;?</h1>
            <p className="mt-1 text-neutral-600">Choisis une catégorie.</p>
            <div className="mt-6">
              <EmojiGrid items={CATEGORIES} selected={category} onSelect={(k) => setCategory(k)} />
            </div>

            <div className="mt-6">
              <p className="text-sm font-medium text-neutral-600">Tags perso (optionnel)</p>
              <p className="text-xs text-neutral-500">
                Pour t’y retrouver : « bureau Florian », « cave », etc.
              </p>
              <div className="mt-3">
                <TagPicker selected={tagIds} onChange={setTagIds} />
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="label" className="text-sm font-medium text-neutral-600">
                Nom (optionnel)
              </label>
              <input
                id="label"
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ex. Frigo Samsung"
                maxLength={60}
                className="mt-1 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              />
            </div>
            <button
              type="button"
              disabled={!canSave || saving}
              onClick={save}
              className="mt-8 w-full rounded-2xl bg-brand-500 px-4 py-4 text-lg font-semibold text-white transition disabled:opacity-40 active:bg-brand-600"
            >
              {saving
                ? "Enregistrement…"
                : mode.kind === "edit"
                  ? "Mettre à jour"
                  : "Enregistrer"}
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
