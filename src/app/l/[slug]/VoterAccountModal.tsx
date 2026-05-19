"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { signOut, useSession } from "next-auth/react";
import { useIdentity } from "@/lib/identity";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { LoadingButton } from "@/components/ui/LoadingButton";

type Props = {
  open: boolean;
  onClose: () => void;
  slug: string;
  googleEnabled: boolean;
};

export function VoterAccountModal({ open, onClose, slug, googleEnabled }: Props) {
  const t = useTranslations("voter");
  const tCommon = useTranslations("common");
  const { data: session } = useSession();
  const { identity, setDisplayName, reset } = useIdentity();
  const [nameDraft, setNameDraft] = useState(identity?.displayName ?? "");
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (open) setNameDraft(identity?.displayName ?? "");
  }, [open, identity?.displayName]);

  const isGoogle = Boolean(session?.user?.id) || identity?.source === "google";
  const callbackUrl =
    typeof window !== "undefined" ? `${window.location.origin}/l/${slug}` : `/l/${slug}`;

  async function handleSignOut() {
    setSigningOut(true);
    reset();
    try {
      if (session) {
        await signOut({ redirectTo: `/l/${slug}` });
      } else {
        onClose();
      }
    } finally {
      setSigningOut(false);
    }
  }

  async function handleSaveName() {
    const trimmed = nameDraft.trim();
    if (trimmed.length < 1) return;
    setSaving(true);
    setDisplayName(trimmed);
    setSaving(false);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white shadow-2xl"
          >
            <div className="safe-bottom px-5 pb-6 pt-3">
              <div className="flex justify-center">
                <div className="h-1.5 w-10 rounded-full bg-neutral-300" />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <h2 className="text-lg font-bold">{t("accountTitle")}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full px-3 py-1 text-sm text-neutral-500 active:bg-neutral-100"
                >
                  {tCommon("close")}
                </button>
              </div>

              {isGoogle && session?.user ? (
                <div className="mt-5 space-y-4">
                  <div className="flex items-center gap-3 rounded-2xl bg-neutral-50 p-4 ring-1 ring-neutral-200">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt=""
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
                        {(session.user.name ?? "?")[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{session.user.name ?? t("googleAccount")}</p>
                      {session.user.email && (
                        <p className="truncate text-sm text-neutral-500">{session.user.email}</p>
                      )}
                      <p className="mt-1 text-xs text-emerald-700">{t("googleConnected")}</p>
                    </div>
                  </div>
                  <LoadingButton
                    loading={signingOut}
                    loadingText={t("signingOut")}
                    variant="secondary"
                    className="w-full rounded-2xl px-4 py-3 text-sm"
                    onClick={handleSignOut}
                  >
                    {t("signOut")}
                  </LoadingButton>
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  <p className="text-sm text-neutral-600">
                    {t("accountVotingAs", { name: identity?.displayName ?? "" })}
                  </p>
                  <label className="block text-sm font-medium text-neutral-700">{t("changeName")}</label>
                  <input
                    type="text"
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    maxLength={30}
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                  />
                  <LoadingButton
                    loading={saving}
                    loadingText={tCommon("saving")}
                    variant="primary"
                    className="w-full rounded-2xl px-4 py-3 text-sm"
                    disabled={nameDraft.trim().length < 1}
                    onClick={handleSaveName}
                  >
                    {tCommon("save")}
                  </LoadingButton>
                  {googleEnabled && (
                    <>
                      <div className="relative flex items-center gap-3 py-1">
                        <div className="h-px flex-1 bg-neutral-200" />
                        <span className="text-xs font-medium text-neutral-400">{tCommon("or")}</span>
                        <div className="h-px flex-1 bg-neutral-200" />
                      </div>
                      <GoogleSignInButton
                        callbackUrl={callbackUrl}
                        label={t("signInGoogle")}
                      />
                      <p className="text-xs text-neutral-500">{t("googleVotesHint")}</p>
                    </>
                  )}
                </div>
              )}

              <div className="mt-6 border-t border-neutral-100 pt-4">
                <Link
                  href="/dashboard/lists"
                  onClick={onClose}
                  className="block text-center text-sm font-medium text-brand-600 underline-offset-2 hover:underline"
                >
                  {t("createLists")}
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
