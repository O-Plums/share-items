"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { EmojiBadge } from "@/components/EmojiBadge";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Spinner } from "@/components/ui/Spinner";

type Item = {
  id: string;
  imageUrl: string;
  label: string | null;
  room: string;
  roomMeta?: { emoji: string; label: string };
  category: string;
  tags?: { id: string; label: string }[];
};

type Props = {
  remaining: Item[];
  total: number;
  totalDone: number;
  onVote: (itemId: string, value: "YES" | "NO") => Promise<void> | void;
};

export function SwipeView({ remaining, total, totalDone, onVote }: Props) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  if (total === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <p className="text-center text-neutral-600">
          L’organisateur n’a pas encore ajouté d’objet.
        </p>
      </div>
    );
  }

  if (remaining.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="text-center">
          <p className="text-6xl">🎉</p>
          <h2 className="mt-4 text-xl font-bold">Tu as tout vu&nbsp;!</h2>
          <p className="mt-2 text-sm text-neutral-600">
            {totalDone} vote{totalDone > 1 ? "s" : ""} enregistré{totalDone > 1 ? "s" : ""}. Tu peux modifier tes choix via 📖 ou consulter tes Matchs.
          </p>
        </div>
      </div>
    );
  }

  const current = remaining[0];
  const next = remaining[1];

  async function handle(value: "YES" | "NO") {
    if (pendingId) return;
    setPendingId(current.id);
    try {
      await onVote(current.id, value);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="relative mx-auto flex w-full max-w-md flex-1 items-center px-5">
        <div className="relative aspect-[3/4] w-full">
          {next && (
            <div className="absolute inset-0 scale-95 opacity-60">
              <CardStatic item={next} />
            </div>
          )}
          <AnimatePresence mode="popLayout">
            <SwipeCard
              key={current.id}
              item={current}
              onVote={(v) => handle(v)}
              disabled={pendingId === current.id}
            />
          </AnimatePresence>
        </div>
      </div>

      <div className="safe-bottom px-5 pb-4 pt-2">
        <div className="mx-auto flex w-full max-w-md gap-3">
          <LoadingButton
            loading={!!pendingId}
            loadingText="Envoi…"
            variant="secondary"
            className="flex-1 rounded-2xl py-4 text-lg"
            onClick={() => handle("NO")}
          >
            ✕ Non
          </LoadingButton>
          <LoadingButton
            loading={!!pendingId}
            loadingText="Envoi…"
            variant="success"
            className="flex-1 rounded-2xl py-4 text-lg"
            onClick={() => handle("YES")}
          >
            ✓ Oui
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}

function SwipeCard({
  item,
  onVote,
  disabled,
}: {
  item: Item;
  onVote: (v: "YES" | "NO") => void;
  disabled: boolean;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const yesOpacity = useTransform(x, [0, 120], [0, 1]);
  const noOpacity = useTransform(x, [0, -120], [0, 1]);

  return (
    <motion.div
      style={{ x, rotate }}
      drag={disabled ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      onDragEnd={(_, info) => {
        const threshold = 120;
        if (info.offset.x > threshold) onVote("YES");
        else if (info.offset.x < -threshold) onVote("NO");
      }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ x: x.get() > 0 ? 400 : -400, opacity: 0, transition: { duration: 0.25 } }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute inset-0 touch-pan-y select-none overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-neutral-200"
    >
      {disabled && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
          <Spinner size="lg" label="Enregistrement du vote" />
        </div>
      )}
      <div className="relative h-full w-full">
        <Image
          src={item.imageUrl}
          alt={item.label ?? ""}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover"
          priority
          draggable={false}
        />
        <motion.div
          style={{ opacity: yesOpacity }}
          className="pointer-events-none absolute left-5 top-5 rounded-xl border-4 border-emerald-500 px-3 py-1 text-2xl font-extrabold tracking-wider text-emerald-500"
        >
          OUI
        </motion.div>
        <motion.div
          style={{ opacity: noOpacity }}
          className="pointer-events-none absolute right-5 top-5 rounded-xl border-4 border-rose-500 px-3 py-1 text-2xl font-extrabold tracking-wider text-rose-500"
        >
          NON
        </motion.div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5">
          {item.label && (
            <p className="text-2xl font-bold text-white drop-shadow">{item.label}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <EmojiBadge kind="room" value={item.room} roomMeta={item.roomMeta} />
            <EmojiBadge kind="category" value={item.category} />
            {item.tags?.map((t) => (
              <span
                key={t.id}
                className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-neutral-700"
              >
                {t.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CardStatic({ item }: { item: Item }) {
  return (
    <div className="h-full w-full overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-neutral-200">
      <div className="relative h-full w-full">
        <Image
          src={item.imageUrl}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover"
        />
      </div>
    </div>
  );
}
