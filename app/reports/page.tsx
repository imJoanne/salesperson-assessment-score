"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getDashboardMetrics } from "@/lib/data";
import type { DashboardMetrics } from "@/lib/types";

export default function ReportsPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { getDashboardMetrics().then(setMetrics).catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load reports.")); }, []);
  return <main className="min-h-screen px-4 py-7 sm:px-8 lg:px-12"><section className="mx-auto max-w-6xl py-5 sm:py-10"><p className="text-xs font-bold tracking-[.18em] text-[#174b36]">SECURE ACCOUNT · SAVED RESULTS</p><div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><h1 className="text-4xl font-semibold tracking-[-.05em] sm:text-6xl">My reports</h1><p className="mt-3 text-[#66736d]">Revisit your previous gap reports and recommendations.</p></div><Link href="/" className="w-fit rounded-full bg-[#174b36] px-6 py-3.5 font-bold text-white">+ Run assessment</Link></div>{error ? <div className="mt-8 rounded-xl bg-[#fbe2db] p-4 text-[#8b3022]">{error}</div> : !metrics ? <div className="mt-10 space-y-3">{[1,2,3,4].map(item=><div key={item} className="skeleton h-24 rounded-2xl"/>)}</div> : metrics.recentReports.length ? <div className="mt-10 overflow-hidden rounded-[1.6rem] border border-[#dfe3dc] bg-[#fffefa] divide-y divide-[#e5e7e2]">{metrics.recentReports.map((report)=><Link href={`/reports/${report.id}`} key={report.id} className="grid gap-4 p-6 transition hover:bg-[#f7f8f4] sm:grid-cols-[1fr_auto_auto] sm:items-center sm:px-8"><div><span className="inline-flex rounded-full bg-[#edf6f0] px-3 py-1 text-xs font-bold capitalize text-[#174b36]">{report.lead_type}</span><h2 className="mt-3 text-lg font-bold">{report.gap_flags.length ? `${Math.min(report.gap_flags.length,7)} priority gaps identified` : "No critical gaps identified"}</h2></div><span className="text-sm text-[#66736d]">Score {report.total_score}</span><span className="text-sm text-[#66736d]">{new Date(report.created_at).toLocaleDateString()}</span></Link>)}</div> : <div className="mt-10 rounded-3xl border border-[#dfe3dc] bg-[#fffefa] p-10 text-center"><h2 className="text-2xl font-semibold">No reports yet</h2><p className="mt-2 text-[#66736d]">Complete the assessment to create your first report.</p></div>}</section></main>;
}
