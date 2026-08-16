"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Assessment", icon: "◎" },
  { href: "/reports", label: "Reports", icon: "▤" },
  { href: "/products", label: "Products", icon: "◇" },
  { href: "/dashboard", label: "Dashboard", icon: "▥" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-[#dde2dc] bg-[#f1f2ed]/95 p-5 backdrop-blur lg:flex">
        <Link href="/" className="flex items-center gap-3 px-2 py-2 font-bold"><span className="grid size-10 place-items-center rounded-xl bg-[#174b36] text-sm text-white">SC</span><span>Sales Clarity</span></Link>
        <nav className="mt-10 space-y-2">{links.map((link) => <NavLink key={link.label} {...link} active={link.href === "/" ? pathname === "/" : pathname.startsWith(link.href.split("#")[0])} onClick={() => setOpen(false)} />)}</nav>
        <div className="mt-auto rounded-2xl bg-[#174b36] p-5 text-white"><p className="text-xs font-bold tracking-[.14em] text-[#b9d8c5]">LIVE ASSESSMENT</p><p className="mt-2 text-sm leading-6 text-[#d8e7dd]">Anonymous responses and operator metrics sync directly to Supabase.</p><span className="mt-4 inline-flex items-center gap-2 text-xs font-bold"><span className="size-2 rounded-full bg-[#76d49a]"/>ONLINE</span></div>
      </aside>

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#dde2dc] bg-[#f7f6f1]/95 px-4 backdrop-blur lg:hidden"><Link href="/" className="flex items-center gap-3 font-bold"><span className="grid size-9 place-items-center rounded-xl bg-[#174b36] text-xs text-white">SC</span>Sales Clarity</Link><button aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="grid size-10 place-items-center rounded-xl border border-[#d6dcd6] bg-white text-xl">{open ? "×" : "☰"}</button></header>
      {open && <div className="fixed inset-0 z-30 bg-[#14231c]/25 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-x-4 top-20 z-40 rounded-[1.5rem] border border-[#d8ddd6] bg-[#fffefa] p-4 shadow-[0_25px_80px_rgba(20,35,28,.22)] transition lg:hidden ${open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"}`}><nav className="space-y-2">{links.map((link) => <NavLink key={link.label} {...link} active={link.href === "/" ? pathname === "/" : pathname.startsWith(link.href.split("#")[0])} onClick={() => setOpen(false)} />)}</nav></aside>
      <div className="min-w-0 lg:pl-60">{children}</div>
    </>
  );
}

function NavLink({ href, label, icon, active, onClick }: { href: string; label: string; icon: string; active: boolean; onClick: () => void }) {
  return <Link href={href} onClick={onClick} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${active ? "bg-[#d9ede1] text-[#174b36]" : "text-[#536159] hover:bg-white"}`}><span className="grid size-7 place-items-center text-base">{icon}</span>{label}</Link>;
}
