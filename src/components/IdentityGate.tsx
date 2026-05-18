"use client";

import { useState } from "react";
import { useIdentity } from "@/lib/identity";

type Props = {
  children: React.ReactNode;
  title?: string;
  description?: string;
};

export function IdentityGate({
  children,
  title = "Comment tu t’appelles ?",
  description = "Juste un prénom, on créera un identifiant anonyme sur ton appareil.",
}: Props) {
  const { identity, ready, setDisplayName } = useIdentity();
  const [name, setName] = useState("");

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-brand-500" />
      </div>
    );
  }

  if (!identity) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 safe-top safe-bottom">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = name.trim();
            if (trimmed.length >= 1) setDisplayName(trimmed);
          }}
          className="w-full max-w-sm space-y-6 rounded-3xl bg-white p-6 shadow-lg ring-1 ring-neutral-200"
        >
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
            <p className="mt-2 text-sm text-neutral-600">{description}</p>
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ton prénom"
            autoFocus
            maxLength={30}
            className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-lg text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
          <button
            type="submit"
            disabled={name.trim().length < 1}
            className="w-full rounded-2xl bg-brand-500 px-4 py-3 text-lg font-semibold text-white transition disabled:opacity-40 active:bg-brand-600"
          >
            C’est parti
          </button>
        </form>
      </main>
    );
  }

  return <>{children}</>;
}
