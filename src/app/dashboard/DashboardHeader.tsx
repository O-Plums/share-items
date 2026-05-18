"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

type Props = {
  name: string;
  image: string | null;
  signOutAction: () => Promise<void>;
};

export function DashboardHeader({ name, image, signOutAction }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const initials = name
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase())
    .filter(Boolean)
    .slice(0, 2)
    .join("");

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="fixed right-3 top-3 z-30 safe-top" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full bg-white px-1.5 py-1.5 ring-1 ring-neutral-200 shadow-sm active:bg-neutral-50"
        aria-label="Menu compte"
      >
        {image ? (
          <Image
            src={image}
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">
            {initials || "?"}
          </span>
        )}
        <span className="pr-1.5 text-sm font-medium text-neutral-700">▾</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl bg-white py-1 ring-1 ring-neutral-200 shadow-lg">
          <p className="truncate px-4 py-2 text-sm text-neutral-500">{name}</p>
          <form action={signOutAction}>
            <button
              type="submit"
              className="block w-full px-4 py-2 text-left text-sm text-neutral-900 hover:bg-neutral-50"
            >
              Se déconnecter
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
