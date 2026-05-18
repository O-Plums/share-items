"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useIdentity } from "@/lib/identity";
import { useAuthedFetch, uploadImage } from "@/lib/client";
import { CATEGORIES, ROOMS } from "@/lib/taxonomies";
import { EmojiGrid } from "./EmojiGrid";

type Props = {
  listId: string;
  itemId?: string;
  initial?: {
    imageUrl: string;
    room: string;
    category: string;
    label: string | null;
  };
};

type Step = 1 | 2 | 3;

export function ItemWizard({ listId, itemId, initial }: Props) {
  const router = useRouter();
  const { identity } = useIdentity();
  const authedFetch = useAuthedFetch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>(initial ? 3 : 1);
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.imageUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [room, setRoom] = useState<string | null>(initial?.room ?? null);
  const [category, setCategory] = useState<string | null>(initial?.category ?? null);
  const [label, setLabel] = useState(initial?.label ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File) {
    if (!identity) return;
    setError(null);
    setUploading(true);
    try {
      const url = await uploadImage(file, identity.visitorId);
      setImageUrl(url);
      setStep(2);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
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
      };
      if (itemId) {
        await authedFetch(`/api/items/${itemId}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      } else {
        await authedFetch(`/api/lists/${listId}/items`, {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      router.replace(`/dashboard/${listId}?tab=items`);
    } catch (e) {
      setError((e as Error).message);
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen safe-top safe-bottom">
      <div className="mx-auto w-full max-w-md px-5 pb-24 pt-6">
        <button
          type="button"
          onClick={() => {
            if (step === 1) router.back();
            else setStep(((step - 1) as Step) || 1);
          }}
          className="text-sm text-neutral-500"
        >
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
            <p className="mt-1 text-neutral-600">Prends une photo ou choisis-en une.</p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
              }}
            />

            <div className="mt-6 space-y-3">
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-2xl bg-brand-500 px-4 py-4 text-lg font-semibold text-white transition disabled:opacity-40 active:bg-brand-600"
              >
                {uploading ? "Envoi…" : "📸 Prendre / choisir une photo"}
              </button>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full rounded-2xl bg-white px-4 py-3 text-base font-medium ring-1 ring-neutral-200 active:bg-neutral-50"
                >
                  Garder la photo actuelle →
                </button>
              )}
              {imageUrl && (
                <div className="relative mt-3 aspect-square overflow-hidden rounded-2xl bg-neutral-100">
                  <Image src={imageUrl} alt="" fill sizes="100vw" className="object-cover" />
                </div>
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
              disabled={!room}
              onClick={() => setStep(3)}
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
              disabled={!category || saving}
              onClick={save}
              className="mt-8 w-full rounded-2xl bg-brand-500 px-4 py-4 text-lg font-semibold text-white transition disabled:opacity-40 active:bg-brand-600"
            >
              {saving ? "Enregistrement…" : itemId ? "Mettre à jour" : "Enregistrer"}
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
