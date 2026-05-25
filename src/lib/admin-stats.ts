import { prisma } from "@/lib/prisma";

export type DateRange = { from: Date; to: Date };

export type DailyPoint = { date: string; label: string; count: number };

export type FunnelStep = {
  key: "signups" | "list_created" | "invite_received" | "match_reached";
  label: string;
  count: number;
};

export type AttributionRow = {
  source: string;
  count: number;
};

export type AdminStats = {
  range: { from: string; to: string };
  period: {
    users: number;
    lists: number;
    items: number;
    votes: number;
    matches: number;
    uniqueVoters: number;
  };
  totals: {
    users: number;
    lists: number;
    items: number;
    votes: number;
    matches: number;
    itemsInInventory: number;
  };
  series: {
    users: DailyPoint[];
    lists: DailyPoint[];
    items: DailyPoint[];
    votes: DailyPoint[];
    matches: DailyPoint[];
  };
  listsByKind: { kind: string; count: number }[];
  funnel: FunnelStep[];
  attribution: {
    topSources: AttributionRow[];
    topCampaigns: AttributionRow[];
    topReferrers: AttributionRow[];
    captured: number;
    missing: number;
  };
};

type DailyRow = { day: Date; count: bigint | number };

export function parseAdminDateRange(
  preset: string | null,
  fromStr: string | null,
  toStr: string | null,
): DateRange {
  const to = new Date();
  to.setUTCHours(23, 59, 59, 999);

  const from = new Date();
  if (preset === "7d") {
    from.setUTCDate(from.getUTCDate() - 6);
  } else if (preset === "30d") {
    from.setUTCDate(from.getUTCDate() - 29);
  } else if (preset === "90d") {
    from.setUTCDate(from.getUTCDate() - 89);
  } else if (fromStr && toStr) {
    const f = new Date(`${fromStr}T00:00:00.000Z`);
    const t = new Date(`${toStr}T23:59:59.999Z`);
    if (!Number.isNaN(f.getTime()) && !Number.isNaN(t.getTime())) {
      return { from: f, to: t };
    }
    from.setUTCDate(from.getUTCDate() - 29);
  } else {
    from.setUTCDate(from.getUTCDate() - 29);
  }

  from.setUTCHours(0, 0, 0, 0);
  return { from, to };
}

