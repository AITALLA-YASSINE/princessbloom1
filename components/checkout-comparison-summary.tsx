"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDown, LockKeyhole } from "lucide-react";
import { useStore } from "./store-provider";
import { CHECKOUT_CATALOG } from "@/lib/checkout";

const money = (amount: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);

export default function CheckoutComparisonSummary() {
  const { cart, subtotal, total, discount, promoCode, setPromoCode } = useStore();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(promoCode);
  const [error, setError] = useState("");
  function apply() {
    const code = draft.trim().toUpperCase();
    if (code && !["PRINCESSBLOOM5", "PRINCESSBLOOM10"].includes(code)) { setError("Ce code de réduction n’est pas valide."); return; }
    setError(""); setPromoCode(code);
  }
  return <aside className="comparison-summary" aria-label="Résumé de votre commande">
    <button className="comparison-summary-toggle" type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="comparison-summary-content"><span>Résumé de la commande <ChevronDown /></span><strong>{money(total)}</strong></button>
    <div id="comparison-summary-content" className={`comparison-summary-content${open ? " is-open" : ""}`}>
      <h2 className="sr-only">Votre commande</h2>
      <div className="comparison-items">{cart.map(item => <div className="comparison-item" key={item.id}>
        <div className="comparison-item-photo"><Image src={item.image || "/photos/product-hero-square.webp"} width={64} height={64} alt="" /><span aria-label={`Quantité : ${item.quantity}`}>{item.quantity}</span></div>
        <p>{CHECKOUT_CATALOG[item.id as keyof typeof CHECKOUT_CATALOG]?.name || item.name}</p><strong>{money(item.price * item.quantity)}</strong>
      </div>)}</div>
      <div className="comparison-discount"><label className="sr-only" htmlFor="comparison-promo">Code de réduction</label><input id="comparison-promo" value={draft} onChange={event => { setDraft(event.target.value); setError(""); }} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); apply(); } }} placeholder="Code de réduction" autoComplete="off" /><button type="button" onClick={apply}>Valider</button></div>
      {error && <p className="comparison-promo-error" role="alert">{error}</p>}
      {discount > 0 && <p className="comparison-promo-success">Code {promoCode.trim().toUpperCase()} appliqué</p>}
      <dl className="comparison-totals"><div><dt>Sous-total</dt><dd>{money(subtotal)}</dd></div><div><dt>Expédition</dt><dd>Offerte</dd></div>{discount > 0 && <div><dt>Réduction</dt><dd>−{money(discount)}</dd></div>}<div className="comparison-grand-total"><dt>Total</dt><dd><small>EUR</small>{money(total)}</dd></div></dl>
      <p className="comparison-secure"><LockKeyhole /> Paiement sécurisé et chiffré</p>
    </div>
  </aside>;
}
