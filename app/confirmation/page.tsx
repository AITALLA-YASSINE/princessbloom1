"use client";

import { useState } from "react";

export default function ConfirmationPage() {
  const [visible] = useState(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    return params.get("status") === "success" || Boolean(params.get("session_id"));
  });

  if (!visible) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-dashed border-[#493238]/20 bg-[#f5ece9] p-10 text-center">
          <h1 className="text-3xl text-[#493238]">Confirmation en attente</h1>
          <p className="mt-4 text-sm leading-7 text-[#493238]/70">
            La confirmation de commande n’est affichée qu’après validation du paiement côté serveur via Stripe ou un prestataire connecté.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] bg-[linear-gradient(135deg,#f8ecea_0%,#f3dfe2_100%)] p-8 text-center shadow-[0_30px_60px_rgba(73,50,56,0.08)]">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#b77b8c]">Commande confirmée</p>
        <h1 className="mt-4 text-4xl text-[#493238]">Merci pour votre commande.</h1>
        <p className="mt-4 text-base text-[#493238]/75">
          Votre paiement a bien été validé et un email de confirmation a été envoyé.
        </p>
      </div>
    </main>
  );
}
