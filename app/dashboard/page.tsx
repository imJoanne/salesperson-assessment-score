"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getDashboardMetrics } from "@/lib/data";
import type { DashboardMetrics, LeadType } from "@/lib/types";

const LEAD_TYPES: { key: LeadType; label: string; color: string }[] = [
  { key: "great", label: "Great", color: "#24714f" },
  { key: "good", label: "Good", color: "#4f9870" },
  { key: "average", label: "Average", color: "#e1a73b" },
  { key: "struggling", label: "Struggling", color: "#d0644d" },
];

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setMetrics(await getDashboardMetrics()); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Could not load dashboard metrics."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  if (loading) return <DashboardSkeleton />;
  if (error || !metrics) return <main className="min-h-screen grid place-items-center px-5"><section className="max-w-lg rounded-3xl border border-[#dfe3dc] bg-[#fffefa] p-9 text-center"><h1 className="text-3xl font-semibold">Dashboard unavailable</h1><p className="mt-3 text-[#66736d]">{error}</p><button onClick={() => void load()} className="mt-6 rounded-full bg-[#174b36] px-6 py-3 font-bold text-white">Try again</button></section></main>;
  if (metrics.totalReports === 0) return <main className="min-h-screen grid place-items-center px-5"><section className="max-w-xl rounded-[2rem] border border-[#dfe3dc] bg-[#fffefa] p-10 text-center"><div className="mx-auto grid size-16 place-items-center rounded-full bg-[#edf6f0] text-2xl">↗</div><h1 className="mt-6 text-4xl font-semibold tracking-[-.04em]">No assessments yet</h1><p className="mt-3 leading-7 text-[#66736d]">Complete the first assessment to populate reports, lead types, purchases, and ratings.</p><Link href="/" className="mt-7 inline-block rounded-full bg-[#174b36] px-6 py-3.5 font-bold text-white">Take the assessment</Link></section></main>;

  const maxLeadCount = Math.max(...Object.values(metrics.leadDistribution), 1);
  return (
    <main className="min-h-screen px-4 py-6 sm:px-8 lg:px-12">
      <header className="mx-auto flex max-w-7xl items-center justify-between"><Link href="/" className="flex items-center gap-3 font-bold"><span className="grid size-9 place-items-center rounded-xl bg-[#174b36] text-sm text-white">SC</span>Sales Clarity</Link><button onClick={() => void load()} className="rounded-full border border-[#d8ddd6] bg-white/70 px-4 py-2 text-sm font-bold">↻ Refresh</button></header>
      <section className="mx-auto max-w-7xl py-12"><p className="text-xs font-bold tracking-[.18em] text-[#174b36]">OPERATOR VIEW · AUTHENTICATED LEADS</p><div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="text-4xl font-semibold tracking-[-.05em] sm:text-6xl">Assessment dashboard</h1><p className="mt-3 text-[#66736d]">A private view of captured leads, reports, purchases, and ratings.</p></div><span className="w-fit rounded-full bg-[#d9ede1] px-4 py-2 text-xs font-bold text-[#174b36]">● SUPABASE CONNECTED</span></div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Reports created" value={metrics.totalReports.toLocaleString()} hint="All completed assessments"/><Metric label="Purchases" value={metrics.totalPurchases.toLocaleString()} hint={`${((metrics.totalPurchases / metrics.totalReports) * 100).toFixed(0)}% report conversion`}/><Metric label="Recorded value" value={`$${(metrics.totalRevenueCents / 100).toLocaleString()}`} hint="From selected programs"/><Metric label="Helpfulness" value={metrics.averageRating ? `${metrics.averageRating.toFixed(1)}/5` : "—"} hint={metrics.averageRating ? "Average visitor rating" : "No ratings yet"}/></div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.08fr_.92fr]">
          <section className="rounded-[1.6rem] border border-[#dfe3dc] bg-[#fffefa] p-6 sm:p-8"><div className="flex items-center justify-between"><div><p className="text-xs font-bold tracking-[.15em] text-[#66736d]">LEAD QUALITY</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.03em]">Reports by result</h2></div><span className="text-sm text-[#66736d]">{metrics.totalReports} total</span></div><div className="mt-8 space-y-5">{LEAD_TYPES.map((type) => { const count = metrics.leadDistribution[type.key]; return <div key={type.key}><div className="mb-2 flex justify-between text-sm"><span className="font-bold">{type.label}</span><span className="text-[#66736d]">{count} · {((count / metrics.totalReports) * 100).toFixed(0)}%</span></div><div className="h-3 overflow-hidden rounded-full bg-[#eceeea]"><div className="h-full rounded-full transition-all" style={{width:`${(count / maxLeadCount) * 100}%`,background:type.color}}/></div></div>; })}</div></section>
          <section className="rounded-[1.6rem] border border-[#dfe3dc] bg-[#fffefa] p-6 sm:p-8"><p className="text-xs font-bold tracking-[.15em] text-[#66736d]">PRODUCT PERFORMANCE</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.03em]">Purchases by program</h2><div className="mt-6 divide-y divide-[#e5e7e2]">{metrics.purchasesByProduct.length ? metrics.purchasesByProduct.map((product) => <div key={product.name} className="flex items-center justify-between gap-4 py-4"><div><h3 className="font-bold leading-5">{product.name}</h3><p className="mt-1 text-sm text-[#66736d]">${(product.revenueCents / 100).toLocaleString()} recorded</p></div><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#edf6f0] font-bold text-[#174b36]">{product.count}</span></div>) : <p className="py-8 text-[#66736d]">No purchases recorded yet.</p>}</div></section>
        </div>

        <section id="recent-reports" className="mt-5 overflow-hidden rounded-[1.6rem] border border-[#dfe3dc] bg-[#fffefa]"><div className="flex items-center justify-between border-b border-[#e5e7e2] p-6 sm:px-8"><div><p className="text-xs font-bold tracking-[.15em] text-[#66736d]">RECENT LEADS</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.03em]">Latest reports</h2></div></div><div className="divide-y divide-[#e5e7e2]">{metrics.recentReports.map((report) => <Link href={`/reports/${report.id}`} key={report.id} className="grid gap-2 p-5 transition hover:bg-[#f7f8f4] sm:grid-cols-[1fr_auto_auto] sm:items-center sm:px-8"><div><span className="font-bold">{report.lead?.full_name ?? "Legacy lead"}</span><span className="ml-3 text-sm capitalize text-[#66736d]">{report.lead_type} · {report.gap_flags.length} gaps</span><p className="mt-1 text-sm text-[#66736d]">{report.lead?.email}{report.lead?.company ? ` · ${report.lead.company}` : ""}</p></div><span className="text-sm text-[#66736d]">Score {report.total_score}</span><span className="text-sm text-[#66736d]">{new Date(report.created_at).toLocaleDateString()}</span></Link>)}</div></section>
      </section>
    </main>
  );
}

function Metric({label,value,hint}:{label:string;value:string;hint:string}) { return <article className="rounded-[1.4rem] border border-[#dfe3dc] bg-[#fffefa] p-6"><p className="text-xs font-bold tracking-[.14em] text-[#718078]">{label.toUpperCase()}</p><p className="mt-4 text-4xl font-semibold tracking-[-.045em]">{value}</p><p className="mt-2 text-sm text-[#66736d]">{hint}</p></article>; }
function DashboardSkeleton(){return <main className="min-h-screen px-5 py-7"><div className="mx-auto max-w-7xl"><div className="skeleton h-10 w-40 rounded-xl"/><div className="skeleton mt-14 h-16 w-2/3 rounded-xl"/><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[1,2,3,4].map(item=><div key={item} className="skeleton h-40 rounded-3xl"/>)}</div><div className="mt-5 grid gap-5 lg:grid-cols-2"><div className="skeleton h-96 rounded-3xl"/><div className="skeleton h-96 rounded-3xl"/></div></div></main>}
