"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { createProduct, getProducts, setProductActive, updateProduct } from "@/lib/data";
import type { Product } from "@/lib/types";

type ProductInput = { name: string; description: string; price: string };
const EMPTY_INPUT: ProductInput = { name: "", description: "", price: "" };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [input, setInput] = useState<ProductInput>(EMPTY_INPUT);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setProducts(await getProducts()); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Could not load programs."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  function startCreate() { setEditing(null); setInput(EMPTY_INPUT); setCreating(true); setError(null); }
  function startEdit(product: Product) { setCreating(false); setEditing(product); setInput({ name: product.name, description: product.description ?? "", price: (product.price_cents / 100).toFixed(2) }); setError(null); }
  function cancel() { setCreating(false); setEditing(null); setInput(EMPTY_INPUT); }

  async function save(event: FormEvent) {
    event.preventDefault();
    const priceCents = Math.round(Number(input.price) * 100);
    if (!input.name.trim() || !Number.isFinite(priceCents) || priceCents < 0) { setError("Enter a program name and a valid price."); return; }
    setSaving(true); setError(null);
    try {
      const saved = editing ? await updateProduct(editing.id, { name: input.name, description: input.description, priceCents }) : await createProduct({ name: input.name, description: input.description, priceCents });
      setProducts((current) => editing ? current.map((product) => product.id === saved.id ? saved : product) : [...current, saved]);
      cancel();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not save this program."); }
    finally { setSaving(false); }
  }

  async function toggle(product: Product) {
    setSaving(true); setError(null);
    try { const saved = await setProductActive(product.id, !product.is_active); setProducts((current) => current.map((item) => item.id === saved.id ? saved : item)); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Could not update this program."); }
    finally { setSaving(false); }
  }

  return (
    <main className="min-h-screen px-4 py-7 sm:px-8 lg:px-12">
      <section className="mx-auto max-w-6xl py-5 sm:py-10">
        <p className="text-xs font-bold tracking-[.18em] text-[#174b36]">OPERATOR CATALOG · DATABASE-BACKED</p>
        <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><h1 className="text-4xl font-semibold tracking-[-.05em] sm:text-6xl">Programs</h1><p className="mt-3 max-w-2xl leading-7 text-[#66736d]">Manage the products matched to visitor gaps. Archived programs stay attached to historical purchases.</p></div><button onClick={startCreate} className="w-fit rounded-full bg-[#174b36] px-6 py-3.5 font-bold text-white hover:bg-[#0f3526]">+ Add program</button></div>
        {error && <div role="alert" className="mt-6 rounded-xl bg-[#fbe2db] p-4 text-sm font-medium text-[#8b3022]">{error} <button className="underline" onClick={() => void load()}>Reload catalog</button></div>}
        {(creating || editing) && <ProductForm input={input} setInput={setInput} editing={Boolean(editing)} saving={saving} onSubmit={save} onCancel={cancel} />}
        {loading ? <div className="mt-10 grid gap-5 md:grid-cols-2">{[1,2,3,4].map((item)=><div key={item} className="skeleton h-72 rounded-3xl"/>)}</div> : <div className="mt-10 grid gap-5 md:grid-cols-2">{products.map((product) => <article key={product.id} className={`flex flex-col rounded-[1.6rem] border bg-[#fffefa] p-6 ${product.is_active ? "border-[#dfe3dc]" : "border-dashed border-[#c6cbc6] opacity-70"}`}><div className="flex items-center justify-between"><span className={`rounded-full px-3 py-1 text-xs font-bold ${product.is_active ? "bg-[#d9ede1] text-[#174b36]" : "bg-[#e9e9e5] text-[#66736d]"}`}>{product.is_active ? "ACTIVE" : "ARCHIVED"}</span><span className="text-xs text-[#7b8680]">/{product.slug}</span></div><h2 className="mt-6 text-2xl font-semibold leading-tight tracking-[-.035em]">{product.name}</h2><p className="mt-3 flex-1 text-sm leading-6 text-[#66736d]">{product.description || "No description yet."}</p><p className="mt-6 text-3xl font-semibold">${(product.price_cents / 100).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</p><div className="mt-6 flex gap-3"><button disabled={saving} onClick={() => startEdit(product)} className="flex-1 rounded-full border border-[#cbd4cd] px-4 py-3 font-bold hover:bg-[#f3f5f1]">Edit</button><button disabled={saving} onClick={() => void toggle(product)} className="flex-1 rounded-full border border-[#cbd4cd] px-4 py-3 font-bold hover:bg-[#f3f5f1]">{product.is_active ? "Archive" : "Restore"}</button></div></article>)}</div>}
      </section>
    </main>
  );
}

function ProductForm({input,setInput,editing,saving,onSubmit,onCancel}:{input:ProductInput;setInput:React.Dispatch<React.SetStateAction<ProductInput>>;editing:boolean;saving:boolean;onSubmit:(event:FormEvent)=>void;onCancel:()=>void}){
  return <form onSubmit={onSubmit} className="animate-rise mt-8 rounded-[1.6rem] border border-[#b9cfbf] bg-[#edf6f0] p-6 sm:p-8"><div className="flex items-center justify-between"><h2 className="text-2xl font-semibold tracking-[-.03em]">{editing ? "Edit program" : "Add a program"}</h2><button type="button" onClick={onCancel} aria-label="Close program form" className="grid size-9 place-items-center rounded-full border border-[#bdd0c2]">×</button></div><div className="mt-6 grid gap-5 sm:grid-cols-2"><label className="text-sm font-bold">Program name<input required value={input.name} onChange={(event)=>setInput((value)=>({...value,name:event.target.value}))} className="mt-2 w-full rounded-xl border border-[#c7d4ca] bg-white px-4 py-3 font-normal outline-none focus:border-[#174b36]"/></label><label className="text-sm font-bold">Price (USD)<input required min="0" step="0.01" type="number" value={input.price} onChange={(event)=>setInput((value)=>({...value,price:event.target.value}))} className="mt-2 w-full rounded-xl border border-[#c7d4ca] bg-white px-4 py-3 font-normal outline-none focus:border-[#174b36]"/></label><label className="text-sm font-bold sm:col-span-2">Description<textarea required rows={3} value={input.description} onChange={(event)=>setInput((value)=>({...value,description:event.target.value}))} className="mt-2 w-full resize-y rounded-xl border border-[#c7d4ca] bg-white px-4 py-3 font-normal outline-none focus:border-[#174b36]"/></label></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onCancel} className="rounded-full px-5 py-3 font-bold text-[#536159]">Cancel</button><button disabled={saving} className="rounded-full bg-[#174b36] px-6 py-3 font-bold text-white disabled:opacity-50">{saving ? "Saving…" : "Save program"}</button></div></form>;
}
