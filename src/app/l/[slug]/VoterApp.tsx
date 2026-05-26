"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { IdentityGate } from "@/components/IdentityGate";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useIdentity } from "@/lib/identity";
import { useAuthedFetch } from "@/lib/client";
import { SwipeView } from "./SwipeView";
import { HistoryView } from "./HistoryView";
import { MatchesView } from "./MatchesView";
import { VoterAccountModal } from "./VoterAccountModal";
import { PageLoader } from "@/components/ui/PageLoader";
import { PullToRefresh } from "@/components/PullToRefresh";
import { track } from "@/lib/analytics";

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

type Tab = "swipe" | "matches" | "history";

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

  const refreshAll = useCallback(async () => {
    await Promise.all([loadList(), loadVotes(), loadMatches()]);
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
        track("vote_cast", { value });
        await Promise.all([loadVotes(), loadMatches()]);
      } catch (e) {
        setError((e as Error).message);
      }
    },
    [authedFetch, identity, loadVotes, loadMatches],
  );

  async function clearMyVotes() {
    if (!confirm(t("clearVotesConfirm"))) return;
    setClearingVotes(true);
    try {
      await authedFetch(`/api/lists/by-slug/${slug}/my-votes`, { method: "DELETE" });
      await Promise.all([loadVotes(), loadMatches()]);
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
      <PullToRefresh tone="voter" onRefresh={refreshAll} />
      <header className="safe-top px-5 pb-3 pt-3">
        <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold">{list.list.title}</h1>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200">
                <div
                  className="h-full bg-secondary-500 transition-all"
                  style={{ width: total > 0 ? `${(voted / total) * 100}%` : "0%" }}
                />
              </div>
              <span className="shrink-0 text-xs font-medium text-neutral-600">
                {voted}/{total}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitcher compact tone="voter" />
            <button
              type="button"
              onClick={() => setAccountOpen(true)}
              aria-label={t("account")}
              className="flex min-h-11 min-w-[3.25rem] flex-col items-center justify-center gap-0.5 rounded-2xl bg-white px-2 py-1.5 text-center shadow-sm ring-2 ring-neutral-200 active:scale-[0.98] active:bg-neutral-50"
            >
              <span className="text-lg leading-none" aria-hidden>
                👤
              </span>
              <span className="text-[10px] font-semibold leading-tight text-neutral-700">{t("account")}</span>
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="mx-auto w-full max-w-md px-5">
          <div className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
        </div>
      )}

      <section className="flex flex-1 flex-col overflow-hidden">
        {tab === "swipe" && (
          <SwipeView remaining={remaining} totalDone={voted} total={total} onVote={submitVote} />
        )}
        {tab === "matches" && <MatchesView matches={matches} />}
        {tab === "history" && (
          <HistoryView
            votes={votes}
            onToggle={(itemId, currentValue) =>
              submitVote(itemId, currentValue === "YES" ? "NO" : "YES")
            }
            onClearAll={clearMyVotes}
            clearingAll={clearingVotes}
          />
        )}
      </section>

      <footer className="safe-bottom border-t border-neutral-200 bg-white">
        <div className="mx-auto flex w-full max-w-md">
          <TabButton
            active={tab === "swipe"}
            onClick={() => setTab("swipe")}
            emoji="👀"
            label={t("tabVote")}
          />
          <TabButton
            active={tab === "matches"}
            onClick={() => setTab("matches")}
            emoji="🎁"
            label={t("tabForMe")}
            badge={matches.length}
          />
          <TabButton
            active={tab === "history"}
            onClick={() => setTab("history")}
            emoji="📖"
            label={t("history")}
          />
        </div>
      </footer>

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
  emoji,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  emoji: string;
  label: string;
  badge?: number;
}) {
  const showBadge = badge !== undefined && badge > 0;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition active:bg-neutral-50 ${
        active ? "text-secondary-600" : "text-neutral-500"
      }`}
    >
      {active && (
        <span
          aria-hidden
          className="absolute top-0 h-0.5 w-10 rounded-b-full bg-secondary-500"
        />
      )}
      <span className="relative text-xl leading-none" aria-hidden>
        {emoji}
        {showBadge && (
          <span
            aria-hidden
            className="absolute -right-3 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-secondary-500 px-1 text-[9px] font-bold text-white"
          >
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </span>
      <span className={`text-[11px] leading-tight ${active ? "font-semibold" : "font-medium"}`}>
        {label}
      </span>
    </button>
  );
}
