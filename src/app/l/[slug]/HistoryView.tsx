"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { EmojiBadge } from "@/components/EmojiBadge";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { FilterChip } from "@/components/ui/FilterChip";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Spinner } from "@/components/ui/Spinner";

type Vote = {
  itemId: string;
  value: "YES" | "NO";
  updatedAt: string;
  item: {
    id: string;
    imageUrl: string;
    label: string | null;
    room: string;
    roomMeta?: { emoji: string; label: string };
    category: string;
  };
};

type Filter = "all" | "yes" | "no";

type Props = {
  votes: Vote[];
  onToggle: (itemId: string, currentValue: "YES" | "NO") => void | Promise<void>;
  onClearAll: () => void | Promise<void>;
  clearingAll?: boolean;
};

export function HistoryView({ votes, onToggle, onClearAll, clearingAll }: Props) {
  const tVoter = useTranslations("voter");
  const [filter, setFilter] = useState<Filter>("all");
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleToggle(itemId: string, current: "YES" | "NO") {
    setPendingId(itemId);
    try {
      await onToggle(itemId, current);
    } finally {
      setPendingId(null);
    }
  }

  const filtered = votes.filter((v) =>
    filter === "all" ? true : filter === "yes" ? v.value === "YES" : v.value === "NO",
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-md px-5 pt-3">
        <h2 className="text-sm font-semibold text-neutral-700">{tVoter("historyTitle")}</h2>
      </div>

      <div className="mx-auto flex w-full max-w-md gap-1 px-5 pb-3 pt-2">
        <FilterChip tone="voter" active={filter === "all"} onClick={() => setFilter("all")}>
          {tVoter("historyAll", { count: votes.length })}
        </FilterChip>
        <FilterChip tone="voter" active={filter === "yes"} onClick={() => setFilter("yes")}>
          {tVoter("historyYes", {
            count: votes.filter((v) => v.value === "YES").length,
          })}
        </FilterChip>
        <FilterChip tone="voter" active={filter === "no"} onClick={() => setFilter("no")}>
          {tVoter("historyNo", { count: votes.filter((v) => v.value === "NO").length })}
        </FilterChip>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-2">
        <div className="mx-auto max-w-md">
          {votes.length === 0 ? (
            <p className="py-10 text-center text-sm text-neutral-500">{tVoter("historyEmpty")}</p>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-neutral-500">
              {tVoter("historyFilterEmpty")}
            </p>
          ) : (
            <AnimateIn as="ul" className="space-y-2 pb-3">
              {filtered.map((vote) => (
                <li key={vote.itemId}>
                  <button
                    type="button"
                    disabled={!!pendingId || clearingAll}
                    onClick={() => handleToggle(vote.itemId, vote.value)}
                    className="flex w-full items-center gap-3 rounded-2xl bg-white p-2 text-left shadow-sm ring-1 ring-neutral-200 transition active:bg-neutral-50 disabled:opacity-50"
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
                        <EmojiBadge
                          kind="room"
                          value={vote.item.room}
                          roomMeta={vote.item.roomMeta}
                        />
                        <EmojiBadge kind="category" value={vote.item.category} />
                      </div>
                    </div>
                    {pendingId === vote.itemId ? (
                      <Spinner size="sm" tone="voter" />
                    ) : (
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${
                          vote.value === "YES"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {vote.value === "YES" ? "✓" : "✗"}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </AnimateIn>
          )}
        </div>
      </div>

      {votes.length > 0 && (
        <div className="border-t border-neutral-100 bg-white px-5 py-3">
          <div className="mx-auto max-w-md">
            <LoadingButton
              loading={clearingAll}
              loadingText={tVoter("clearingVotes")}
              variant="ghost"
              className="w-full rounded-xl py-2 text-sm font-medium text-neutral-500 hover:text-red-600"
              onClick={onClearAll}
            >
              {tVoter("clearVotes")}
            </LoadingButton>
          </div>
        </div>
      )}
    </div>
  );
}
