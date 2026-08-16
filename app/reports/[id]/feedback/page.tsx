"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { createRating, getAssessmentResponse } from "@/lib/data";

export default function FeedbackPage() {
  const { id } = useParams<{ id: string }>();
  const [score, setScore] = useState(0);
  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAssessmentResponse(id).then((response) => setValid(Boolean(response))).catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load this report.")).finally(() => setChecking(false));
  }, [id]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!score) return;
    setSaving(true);
    setError(null);
    try {
      await createRating(id, score, email.trim());
      setDone(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save your feedback.");
    } finally {
      setSaving(false);
    }
  }

  if (checking) return <main className="min-h-screen grid place-items-center"><div className="skeleton h-96 w-[min(90vw,42rem)] rounded-[2rem]" /></main>;
  if (!valid) return <main className="min-h-screen grid place-items-center px-5"><section className="max-w-lg rounded-3xl border border-[#dfe3dc] bg-[#fffefa] p-9 text-center"><h1 className="text-3xl font-semibold">Report not found</h1><p className="mt-3 text-[#66736d]">{error ?? "We couldn’t connect this feedback form to a report."}</p><Link className="mt-6 inline-block rounded-full bg-[#174b36] px-6 py-3 font-bold text-white" href="/">Start again</Link></section></main>;

  if (done) return (
    <main className="min-h-screen grid place-items-center px-5">
      <section className="animate-rise max-w-2xl rounded-[2rem] border border-[#c9dece] bg-[#fffefa] p-9 text-center shadow-[0_22px_70px_rgba(20,35,28,.1)] sm:p-14">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#d9ede1] text-2xl text-[#174b36]">✓</div>
        <p className="mt-7 text-xs font-bold tracking-[.18em] text-[#174b36]">ASSESSMENT COMPLETE</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-.045em] sm:text-5xl">Thanks for helping us improve.</h1>
        <p className="mx-auto mt-5 max-w-lg text-lg leading-8 text-[#66736d]">Your {score}/5 rating{email ? " and referral" : ""} have been saved. Your report will stay available at the same link.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href={`/reports/${id}`} className="rounded-full border border-[#cbd4cd] px-6 py-3 font-bold">Back to my report</Link><Link href="/dashboard" className="rounded-full bg-[#174b36] px-6 py-3 font-bold text-white">View live dashboard →</Link></div>
      </section>
    </main>
  );

  return (
    <main className="min-h-screen px-5 py-7 sm:grid sm:place-items-center">
      <form onSubmit={(event) => void submit(event)} className="animate-rise mx-auto w-full max-w-2xl rounded-[2rem] border border-[#d8ddd6] bg-[#fffefa] p-7 shadow-[0_25px_80px_rgba(20,35,28,.1)] sm:p-12">
        <Link href={`/reports/${id}`} className="text-sm font-semibold text-[#66736d]">← Back to report</Link>
        <p className="mt-10 text-xs font-bold tracking-[.18em] text-[#174b36]">ONE LAST THING</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-.045em] sm:text-5xl">How helpful was your report?</h1>
        <p className="mt-4 leading-7 text-[#66736d]">Your rating helps us make each recommendation clearer and more practical.</p>
        <fieldset className="mt-8"><legend className="sr-only">Helpfulness rating</legend><div className="flex gap-2">{[1,2,3,4,5].map((value) => <button type="button" aria-label={`${value} star${value === 1 ? "" : "s"}`} key={value} onClick={() => setScore(value)} className={`grid size-12 place-items-center rounded-full border text-xl transition sm:size-14 ${value <= score ? "border-[#e2a826] bg-[#fff0d3] text-[#b87900]" : "border-[#d8ddd6] text-[#aab1ac] hover:border-[#d1a135]"}`}>★</button>)}</div><p className="mt-3 h-6 text-sm font-semibold text-[#66736d]">{score ? `${score} out of 5${score === 4 ? " — Very helpful" : score === 5 ? " — Extremely helpful" : ""}` : "Choose a rating to continue"}</p></fieldset>
        <div className="mt-8 border-t border-[#e4e7e2] pt-8"><label htmlFor="referral" className="font-bold">Know someone who could use this clarity?</label><p className="mt-1 text-sm text-[#66736d]">Share their email and the operator can follow up personally. Optional.</p><input id="referral" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="friend@example.com" className="mt-4 w-full rounded-2xl border border-[#d8ddd6] bg-[#f9f9f6] px-4 py-3.5 outline-none focus:border-[#174b36]" /></div>
        {error && <p role="alert" className="mt-5 rounded-xl bg-[#fbe2db] p-4 text-sm font-medium text-[#8b3022]">{error} Please try again.</p>}
        <button disabled={!score || saving} className="mt-7 w-full rounded-full bg-[#174b36] px-6 py-4 font-bold text-white hover:bg-[#0f3526] disabled:opacity-35">{saving ? "Saving your feedback…" : "Submit feedback →"}</button>
      </form>
    </main>
  );
}
