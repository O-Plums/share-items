"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboardFetch } from "@/lib/client";
import type { AdminStats } from "@/lib/admin-stats";
import { getListKind } from "@/lib/list-kinds";

type Preset = "7d" | "30d" | "90d" | "custom";

const BRAND = "#f43568";

function mergeActivity(stats: AdminStats) {
  const n = stats.series.lists.length;
  return Array.from({ length: n }, (_, i) => ({
    label: stats.series.lists[i].label,
    listes: stats.series.lists[i].count,
    votes: stats.series.votes[i]?.count ?? 0,
    matchs: stats.series.matches[i]?.count ?? 0,
  }));
}

function StatCard({
  title,
  period,
  total,
  hint,
}: {
  title: string;
  period: number;
  total: number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-neutral-200">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{title}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums text-neutral-900">{period}</p>
      <p className="mt-1 text-xs text-neutral-500">
        Total plateforme : <span className="font-medium text-neutral-700">{total}</span>
        {hint ? ` · ${hint}` : ""}
      </p>
    </div>
  );
}

export function AdminDashboard() {
  const fetcher = useDashboardFetch();
  const [preset, setPreset] = useState<Preset>("30d");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (preset === "custom" && from && to) {
        params.set("from", from);
        params.set("to", to);
      } else if (preset !== "custom") {
        params.set("preset", preset);
      } else {
        params.set("preset", "30d");
      }
      const data = await fetcher<AdminStats>(`/api/admin/stats?${params}`);
      setStats(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [fetcher, preset, from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const activity = useMemo(() => (stats ? mergeActivity(stats) : []), [stats]);

  const kindChart = useMemo(() => {
    if (!stats) return [];
    return stats.listsByKind
      .map((r) => {
        const k = getListKind(r.kind);
        return { name: k.label, count: r.count, fill: BRAND };
      })
      .sort((a, b) => b.count - a.count);
  }, [stats]);

  const signups = useMemo(() => stats?.series.users ?? [], [stats]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Statistiques plateforme</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Évolution des comptes, listes, objets, votes et matchs.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["7d", "30d", "90d"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPreset(p)}
            className={`rounded-full px-4 py-2 text-sm font-medium ring-1 transition ${
              preset === p
                ? "bg-brand-500 text-white ring-brand-500"
                : "bg-white text-neutral-700 ring-neutral-200"
            }`}
          >
            {p === "7d" ? "7 jours" : p === "30d" ? "30 jours" : "90 jours"}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPreset("custom")}
          className={`rounded-full px-4 py-2 text-sm font-medium ring-1 transition ${
            preset === "custom"
              ? "bg-brand-500 text-white ring-brand-500"
              : "bg-white text-neutral-700 ring-neutral-200"
          }`}
        >
          Personnalisé
        </button>
      </div>

      {preset === "custom" && (
        <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 ring-1 ring-neutral-200">
          <label className="text-sm">
            <span className="font-medium text-neutral-700">Du</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 block rounded-xl border border-neutral-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-neutral-700">Au</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 block rounded-xl border border-neutral-300 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="button"
            onClick={load}
            className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white"
          >
            Appliquer
          </button>
        </div>
      )}

      {stats && (
        <p className="text-sm text-neutral-500">
          Période : {stats.range.from} → {stats.range.to}
        </p>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading && (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-brand-500" />
        </div>
      )}

      {!loading && stats && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Comptes" period={stats.period.users} total={stats.totals.users} />
            <StatCard title="Listes" period={stats.period.lists} total={stats.totals.lists} />
            <StatCard title="Objets" period={stats.period.items} total={stats.totals.items} />
            <StatCard title="Votes" period={stats.period.votes} total={stats.totals.votes} />
            <StatCard title="Matchs" period={stats.period.matches} total={stats.totals.matches} />
            <StatCard
              title="Votants uniques"
              period={stats.period.uniqueVoters}
              total={stats.totals.votes}
              hint={`${stats.totals.itemsInInventory} obj. en inventaire`}
            />
          </div>

          <ChartCard title="Activité quotidienne">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={activity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={32} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="listes" stroke={BRAND} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="votes" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="matchs" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Nouveaux comptes / jour">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={signups}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={32} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" name="Comptes" stroke={BRAND} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Listes créées par type (période)">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={kindChart} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={88} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Listes" fill={BRAND} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-4 ring-1 ring-neutral-200">
      <h2 className="mb-4 text-sm font-semibold text-neutral-800">{title}</h2>
      {children}
    </section>
  );
}
