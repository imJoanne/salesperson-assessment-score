"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createAssessmentResponse, getQuestions } from "@/lib/data";
import { scoreAssessment } from "@/lib/scoring";
import type { Question, SelectedAnswer } from "@/lib/types";

type Screen = "intro" | "assessment" | "saving";

export default function Home() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, SelectedAnswer>>({});
  const [current, setCurrent] = useState(0);
  const [screen, setScreen] = useState<Screen>("intro");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadQuestions() {
    setLoading(true);
    setError(null);
    try {
      const data = await getQuestions();
      if (data.length !== 15 || data.some((item) => item.answer_options.length < 3)) {
        throw new Error("The assessment catalog is not ready yet. Please try again shortly.");
      }
      setQuestions(data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load the assessment.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadQuestions(); }, []);

  const question = questions[current];
  const selected = question ? answers[question.id] : undefined;
  const progress = questions.length ? ((current + 1) / questions.length) * 100 : 0;
  const answeredCount = Object.keys(answers).length;
  const categoryStep = useMemo(() => question?.category.toUpperCase() ?? "", [question]);

  function choose(option: Question["answer_options"][number]) {
    if (!question) return;
    setAnswers((existing) => ({
      ...existing,
      [question.id]: {
        question_id: question.id,
        answer_option_id: option.id,
        gap_flag: option.gap_flag,
        weight: option.weight,
      },
    }));
  }

  async function next() {
    if (!selected) return;
    if (current < questions.length - 1) {
      setCurrent((value) => value + 1);
      return;
    }
    setScreen("saving");
    setError(null);
    try {
      const orderedAnswers = questions.map((item) => answers[item.id]);
      const result = scoreAssessment(orderedAnswers);
      const response = await createAssessmentResponse({ answers: orderedAnswers, totalScore: result.totalScore, leadType: result.leadType, gapFlags: result.gapFlags });
      router.push(`/reports/${response.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not save your answers.");
      setScreen("assessment");
    }
  }

  if (loading) return <AssessmentSkeleton />;

  if (error && questions.length === 0) {
    return (
      <main className="min-h-screen grid place-items-center px-6">
        <section className="max-w-lg rounded-3xl border border-[#dfe3dc] bg-[#fffefa] p-8 text-center shadow-[0_18px_60px_rgba(20,35,28,.08)]">
          <div className="mx-auto mb-5 grid size-12 place-items-center rounded-full bg-[#fbe2db] text-xl">!</div>
          <h1 className="text-3xl font-semibold tracking-[-.03em]">We hit a snag</h1>
          <p className="mt-3 text-[#66736d]">{error}</p>
          <button onClick={() => void loadQuestions()} className="mt-7 rounded-full bg-[#174b36] px-6 py-3 font-semibold text-white hover:bg-[#0f3526]">Try again</button>
        </section>
      </main>
    );
  }

  if (screen === "intro") {
    return (
      <main className="min-h-screen overflow-hidden px-5 py-6 sm:px-8 lg:px-12">
        <header className="mx-auto flex max-w-7xl items-center justify-between">
          <Brand />
          <a href="#how-it-works" className="hidden text-sm font-semibold text-[#46534d] sm:block">How it works</a>
        </header>
        <section className="mx-auto grid min-h-[calc(100vh-92px)] max-w-7xl items-center gap-14 py-12 lg:grid-cols-[1.08fr_.92fr]">
          <div className="animate-rise max-w-2xl">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#bed6c7] bg-[#edf6f0] px-4 py-2 text-xs font-bold tracking-[.16em] text-[#174b36]">
              <span className="size-2 rounded-full bg-[#ed6f51]" /> 8 MINUTES · PERSONALIZED RESULTS
            </p>
            <h1 className="text-[clamp(3.2rem,7vw,6.7rem)] font-semibold leading-[.92] tracking-[-.065em] text-[#14231c]">
              Sell with<br /><span className="font-serif italic font-normal text-[#174b36]">clarity.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-[#5e6c65] sm:text-xl">
              See exactly where your sales process is leaking revenue—and get a focused plan to fix the gaps that matter most.
            </p>
            <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <button onClick={() => setScreen("assessment")} className="group rounded-full bg-[#174b36] px-7 py-4 text-base font-bold text-white shadow-[0_12px_30px_rgba(23,75,54,.22)] transition hover:-translate-y-0.5 hover:bg-[#0f3526]">
                Start my assessment <span className="ml-3 inline-block transition group-hover:translate-x-1">→</span>
              </button>
              <span className="text-sm text-[#66736d]">Free · No login · Instant report</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -left-7 -top-8 size-28 rounded-full bg-[#ed6f51]/15 blur-2xl" />
            <div className="relative rotate-[1.5deg] rounded-[2rem] border border-[#d8ddd6] bg-[#fffefa] p-7 shadow-[0_28px_90px_rgba(20,35,28,.14)] sm:p-9">
              <div className="flex items-center justify-between border-b border-[#e5e7e2] pb-6">
                <span className="text-xs font-bold tracking-[.16em] text-[#718078]">YOUR SALES CLARITY</span>
                <span className="rounded-full bg-[#fff0d3] px-3 py-1 text-xs font-bold text-[#875f0a]">PREVIEW</span>
              </div>
              <div className="mt-8 flex items-end gap-5">
                <div className="grid size-28 shrink-0 place-items-center rounded-full bg-[conic-gradient(#174b36_0_72%,#e3e8e2_72%)] p-3">
                  <div className="grid size-full place-items-center rounded-full bg-[#fffefa] text-center"><span><b className="block text-3xl">72</b><small className="text-[#718078]">/ 100</small></span></div>
                </div>
                <div><p className="font-serif text-3xl italic text-[#174b36]">Good foundation</p><p className="mt-2 text-sm leading-6 text-[#66736d]">A few focused changes could unlock your next stage of growth.</p></div>
              </div>
              <div className="mt-8 space-y-3">
                {["Conversation & discovery", "Follow-up consistency", "Referral system"].map((label, index) => (
                  <div key={label} className="flex items-center gap-3 rounded-2xl bg-[#f4f5f1] p-4"><span className="grid size-7 place-items-center rounded-full bg-white text-xs font-bold text-[#174b36]">{index + 1}</span><span className="text-sm font-semibold">{label}</span></div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section id="how-it-works" className="mx-auto max-w-7xl border-t border-[#dfe3dc] py-10 text-center text-sm text-[#66736d]">15 thoughtful questions · rule-based scoring · practical next steps</section>
      </main>
    );
  }

  if (!question) return null;
  return (
    <main className="min-h-screen px-4 py-5 sm:px-8 sm:py-7">
      <header className="mx-auto flex max-w-5xl items-center justify-between"><Brand /><span className="text-sm font-semibold text-[#66736d]">{answeredCount} of {questions.length} answered</span></header>
      <div className="mx-auto mt-7 h-1.5 max-w-5xl overflow-hidden rounded-full bg-[#dde2dc]"><div className="h-full rounded-full bg-[#ed6f51] transition-all duration-500" style={{ width: `${progress}%` }} /></div>
      <section key={question.id} className="animate-rise mx-auto max-w-3xl py-12 sm:py-16">
        <p className="text-xs font-bold tracking-[.18em] text-[#174b36]">{categoryStep} · QUESTION {current + 1}</p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-[-.035em] sm:text-5xl">{question.text}</h1>
        <div className="mt-9 grid gap-3">
          {question.answer_options.map((option, index) => {
            const active = selected?.answer_option_id === option.id;
            return (
              <button key={option.id} onClick={() => choose(option)} className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition sm:p-5 ${active ? "border-[#174b36] bg-[#edf6f0] shadow-[0_8px_25px_rgba(23,75,54,.08)]" : "border-[#dfe3dc] bg-[#fffefa] hover:border-[#aabbb2] hover:-translate-y-px"}`}>
                <span className={`grid size-8 shrink-0 place-items-center rounded-full border text-sm font-bold ${active ? "border-[#174b36] bg-[#174b36] text-white" : "border-[#ccd3cd] text-[#718078]"}`}>{active ? "✓" : String.fromCharCode(65 + index)}</span>
                <span className="font-medium leading-6">{option.text}</span>
              </button>
            );
          })}
        </div>
        {error && <div role="alert" className="mt-5 rounded-xl bg-[#fbe2db] p-4 text-sm font-medium text-[#8b3022]">{error} Your answers are still here—please try again.</div>}
        <div className="mt-8 flex items-center justify-between">
          <button disabled={current === 0 || screen === "saving"} onClick={() => setCurrent((value) => value - 1)} className="rounded-full px-5 py-3 font-semibold text-[#536159] disabled:invisible">← Back</button>
          <button disabled={!selected || screen === "saving"} onClick={() => void next()} className="rounded-full bg-[#174b36] px-7 py-3.5 font-bold text-white transition hover:bg-[#0f3526] disabled:cursor-not-allowed disabled:opacity-35">
            {screen === "saving" ? "Building your report…" : current === questions.length - 1 ? "See my results →" : "Continue →"}
          </button>
        </div>
      </section>
    </main>
  );
}

function Brand() {
  return <div className="flex items-center gap-3 font-bold tracking-[-.02em]"><span className="grid size-9 place-items-center rounded-xl bg-[#174b36] text-sm text-white">SC</span><span>Sales Clarity</span></div>;
}

function AssessmentSkeleton() {
  return <main className="min-h-screen px-5 py-7"><div className="mx-auto max-w-5xl"><div className="skeleton h-9 w-36 rounded-xl" /><div className="mx-auto mt-24 max-w-3xl"><div className="skeleton h-3 w-32 rounded" /><div className="skeleton mt-6 h-14 w-4/5 rounded-xl" /><div className="mt-10 space-y-3">{[1, 2, 3, 4].map((item) => <div key={item} className="skeleton h-20 rounded-2xl" />)}</div></div></div></main>;
}
