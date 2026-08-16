"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPurchase, getActiveProducts, getAssessmentResponse } from "@/lib/data";
import { formatGap } from "@/lib/scoring";
import { matchProducts, type MatchedProduct } from "@/lib/scoring/products";
import type { AssessmentResponse, Product } from "@/lib/types";

const TYPE_COPY = {
  great: { label: "Great", headline: "You have a strong sales foundation.", summary: "Your fundamentals are working. Your opportunity is to sharpen strategy and create more leverage.", color: "#24714f" },
  good: { label: "Good", headline: "You’re closer than you think.", summary: "You have a solid base. A handful of focused upgrades can make your results more predictable and easier to scale.", color: "#24714f" },
  average: { label: "Average", headline: "Your next level needs a clearer system.", summary: "Some pieces work, but inconsistency is costing momentum. Start with the highest-impact gaps below.", color: "#b16b18" },
  struggling: { label: "Struggling", headline: "A repeatable system will change the game.", summary: "Your effort is doing too much of the work. Fix the foundations first, then build consistency from there.", color: "#b34732" },
};

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const [response, setResponse] = useState<AssessmentResponse | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buying, setBuying] = useState<string | null>(null);
  const [purchased, setPurchased] = useState<MatchedProduct | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [savedResponse, activeProducts] = await Promise.all([getAssessmentResponse(id), getActiveProducts()]);
      setResponse(savedResponse);
      setProducts(activeProducts);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load this report.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);
  const recommendations = useMemo(() => response ? matchProducts(products, response.gap_flags, response.lead_type) : [], [products, response]);

  async function buy(product: MatchedProduct) {
    if (!response) return;
    setBuying(product.id);
    setError(null);
    try {
      await createPurchase(response.id, product);
      setPurchased(product);
      document.getElementById("next-step")?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not record your purchase.");
    } finally {
      setBuying(null);
    }
  }

  if (loading) return <ReportSkeleton />;
  if (error && !response) return <StateCard title="We couldn’t build your report" copy={error} action={<button onClick={() => void load()} className="primary">Try again</button>} />;
  if (!response) return <StateCard title="Report not found" copy="That report link may be incomplete or no longer available." action={<Link className="primary" href="/">Take the assessment</Link>} />;

  const type = TYPE_COPY[response.lead_type];
  const clarityScore = Math.max(12, Math.round(100 - (response.total_score / 75) * 100));
  const priorityGaps = response.gap_flags.slice(0, 7);
  return (
    <main className="min-h-screen px-4 py-6 sm:px-8 lg:px-12">
      <header className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-bold"><span className="grid size-9 place-items-center rounded-xl bg-[#174b36] text-sm text-white">SC</span>Sales Clarity</Link>
        <span className="rounded-full border border-[#dfe3dc] bg-white/70 px-4 py-2 text-xs font-bold tracking-[.12em] text-[#66736d]">YOUR PRIVATE REPORT</span>
      </header>

      <section className="animate-rise mx-auto mt-10 max-w-6xl overflow-hidden rounded-[2rem] border border-[#d8ddd6] bg-[#fffefa] shadow-[0_28px_90px_rgba(20,35,28,.1)]">
        <div className="grid lg:grid-cols-[.8fr_1.2fr]">
          <div className="grid place-items-center bg-[#e8f2eb] p-10 sm:p-14">
            <div className="grid size-48 place-items-center rounded-full p-4 sm:size-56" style={{ background: `conic-gradient(${type.color} 0 ${clarityScore}%, #d6dfd8 ${clarityScore}% 100%)` }}>
              <div className="grid size-full place-items-center rounded-full bg-[#fffefa] text-center"><div><b className="block text-6xl tracking-[-.06em]">{clarityScore}</b><span className="text-sm font-bold tracking-[.14em] text-[#718078]">CLARITY SCORE</span></div></div>
            </div>
          </div>
          <div className="p-8 sm:p-12 lg:p-16">
            <p className="text-xs font-bold tracking-[.18em]" style={{ color: type.color }}>YOUR RESULT · {type.label.toUpperCase()}</p>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-[1.05] tracking-[-.05em] sm:text-6xl">{type.headline}</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#66736d]">{type.summary}</p>
            <div className="mt-8 flex flex-wrap gap-3"><span className="rounded-full bg-[#f1f3ee] px-4 py-2 text-sm font-semibold">{priorityGaps.length} priority gaps found</span><span className="rounded-full bg-[#f1f3ee] px-4 py-2 text-sm font-semibold">{recommendations.length} matched solutions</span></div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 py-16 lg:grid-cols-[.85fr_1.15fr]">
        <div>
          <p className="text-xs font-bold tracking-[.18em] text-[#174b36]">WHAT’S HOLDING YOU BACK</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-.04em]">Your priority gaps</h2>
          <p className="mt-4 leading-7 text-[#66736d]">These are patterns in your answers—not flaws. Treat them as the shortest path to better results.</p>
        </div>
        <div className="space-y-3">
          {priorityGaps.length ? priorityGaps.map((gap, index) => (
            <div key={gap} className="flex gap-4 rounded-2xl border border-[#dfe3dc] bg-[#fffefa] p-5"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#fbe2db] text-sm font-bold text-[#a8422e]">{index + 1}</span><div><h3 className="font-bold">{formatGap(gap)}</h3><p className="mt-1 text-sm leading-6 text-[#66736d]">Improving this area will make your sales process more consistent and easier to repeat.</p></div></div>
          )) : <div className="rounded-2xl border border-[#c9dece] bg-[#edf6f0] p-6"><h3 className="font-bold">No critical gaps detected</h3><p className="mt-2 text-[#66736d]">Focus on leverage, consistency, and the strategy recommendation below.</p></div>}
        </div>
      </section>

      <section className="mx-auto max-w-6xl border-t border-[#dfe3dc] py-16">
        <div className="max-w-2xl"><p className="text-xs font-bold tracking-[.18em] text-[#174b36]">YOUR RECOMMENDED NEXT STEPS</p><h2 className="mt-3 text-4xl font-semibold tracking-[-.045em]">Start where the impact is highest.</h2><p className="mt-4 leading-7 text-[#66736d]">Ranked by how many of your assessment gaps each program directly addresses.</p></div>
        {recommendations.length ? <div className="mt-10 grid gap-5 lg:grid-cols-3">{recommendations.map((product, index) => (
          <article key={product.id} className={`flex flex-col rounded-[1.6rem] border bg-[#fffefa] p-6 ${index === 0 ? "border-[#174b36] shadow-[0_18px_50px_rgba(23,75,54,.12)]" : "border-[#dfe3dc]"}`}>
            <div className="flex items-center justify-between"><span className="text-xs font-bold tracking-[.15em] text-[#66736d]">{index === 0 ? "BEST MATCH" : `MATCH ${index + 1}`}</span><span className="rounded-full bg-[#edf6f0] px-3 py-1 text-xs font-bold text-[#174b36]">{product.matchCount} {product.matchCount === 1 ? "gap" : "gaps"}</span></div>
            <h3 className="mt-6 text-2xl font-semibold leading-tight tracking-[-.035em]">{product.name}</h3><p className="mt-3 flex-1 text-sm leading-6 text-[#66736d]">{product.description}</p><p className="mt-6 text-3xl font-semibold">${(product.price_cents / 100).toLocaleString()}</p>
            <button disabled={buying !== null} onClick={() => void buy(product)} className="mt-5 rounded-full bg-[#174b36] px-5 py-3.5 font-bold text-white hover:bg-[#0f3526] disabled:opacity-50">{buying === product.id ? "Recording…" : "Choose this program →"}</button>
          </article>
        ))}</div> : <div className="mt-10 rounded-2xl border border-[#dfe3dc] bg-[#fffefa] p-8"><h3 className="text-xl font-bold">No recommendations available</h3><p className="mt-2 text-[#66736d]">Your result is unusual. Retake the assessment or contact the operator for a tailored recommendation.</p><Link href="/" className="mt-5 inline-block font-bold text-[#174b36] underline">Retake assessment</Link></div>}
      </section>

      {error && <div role="alert" className="mx-auto mb-8 max-w-6xl rounded-xl bg-[#fbe2db] p-4 text-sm font-medium text-[#8b3022]">{error} Please try again.</div>}
      {purchased && <section id="next-step" className="mx-auto mb-16 max-w-6xl rounded-[2rem] bg-[#174b36] p-8 text-white sm:p-12"><p className="text-xs font-bold tracking-[.18em] text-[#b9d8c5]">PURCHASE RECORDED</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.04em]">Great choice—{purchased.name} is on your plan.</h2><p className="mt-3 max-w-2xl text-[#d8e7dd]">Your selection and exact purchase amount have been saved to this assessment.</p></section>}
    </main>
  );
}

