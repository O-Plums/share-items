"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { EmojiBadge } from "@/components/EmojiBadge";

type Vote = {
  itemId: string;
  value: "YES" | "NO";
  updatedAt: string;
  item: {
    id: string;
    imageUrl: string;
    label: string | null;
    room: string;
    category: string;
  };
};

type Filter = "all" | "yes" | "no";

type Props = {
  open: boolean;
  onClose: () => void;
  votes: Vote[];
  onToggle: (itemId: string, currentValue: "YES" | "NO") => void | Promise<void>;
  onClearAll: () => void | Promise<void>;
};

export function HistorySheet({ open, onClose, votes, onToggle, onClearAll }: Props) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = votes.filter((v) =>
    filter === "all" ? true : filter === "yes" ? v.value === "YES" : v.value === "NO",
  );

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
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] rounded-t-3xl bg-white shadow-2xl"
          >
            <div className="safe-bottom flex max-h-[85vh] flex-col">
              <div className="flex justify-center pt-2">
                <div className="h-1.5 w-10 rounded-full bg-neutral-300" />
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <h2 className="text-lg font-bold">Mon historique</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full px-3 py-1 text-sm text-neutral-500 active:bg-neutral-100"
                >
                  Fermer
                </button>
              </div>

              <div className="flex gap-1 px-5 pb-3">
                <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
                  Tout ({votes.length})
                </FilterChip>
                <FilterChip active={filter === "yes"} onClick={() => setFilter("yes")}>
                  ✓ Oui ({votes.filter((v) => v.value === "YES").length})
                </FilterChip>
                <FilterChip active={filter === "no"} onClick={() => setFilter("no")}>
                  ✗ Non ({votes.filter((v) => v.value === "NO").length})
                </FilterChip>
              </div>

              <div className="flex-1 overflow-y-auto px-5 pb-2">
                {votes.length === 0 ? (
                  <p className="py-10 text-center text-sm text-neutral-500">
                    Tu n’as pas encore voté.
                  </p>
                ) : filtered.length === 0 ? (
                  <p className="py-10 text-center text-sm text-neutral-500">Aucun vote dans ce filtre.</p>
                ) : (
                  <ul className="space-y-2 pb-3">
                    {filtered.map((vote) => (
                      <li key={vote.itemId}>
                        <button
                          type="button"
                          onClick={() => onToggle(vote.itemId, vote.value)}
                          className="flex w-full items-center gap-3 rounded-2xl bg-neutral-50 p-2 text-left transition active:bg-neutral-100"
                        >
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-neutral-200">
                            <Image
                              src={vote.item.imageUrl}
                              alt=""
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            {vote.item.label && (
                              <p className="truncate text-sm font-medium">{vote.item.label}</p>
                            )}
                            <div className="mt-0.5 flex flex-wrap gap-1">
                              <EmojiBadge kind="room" value={vote.item.room} />
                              <EmojiBadge kind="category" value={vote.item.category} />
                            </div>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${
                              vote.value === "YES"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {vote.value === "YES" ? "✓" : "✗"}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {votes.length > 0 && (
                <div className="border-t border-neutral-100 px-5 py-3">
                  <button
                    type="button"
                    onClick={onClearAll}
                    className="w-full rounded-xl py-2 text-sm font-medium text-neutral-500 hover:text-red-600"
                  >
                    Effacer tous mes votes
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
        active ? "bg-brand-500 text-white" : "bg-neutral-100 text-neutral-600"
      }`}
    >
      {children}
    </button>
  );
}
