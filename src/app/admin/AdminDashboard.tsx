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
import { PageLoader } from "@/components/ui/PageLoader";
import { LoadingButton } from "@/components/ui/LoadingButton";

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
          <LoadingButton
            loading={loading}
            loadingText="Chargement…"
            variant="primary"
            className="rounded-xl px-4 py-2 text-sm"
            onClick={load}
          >
            Appliquer
          </LoadingButton>
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

      {loading && <PageLoader label="Statistiques…" className="py-16" />}

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

          <FunnelCard funnel={stats.funnel} />

          <AttributionCard attribution={stats.attribution} />
        </>
      )}
    </div>
  );
}

function FunnelCard({ funnel }: { funnel: AdminStats["funnel"] }) {
  const top = funnel[0]?.count ?? 0;
  return (
    <section className="rounded-2xl bg-white p-4 ring-1 ring-neutral-200">
      <h2 className="mb-1 text-sm font-semibold text-neutral-800">Funnel d'activation (cohorte période)</h2>
      <p className="mb-4 text-xs text-neutral-500">
        Sur les utilisateurs créés pendant la période, combien atteignent chaque étape.
      </p>
      <div className="space-y-2">
        {funnel.map((step, idx) => {
          const widthPct = top > 0 ? Math.max(4, (step.count / top) * 100) : 0;
          const conversionFromPrev =
            idx === 0
              ? null
              : funnel[idx - 1].count === 0
                ? 0
                : Math.round((step.count / funnel[idx - 1].count) * 100);
          const conversionFromTop =
            idx === 0 || top === 0 ? null : Math.round((step.count / top) * 100);
          return (
            <div key={step.key} className="space-y-1">
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="font-medium text-neutral-800">{step.label}</span>
                <span className="tabular-nums text-neutral-600">
                  <span className="font-semibold text-neutral-900">{step.count}</span>
                  {conversionFromTop !== null && (
                    <span className="ml-2 text-xs text-neutral-500">
                      {conversionFromTop}% du top
                      {conversionFromPrev !== null && ` · ${conversionFromPrev}% vs préc.`}
                    </span>
                  )}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AttributionCard({ attribution }: { attribution: AdminStats["attribution"] }) {
  const total = attribution.captured + attribution.missing;
  const coverage = total > 0 ? Math.round((attribution.captured / total) * 100) : 0;

  return (
    <section className="rounded-2xl bg-white p-4 ring-1 ring-neutral-200">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-neutral-800">Sources d'acquisition</h2>
        <p className="text-xs text-neutral-500">
          Attribution capturée : <span className="font-medium text-neutral-700">{attribution.captured}</span> /{" "}
          {total} inscrits ({coverage}%)
        </p>
      </div>
      <p className="mt-1 text-xs text-neutral-500">
        Premier touch — UTM / referrer enregistré au premier signup de chaque utilisateur.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <SourceList title="utm_source" rows={attribution.topSources} />
        <SourceList title="utm_campaign" rows={attribution.topCampaigns} />
        <SourceList title="referrer" rows={attribution.topReferrers} />
      </div>
    </section>
  );
}

function SourceList({
  title,
  rows,
}: {
  title: string;
  rows: AdminStats["attribution"]["topSources"];
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{title}</p>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-neutral-400">Aucune donnée</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {rows.map((row) => (
            <li key={row.source} className="flex justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-neutral-700" title={row.source}>
                {row.source}
              </span>
              <span className="shrink-0 tabular-nums font-medium text-neutral-900">{row.count}</span>
            </li>
          ))}
        </ul>
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