function StateCard({ title, copy, action }: { title: string; copy: string; action: React.ReactNode }) {
  return <main className="min-h-screen grid place-items-center px-6"><section className="max-w-lg rounded-3xl border border-[#dfe3dc] bg-[#fffefa] p-9 text-center shadow-[0_18px_60px_rgba(20,35,28,.08)]"><div className="mx-auto mb-5 grid size-12 place-items-center rounded-full bg-[#fbe2db] text-xl">!</div><h1 className="text-3xl font-semibold tracking-[-.03em]">{title}</h1><p className="mt-3 leading-7 text-[#66736d]">{copy}</p><div className="mt-7">{action}</div></section><style jsx global>{`.primary{display:inline-block;border-radius:999px;background:#174b36;padding:.8rem 1.4rem;font-weight:700;color:white}`}</style></main>;
}

function ReportSkeleton() {
  return <main className="min-h-screen px-5 py-7"><div className="mx-auto max-w-6xl"><div className="skeleton h-9 w-36 rounded-xl"/><div className="skeleton mt-10 h-[430px] rounded-[2rem]"/><div className="mt-12 grid gap-5 lg:grid-cols-3">{[1,2,3].map((item)=><div key={item} className="skeleton h-72 rounded-3xl"/>)}</div></div></main>;
}
