"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useIdentity } from "@/lib/identity";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { AppLogo } from "./AppLogo";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { PageLoader } from "@/components/ui/PageLoader";

type Props = {
  children: React.ReactNode;
  slug: string;
  googleEnabled?: boolean;
  title?: string;
  description?: string;
};

export function IdentityGate({
  children,
  slug,
  googleEnabled = false,
  title = "Comment tu t’appelles ?",
  description = "Un prénom suffit pour voter. L’organisateur te reconnaîtra sur cette liste.",
}: Props) {
  const { data: session, status } = useSession();
  const { identity, ready, setDisplayName, setIdentityFromAuth } = useIdentity();
  const [name, setName] = useState("");

  const callbackUrl =
    typeof window !== "undefined" ? `${window.location.origin}/l/${slug}` : `/l/${slug}`;

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;
    const raw =
      session.user.name?.trim() ||
      session.user.email?.split("@")[0]?.trim() ||
      "Votant";
    setIdentityFromAuth(session.user.id, raw.slice(0, 30));
  }, [session, status, setIdentityFromAuth]);

  if (!ready || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <PageLoader />
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
          className="w-full max-w-sm space-y-5 rounded-3xl bg-white p-6 shadow-lg ring-1 ring-neutral-200"
        >
          <div className="flex justify-center pb-1">
            <AppLogo size={64} href={null} />
          </div>
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
          <LoadingButton
            type="submit"
            variant="primary"
            className="w-full rounded-2xl px-4 py-3 text-lg"
            disabled={name.trim().length < 1}
          >
            C’est parti
          </LoadingButton>

          {googleEnabled && (
            <>
              <div className="relative flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-neutral-200" />
                <span className="text-xs font-medium text-neutral-400">ou plus sécurisé</span>
                <div className="h-px flex-1 bg-neutral-200" />
              </div>
              <GoogleSignInButton callbackUrl={callbackUrl} />
              <p className="text-center text-xs text-neutral-500">
                Connexion Google : même compte sur tous tes appareils.
              </p>
            </>
          )}
        </form>
      </main>
    );
  }

  return <>{children}</>;
}
