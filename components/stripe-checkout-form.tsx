"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import type { StripeCheckoutForm } from "@stripe/stripe-js";
import { Crown, LockKeyhole, Truck, Headphones, ShoppingBag, CircleHelp } from "lucide-react";
import { useStore } from "./store-provider";
import CheckoutComparisonSummary from "./checkout-comparison-summary";
import "./checkout-comparison.css";

const publicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim().replace(/^(['"])([\s\S]*)\1$/, "$2").trim();
const appearance = {
  theme: "stripe" as const, labels: "auto" as const, inputs: "spaced" as const,
  variables: { borderRadius: "4px", colorBackground: "#ffffff", colorDanger: "#df1b41", colorPrimary: "#0570de", colorSuccess: "#00c853", colorText: "#30313d", fontFamily: "default", fontSizeBase: "16px", spacingUnit: "4px" },
};

function OfficialForm({ cartPayload, amount }: { cartPayload: string; amount: number }) {
  const container = useRef<HTMLDivElement>(null);
  const requestId = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!scriptReady || !container.current || !publicKey) return;
    const controller = new AbortController();
    let form: StripeCheckoutForm | undefined;
    async function mount() {
      try {
        if (!requestId.current) requestId.current = crypto.randomUUID();
        const response = await fetch("/api/create-checkout-session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...JSON.parse(cartPayload), requestId: requestId.current }), signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Impossible de préparer le paiement.");
        if (!result.client_secret || result.amount !== amount) throw new Error("Le montant a changé. Actualisez la page avant de réessayer.");
        if (controller.signal.aborted) return;
        const stripe = window.Stripe?.(publicKey!, { locale: "fr" });
        if (!stripe?.initCheckoutFormSdk) throw new Error("Le formulaire Stripe n’a pas pu se charger. Actualisez la page.");
        const checkout = stripe.initCheckoutFormSdk({ clientSecret: result.client_secret, appearance });
        const loaded = await checkout.loadActions();
        if (controller.signal.aborted) return;
        if (loaded.type !== "success") throw new Error("Stripe ne peut pas ouvrir le formulaire. Veuillez réessayer.");
        form = checkout.createForm({ layout: "expanded" });
        form.on("ready", () => { if (!controller.signal.aborted) setReady(true); });
        form.on("loaderror", () => { if (!controller.signal.aborted) setError("Le formulaire Stripe n’a pas pu se charger. Vérifiez votre connexion et réessayez."); });
        let confirming = false;
        form.on("confirm", async event => {
          if (confirming || controller.signal.aborted) return;
          confirming = true; setError("");
          try {
            const confirmed = await loaded.actions.confirm({ formConfirmEvent: event, redirect: "if_required", returnUrl: `${window.location.origin}/confirmation?session_id=${encodeURIComponent(result.sessionId)}` });
            if (controller.signal.aborted) return;
            if (confirmed.type === "error") setError(confirmed.error.message || "Le paiement n’a pas abouti. Veuillez réessayer.");
            else window.location.assign(`/confirmation?session_id=${encodeURIComponent(confirmed.session.id)}`);
          } catch { if (!controller.signal.aborted) setError("Impossible de confirmer le paiement. Veuillez réessayer."); }
          finally { confirming = false; }
        });
        if (container.current) form.mount(container.current);
      } catch (failure) {
        if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : "Le paiement est momentanément indisponible.");
      }
    }
    void mount();
    return () => { controller.abort(); form?.destroy(); };
  }, [scriptReady, cartPayload, amount, attempt]);

  return <section className="checkout-form official-stripe-form" aria-label="Formulaire de paiement sécurisé Stripe">
    <Script id="stripe-checkout-form-sdk" src="https://js.stripe.com/dahlia/stripe.js" strategy="afterInteractive" onReady={() => setScriptReady(true)} onError={() => setError("Stripe ne peut pas se charger. Vérifiez votre connexion et réessayez.")} />
    {!ready && !error && <p className="official-stripe-loading" role="status"><LockKeyhole />Chargement du paiement sécurisé…</p>}
    <div ref={container} />
    {error && <div className="checkout-error" role="alert"><CircleHelp /><span>{error}<button type="button" className="official-stripe-retry" onClick={() => { setError(""); setReady(false); setAttempt(value => value + 1); }}>Réessayer</button></span></div>}
    <p className="checkout-legal">En passant commande, vous acceptez nos <Link href="/conditions-generales">conditions générales de vente</Link>.</p>
  </section>;
}

export default function StripeCheckoutFormPage() {
  const { cart, promoCode, total } = useStore();
  const payload = JSON.stringify({ cart: cart.map(({ id, quantity }) => ({ id, quantity })), promoCode });
  return <main className="checkout-page checkout-comparison"><div className="checkout-shell">
    <header className="checkout-header"><Link href="/" className="checkout-wordmark" aria-label="Princess Bloom, accueil"><Crown /><span>PRINCESS</span><small>BLOOM</small></Link><LockKeyhole className="checkout-header-lock" /><div className="checkout-reassurance"><span><Truck />Livraison offerte</span><i /><span><Headphones />Service client réactif 7j/7</span><i /><span><LockKeyhole />Paiement sécurisé</span></div></header>
    {cart.length ? publicKey ? <><CheckoutComparisonSummary /><OfficialForm key={payload} cartPayload={payload} amount={Math.round(total * 100)} /></> : <div className="checkout-empty"><LockKeyhole /><h1>Le paiement est momentanément indisponible.</h1><p>Veuillez réessayer dans quelques instants.</p><Link href="/produit">Continuer mes achats</Link></div> : <div className="checkout-empty"><ShoppingBag /><h1>Votre panier est vide</h1><p>Retrouvez votre douceur préférée avant de passer commande.</p><Link href="/produit">Découvrir Princess Bloom</Link></div>}
  </div></main>;
}
