"use client";

import { Spinner } from "./Spinner";

type Props = {
  active: boolean;
  label?: string;
  sublabel?: string;
};

export function ImageUploadOverlay({
  active,
  label = "Envoi de la photo…",
  sublabel = "Compression et upload en cours",
}: Props) {
  if (!active) return null;

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-neutral-900/55 backdrop-blur-[2px]">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-brand-400/40" />
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg">
          <Spinner size="md" tone="brand" />
        </span>
      </div>
      <div className="px-4 text-center">
        <p className="text-sm font-semibold text-white">{label}</p>
        {sublabel && <p className="mt-0.5 text-xs text-white/80">{sublabel}</p>}
      </div>
    </div>
  );
}
