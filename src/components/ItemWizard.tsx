"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useDashboardFetch, uploadImage } from "@/lib/client";
import { useTranslatedCategories } from "@/lib/i18n-labels";
import { EmojiGrid } from "./EmojiGrid";
import { RoomPicker } from "./RoomPicker";
import { TagPicker } from "./TagPicker";
import { ImageUploadOverlay } from "@/components/ui/ImageUploadOverlay";
import { LoadingButton } from "@/components/ui/LoadingButton";

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
  const tWizard = useTranslations("wizard");
  const tCommon = useTranslations("common");
  const tInventory = useTranslations("inventory");
  const categories = useTranslatedCategories();
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
    if (uploading) return;
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
    if (!f) return;
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
    <main className="safe-bottom">
      <div className="mx-auto w-full max-w-md px-5 pb-10 pt-2">
        <button
          type="button"
          onClick={goBack}
          className="text-sm text-neutral-500"
          disabled={uploading || saving}
        >
          {tCommon("back")}
        </button>

        <div className="mt-4 flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition ${
                s <= step ? "bg-brand-500" : "bg-neutral-200"
              } ${uploading && s === 1 ? "loader-shimmer" : ""}`}
            />
          ))}
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {step === 1 && (
          <section className="mt-6">
            <h1 className="text-2xl font-bold">{tWizard("photoTitle")}</h1>
            <p className="mt-1 text-neutral-600">{tWizard("photoSubtitle")}</p>

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
              <LoadingButton
                loading={uploading}
                loadingText={tCommon("loading")}
                variant="primary"
                className="w-full rounded-2xl px-4 py-4 text-lg"
                onClick={() => openSource("camera")}
              >
                <span aria-hidden>📸</span> {tWizard("takePhoto")}
              </LoadingButton>
              <LoadingButton
                loading={uploading}
                loadingText={tCommon("loading")}
                variant="secondary"
                className="w-full rounded-2xl px-4 py-4 text-lg"
                onClick={() => openSource("gallery")}
              >
                <span aria-hidden>🖼️</span> {tWizard("chooseGallery")}
              </LoadingButton>

              {permissionDenied && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {permissionDenied === "camera" ? tWizard("cameraDenied") : tWizard("galleryDenied")}
                </div>
              )}

              {(uploading || imageUrl) && (
                <div className="relative mt-3 aspect-square overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-neutral-200">
                  {imageUrl ? (
                    <Image src={imageUrl} alt="" fill sizes="100vw" className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 loader-shimmer" />
                  )}
                  <ImageUploadOverlay active={uploading} />
                </div>
              )}

              {imageUrl && !uploading && (
                <LoadingButton
                  variant="primary"
                  className="mt-4 w-full rounded-2xl px-4 py-3 text-base"
                  disabled={!canNextFrom1}
                  onClick={next}
                >
                  {tCommon("continue")}
                </LoadingButton>
              )}
            </div>
          </section>
        )}

        {step === 2 && imageUrl && (
          <section className="mt-6">
            <h1 className="text-2xl font-bold">{tWizard("roomTitle")}</h1>
            <p className="mt-1 text-neutral-600">{tWizard("roomSubtitle")}</p>
            <div className="mt-6">
              <RoomPicker selected={room} onSelect={(k) => setRoom(k)} />
            </div>
            <LoadingButton
              variant="primary"
              className="mt-8 w-full rounded-2xl px-4 py-4 text-lg"
              disabled={!canNextFrom2}
              onClick={next}
            >
              {tCommon("next")}
            </LoadingButton>
          </section>
        )}

        {step === 3 && imageUrl && (
          <section className="mt-6">
            <h1 className="text-2xl font-bold">{tWizard("categoryTitle")}</h1>
            <p className="mt-1 text-neutral-600">{tWizard("categorySubtitle")}</p>
            <div className="mt-6">
              <EmojiGrid items={categories} selected={category} onSelect={(k) => setCategory(k)} />
            </div>

            <div className="mt-6">
              <p className="text-sm font-medium text-neutral-600">{tWizard("tagsTitle")}</p>
              <p className="text-xs text-neutral-500">{tWizard("tagsHint")}</p>
              <div className="mt-3">
                <TagPicker selected={tagIds} onChange={setTagIds} />
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="label" className="text-sm font-medium text-neutral-600">
                {tWizard("nameLabel")}
              </label>
              <input
                id="label"
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={tWizard("namePlaceholder")}
                maxLength={60}
                enterKeyHint="done"
                disabled={saving}
                className="mt-1 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 disabled:opacity-60"
              />
            </div>
            <LoadingButton
              loading={saving}
              loadingText={tCommon("saving")}
              variant="primary"
              className="mt-8 w-full rounded-2xl px-4 py-4 text-lg"
              disabled={!canSave}
              onClick={save}
            >
              {mode.kind === "edit" ? tWizard("update") : tInventory("editSave")}
            </LoadingButton>
          </section>
        )}
      </div>
    </main>
  );
}
