"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { IdentityGate } from "@/components/IdentityGate";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useIdentity } from "@/lib/identity";
import { useAuthedFetch } from "@/lib/client";
import { SwipeView } from "./SwipeView";
import { HistorySheet } from "./HistorySheet";
import { MatchesView } from "./MatchesView";
import { VoterAccountModal } from "./VoterAccountModal";
import { PageLoader } from "@/components/ui/PageLoader";

type RoomMeta = { emoji: string; label: string };

type Item = {
  id: string;
  imageUrl: string;
  label: string | null;
  room: string;
  roomMeta?: RoomMeta;
  category: string;
  sortOrder: number;
  tags?: { id: string; label: string }[];
};

type ListResponse = {
  list: { id: string; slug: string; title: string; kind?: string };
  items: Item[];
};

type Vote = {
  itemId: string;
  value: "YES" | "NO";
  updatedAt: string;
  item: Item;
};

type Match = {
  itemId: string;
  createdAt: string;
  item: Omit<Item, "sortOrder">;
};

type Tab = "swipe" | "matches";

type VoterAppProps = {
  slug: string;
  googleEnabled?: boolean;
};

export function VoterApp({ slug, googleEnabled = false }: VoterAppProps) {
  return (
    <IdentityGate slug={slug} googleEnabled={googleEnabled}>
      <VoterInner slug={slug} googleEnabled={googleEnabled} />
    </IdentityGate>
  );
}

function VoterInner({ slug, googleEnabled }: { slug: string; googleEnabled: boolean }) {
  const t = useTranslations("voter");
  const { identity } = useIdentity();
  const authedFetch = useAuthedFetch();
  const [list, setList] = useState<ListResponse | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("swipe");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [clearingVotes, setClearingVotes] = useState(false);

  const loadList = useCallback(async () => {
    try {
      const data = await authedFetch<ListResponse>(`/api/lists/by-slug/${slug}`);
      setList(data);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [authedFetch, slug]);

  const loadVotes = useCallback(async () => {
    try {
      const data = await authedFetch<{ votes: Vote[] }>(`/api/lists/by-slug/${slug}/my-votes`);
      setVotes(data.votes);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [authedFetch, slug]);

  const loadMatches = useCallback(async () => {
    try {
      const data = await authedFetch<{ matches: Match[] }>(`/api/lists/by-slug/${slug}/my-matches`);
      setMatches(data.matches);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [authedFetch, slug]);

  useEffect(() => {
    loadList();
    loadVotes();
    loadMatches();
  }, [loadList, loadVotes, loadMatches]);

  const voteMap = useMemo(() => {
    const map = new Map<string, "YES" | "NO">();
    for (const v of votes) map.set(v.itemId, v.value);
    return map;
  }, [votes]);

  const remaining = useMemo(() => {
    if (!list) return [];
    return list.items.filter((it) => !voteMap.has(it.id));
  }, [list, voteMap]);

  const submitVote = useCallback(
    async (itemId: string, value: "YES" | "NO") => {
      if (!identity) return;
      try {
        await authedFetch(`/api/votes`, {
          method: "POST",
          body: JSON.stringify({
            itemId,
            displayName: identity.displayName,
            value,
          }),
        });
        await Promise.all([loadVotes(), loadMatches()]);
      } catch (e) {
        setError((e as Error).message);
      }
    },
    [authedFetch, identity, loadVotes, loadMatches],
  );

  async function clearMyVotes() {
    if (!confirm("Effacer tous tes votes sur cette liste ? Tes matchs sur ces objets seront aussi annulés.")) return;
    setClearingVotes(true);
    try {
      await authedFetch(`/api/lists/by-slug/${slug}/my-votes`, { method: "DELETE" });
      await Promise.all([loadVotes(), loadMatches()]);
      setHistoryOpen(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setClearingVotes(false);
    }
  }

  if (!list) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        {error ? (
          <p className="px-6 text-center text-red-700">{error}</p>
        ) : (
          <PageLoader />
        )}
      </main>
    );
  }

  const total = list.items.length;
  const voted = total - remaining.length;

  return (
    <main className="flex min-h-screen flex-col bg-neutral-50">
      <header className="safe-top px-5 pb-3 pt-3">
        <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold">{list.list.title}</h1>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200">
                <div
                  className="h-full bg-brand-500 transition-all"
                  style={{ width: total > 0 ? `${(voted / total) * 100}%` : "0%" }}
                />
              </div>
              <span className="shrink-0 text-xs font-medium text-neutral-600">
                {voted}/{total}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitcher compact />
            <button
              type="button"
              onClick={() => setAccountOpen(true)}
              aria-label={t("account")}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl ring-1 ring-neutral-200 active:bg-neutral-100"
            >
              👤
            </button>
            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              aria-label={t("history")}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl ring-1 ring-neutral-200 active:bg-neutral-100"
            >
              📖
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="mx-auto w-full max-w-md px-5">
          <div className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
        </div>
      )}

      <section className="flex flex-1 flex-col">
        {tab === "swipe" ? (
          <SwipeView remaining={remaining} totalDone={voted} total={total} onVote={submitVote} />
        ) : (
          <MatchesView matches={matches} />
        )}
      </section>

      <footer className="safe-bottom border-t border-neutral-200 bg-white">
        <div className="mx-auto grid w-full max-w-md grid-cols-2">
          <TabButton active={tab === "swipe"} onClick={() => setTab("swipe")} label={t("tabSwipe")} icon="🔥" />
          <TabButton
            active={tab === "matches"}
            onClick={() => setTab("matches")}
            label={
              matches.length > 0 ? `${t("tabMatches")} (${matches.length})` : t("tabMatches")
            }
            icon="🤝"
          />
        </div>
      </footer>

      <HistorySheet
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        votes={votes}
        onToggle={(itemId, currentValue) => submitVote(itemId, currentValue === "YES" ? "NO" : "YES")}
        onClearAll={clearMyVotes}
        clearingAll={clearingVotes}
      />

      <VoterAccountModal
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        slug={slug}
        googleEnabled={googleEnabled}
      />
    </main>
  );
}

function TabButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 py-3 transition ${
        active ? "text-brand-600" : "text-neutral-500"
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
