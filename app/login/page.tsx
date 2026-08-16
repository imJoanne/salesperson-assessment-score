"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "signup" | "login";

export default function LoginPage() {
  return <Suspense fallback={<AuthSkeleton />}><AuthForm /></Suspense>;
}

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>(searchParams.get("mode") === "login" ? "login" : "signup");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const next = safeNext(searchParams.get("next"));

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true); setError(null); setMessage(null);
    const supabase = createClient();
    try {
      if (mode === "signup") {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName.trim(), company: company.trim(), phone: phone.trim() },
          },
        });
        if (authError) throw authError;
        if (!data.session) {
          setMessage("Account created. Check your email to confirm your address, then return to start the assessment.");
          return;
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (authError) throw authError;
      }
      router.replace(next);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-5 py-10 sm:px-8">
      <section className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-[#d8ddd6] bg-[#fffefa] shadow-[0_30px_100px_rgba(20,35,28,.12)] lg:grid-cols-[.88fr_1.12fr]">
        <div className="bg-[#174b36] p-8 text-white sm:p-12">
          <Link href="/" className="flex items-center gap-3 font-bold"><span className="grid size-10 place-items-center rounded-xl bg-white/15 text-sm">SC</span>Sales Clarity</Link>
          <p className="mt-20 text-xs font-bold tracking-[.17em] text-[#b9d8c5]">YOUR PRIVATE SALES SCORE</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-.045em] sm:text-5xl">Turn eight minutes into a focused growth plan.</h1>
          <ul className="mt-9 space-y-4 text-sm leading-6 text-[#d8e7dd]">
            <li>✓ Your answers and report stay attached to your account</li>
            <li>✓ Revisit recommendations whenever you need them</li>
            <li>✓ Get relevant follow-up from the Sales Clarity team</li>
          </ul>
        </div>
        <div className="p-7 sm:p-12">
          <p className="text-xs font-bold tracking-[.16em] text-[#174b36]">{mode === "signup" ? "CREATE YOUR ACCOUNT" : "WELCOME BACK"}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">{mode === "signup" ? "Start your free assessment" : "Sign in to continue"}</h2>
          <p className="mt-3 text-sm leading-6 text-[#66736d]">{mode === "signup" ? "We use these details to save your report and follow up with relevant guidance." : "Use the account connected to your assessment reports."}</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === "signup" && <>
              <Field label="Full name" required value={fullName} onChange={setFullName} autoComplete="name" />
              <div className="grid gap-4 sm:grid-cols-2"><Field label="Company" value={company} onChange={setCompany} autoComplete="organization" /><Field label="Phone" value={phone} onChange={setPhone} type="tel" autoComplete="tel" /></div>
            </>}
            <Field label="Email" required value={email} onChange={setEmail} type="email" autoComplete="email" />
            <Field label="Password" required value={password} onChange={setPassword} type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={8} />
            {error && <div role="alert" className="rounded-xl bg-[#fbe2db] p-4 text-sm font-medium text-[#8b3022]">{error}</div>}
            {message && <div role="status" className="rounded-xl bg-[#edf6f0] p-4 text-sm font-medium text-[#174b36]">{message}</div>}
            <button disabled={loading} className="w-full rounded-full bg-[#174b36] px-6 py-4 font-bold text-white transition hover:bg-[#0f3526] disabled:opacity-50">{loading ? "Please wait…" : mode === "signup" ? "Create account & continue →" : "Sign in →"}</button>
          </form>
          <button onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(null); setMessage(null); }} className="mt-6 w-full text-sm font-semibold text-[#536159] underline underline-offset-4">{mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}</button>
        </div>
      </section>
    </main>
  );
}

function Field({ label, value, onChange, type = "text", required = false, autoComplete, minLength }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; autoComplete?: string; minLength?: number }) {
  return <label className="block text-sm font-bold">{label}<input required={required} minLength={minLength} type={type} autoComplete={autoComplete} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-[#cfd6cf] bg-white px-4 py-3.5 font-normal outline-none focus:border-[#174b36]" /></label>;
}

function safeNext(value: string | null) { return value?.startsWith("/") && !value.startsWith("//") ? value : "/"; }
function AuthSkeleton() { return <main className="min-h-screen grid place-items-center"><div className="skeleton h-[38rem] w-[min(90vw,64rem)] rounded-[2rem]" /></main>; }