function dayLabel(d: Date): string {
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function fillDailySeries(from: Date, to: Date, rows: DailyRow[]): DailyPoint[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    const key = r.day.toISOString().slice(0, 10);
    map.set(key, Number(r.count));
  }

  const points: DailyPoint[] = [];
  const cur = new Date(from);
  cur.setUTCHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setUTCHours(0, 0, 0, 0);

  while (cur <= end) {
    const date = cur.toISOString().slice(0, 10);
    points.push({
      date,
      label: dayLabel(cur),
      count: map.get(date) ?? 0,
    });
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return points;
}

async function dailyCounts(
  table: "User" | "List" | "Item" | "Vote" | "Match",
  range: DateRange,
): Promise<DailyRow[]> {
  return prisma.$queryRawUnsafe<DailyRow[]>(
    `SELECT DATE("createdAt") AS day, COUNT(*)::int AS count
     FROM "${table}"
     WHERE "createdAt" >= $1 AND "createdAt" <= $2
     GROUP BY 1
     ORDER BY 1`,
    range.from,
    range.to,
  );
}

/**
 * Funnel cohorte : combien d'utilisateurs créés sur la période ont franchi
 * chaque étape (cumulatif décroissant — chaque étape inclut la suivante).
 *  - signups            : compte créé
 *  - list_created       : ≥ 1 liste créée par l'utilisateur
 *  - invite_received    : ≥ 1 vote externe (visitorId distinct) sur une de ses listes
 *  - match_reached      : ≥ 1 match sur une de ses listes
 */
async function computeFunnel(range: DateRange): Promise<FunnelStep[]> {
  const usersInPeriod = await prisma.user.findMany({
    where: { createdAt: { gte: range.from, lte: range.to } },
    select: { id: true },
  });
  const userIds = usersInPeriod.map((u) => u.id);
  const signups = userIds.length;

  if (signups === 0) {
    return [
      { key: "signups", label: "Inscriptions", count: 0 },
      { key: "list_created", label: "A créé une liste", count: 0 },
      { key: "invite_received", label: "A reçu un vote", count: 0 },
      { key: "match_reached", label: "A obtenu un match", count: 0 },
    ];
  }

  const withList = await prisma.list.findMany({
    where: { userId: { in: userIds } },
    select: { id: true, userId: true },
  });
  const usersWithList = new Set(withList.map((l) => l.userId).filter(Boolean) as string[]);
  const listIds = withList.map((l) => l.id);

  let usersWithVote = new Set<string>();
  let usersWithMatch = new Set<string>();

  if (listIds.length > 0) {
    const votedItems = await prisma.item.findMany({
      where: { listId: { in: listIds }, votes: { some: {} } },
      select: { userId: true },
    });
    usersWithVote = new Set(votedItems.map((i) => i.userId).filter(Boolean) as string[]);

    const matchedItems = await prisma.item.findMany({
      where: { listId: { in: listIds }, match: { isNot: null } },
      select: { userId: true },
    });
    usersWithMatch = new Set(matchedItems.map((i) => i.userId).filter(Boolean) as string[]);
  }

  return [
    { key: "signups", label: "Inscriptions", count: signups },
    { key: "list_created", label: "A créé une liste", count: usersWithList.size },
    { key: "invite_received", label: "A reçu un vote", count: usersWithVote.size },
    { key: "match_reached", label: "A obtenu un match", count: usersWithMatch.size },
  ];
}

function topGroupBy(
  rows: { value: string | null; _count: { _all: number } }[],
  limit = 8,
): AttributionRow[] {
  return rows
    .filter((r) => r.value)
    .map((r) => ({ source: r.value as string, count: r._count._all }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

async function computeAttribution(range: DateRange) {
  const createdWhere = { createdAt: { gte: range.from, lte: range.to } };

  const [bySource, byCampaign, byReferrer, captured, signups] = await Promise.all([
    prisma.signupAttribution.groupBy({
      by: ["utmSource"],
      where: createdWhere,
      _count: { _all: true },
    }),
    prisma.signupAttribution.groupBy({
      by: ["utmCampaign"],
      where: createdWhere,
      _count: { _all: true },
    }),
    prisma.signupAttribution.groupBy({
      by: ["referrer"],
      where: createdWhere,
      _count: { _all: true },
    }),
    prisma.signupAttribution.count({ where: createdWhere }),
    prisma.user.count({ where: createdWhere }),
  ]);

  return {
    topSources: topGroupBy(bySource.map((r) => ({ value: r.utmSource, _count: r._count }))),
    topCampaigns: topGroupBy(byCampaign.map((r) => ({ value: r.utmCampaign, _count: r._count }))),
    topReferrers: topGroupBy(byReferrer.map((r) => ({ value: r.referrer, _count: r._count }))),
    captured,
    missing: Math.max(0, signups - captured),
  };
}

export async function fetchAdminStats(range: DateRange): Promise<AdminStats> {
  const createdWhere = { createdAt: { gte: range.from, lte: range.to } };

  const [
    periodUsers,
    periodLists,
    periodItems,
    periodVotes,
    periodMatches,
    uniqueVoters,
    totalUsers,
    totalLists,
    totalItems,
    totalVotes,
    totalMatches,
    itemsInInventory,
    usersSeries,
    listsSeries,
    itemsSeries,
    votesSeries,
    matchesSeries,
    listsByKind,
    funnel,
    attribution,
  ] = await Promise.all([
    prisma.user.count({ where: createdWhere }),
    prisma.list.count({ where: createdWhere }),
    prisma.item.count({ where: createdWhere }),
    prisma.vote.count({ where: createdWhere }),
    prisma.match.count({ where: createdWhere }),
    prisma.vote.findMany({
      where: createdWhere,
      select: { visitorId: true },
      distinct: ["visitorId"],
    }),
    prisma.user.count(),
    prisma.list.count(),
    prisma.item.count(),
    prisma.vote.count(),
    prisma.match.count(),
    prisma.item.count({ where: { listId: null } }),
    dailyCounts("User", range),
    dailyCounts("List", range),
    dailyCounts("Item", range),
    dailyCounts("Vote", range),
    dailyCounts("Match", range),
    prisma.list.groupBy({
      by: ["kind"],
      where: createdWhere,
      _count: { _all: true },
    }),
    computeFunnel(range),
    computeAttribution(range),
  ]);

  return {
    range: {
      from: range.from.toISOString().slice(0, 10),
      to: range.to.toISOString().slice(0, 10),
    },
    period: {
      users: periodUsers,
      lists: periodLists,
      items: periodItems,
      votes: periodVotes,
      matches: periodMatches,
      uniqueVoters: uniqueVoters.length,
    },
    totals: {
      users: totalUsers,
      lists: totalLists,
      items: totalItems,
      votes: totalVotes,
      matches: totalMatches,
      itemsInInventory,
    },
    series: {
      users: fillDailySeries(range.from, range.to, usersSeries),
      lists: fillDailySeries(range.from, range.to, listsSeries),
      items: fillDailySeries(range.from, range.to, itemsSeries),
      votes: fillDailySeries(range.from, range.to, votesSeries),
      matches: fillDailySeries(range.from, range.to, matchesSeries),
    },
    listsByKind: listsByKind
      .map((r) => ({
        kind: r.kind,
        count: r._count._all,
      }))
      .sort((a, b) => b.count - a.count),
    funnel,
    attribution,
  };
}
