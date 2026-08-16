"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="min-h-screen grid place-items-center px-5"><section className="max-w-lg rounded-[2rem] border border-[#dfe3dc] bg-[#fffefa] p-9 text-center shadow-[0_20px_70px_rgba(20,35,28,.1)]"><div className="mx-auto grid size-14 place-items-center rounded-full bg-[#fbe2db] text-xl">!</div><h1 className="mt-6 text-3xl font-semibold tracking-[-.04em]">Something went off-script</h1><p className="mt-3 leading-7 text-[#66736d]">Your data is safe. Retry this screen, or return to the assessment from the navigation.</p><button onClick={reset} className="mt-7 rounded-full bg-[#174b36] px-6 py-3.5 font-bold text-white">Try again</button></section></main>;
}
