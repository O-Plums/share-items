import { prisma } from "@/lib/prisma";

export type DateRange = { from: Date; to: Date };

export type DailyPoint = { date: string; label: string; count: number };

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
  };
}
