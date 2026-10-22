"use client";

import { useState } from "react";
import { useStore } from "@/components/store-provider";
import { STRIPE_PAYMENT_METHODS } from "@/lib/payment-methods";

export default function PaymentPage() {
  const { cart, total, orderData } = useStore();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const stripeReady = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  const paymentLabel = STRIPE_PAYMENT_METHODS.includes("klarna") ? "Carte bancaire + Klarna" : "Carte bancaire sécurisée";

  const handlePayment = async () => {
    if (!stripeReady) {
      setStatus("Configuration Stripe manquante : ajoutez NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY et STRIPE_SECRET_KEY pour activer le paiement réel.");
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          total,
          customer: orderData,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Impossible de lancer la session de paiement.");
      if (data.url) window.location.href = data.url;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-[#493238]/10 bg-[#fffaf8] p-8">
        <h1 className="text-4xl text-[#493238]">Paiement sécurisé</h1>
        <p className="mt-3 text-sm text-[#493238]/70">Paiement via Stripe lorsque les clés sont configurées côté serveur.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.7fr]">
          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-[#493238]/10 bg-white p-4">
              <p className="font-medium text-[#493238]">Moyen de paiement</p>
              <div className="mt-3 flex items-center gap-3 rounded-full border border-[#dfe3eb] bg-[#f8f9fb] px-4 py-3 text-sm text-[#493238]">
                <span>{paymentLabel}</span>
                <span className="ml-auto text-xs uppercase tracking-[0.15em] text-[#b77b8c]">Stripe</span>
              </div>
            </div>

            {!stripeReady && (
              <div className="rounded-[1.5rem] border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
                Le paiement n’est pas encore activé. Ajoutez les variables NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY et STRIPE_SECRET_KEY dans votre environnement pour activer la session Stripe.
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full rounded-full bg-[#b77b8c] px-6 py-3 text-sm font-medium text-white shadow-[0_18px_30px_rgba(183,123,140,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Chargement..." : "Payer maintenant"}
            </button>

            {status && <p className="text-sm text-[#493238]/70">{status}</p>}
          </div>

          <aside className="rounded-[1.75rem] bg-[#f5ece9] p-6">
            <h2 className="text-xl font-semibold text-[#493238]">Commande</h2>
            <ul className="mt-4 space-y-3 text-sm text-[#493238]/75">
              {cart.map((item) => (
                <li key={item.id} className="flex justify-between gap-4">
                  <span>{item.name} × {item.quantity}</span>
                  <span>{(item.price * item.quantity).toFixed(2)} €</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 border-t border-[#493238]/10 pt-4 text-lg font-semibold text-[#493238] flex justify-between">
              <span>Total</span>
              <span>{total.toFixed(2)} €</span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
