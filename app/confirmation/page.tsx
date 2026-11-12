import { Suspense } from "react";
import Link from "next/link";
import Stripe from "stripe";
import { Check, CircleHelp, LockKeyhole } from "lucide-react";

async function VerifiedConfirmation({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  let state: "paid" | "processing" | "pending" = "pending";
  let amount: number | null = null;
  let currency = "EUR";
  if (process.env.STRIPE_SECRET_KEY) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-09-30.endive" });
    try {
      if (typeof params.payment_intent === "string" && typeof params.payment_intent_client_secret === "string") {
        const intent = await stripe.paymentIntents.retrieve(params.payment_intent);
        if (intent.client_secret === params.payment_intent_client_secret) {
          state = intent.status === "succeeded" ? "paid" : intent.status === "processing" ? "processing" : "pending";
          amount = intent.amount / 100;
          currency = intent.currency.toUpperCase();
        }
      } else if (typeof params.session_id === "string") {
        const session = await stripe.checkout.sessions.retrieve(params.session_id);
        if (session.payment_status === "paid") { state = "paid"; amount = (session.amount_total || 0) / 100; currency = (session.currency || "eur").toUpperCase(); }
      }
    } catch { /* A missing or invalid payment never confirms an order. */ }
  }
  return <main className="mx-auto max-w-3xl px-5 py-16"><div className="rounded-[2rem] border border-[#e6c8d3] bg-[#fff8f8] p-8 text-center shadow-sm"><div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#f1dce4] text-[#7c1d40]">{state === "paid" ? <Check /> : state === "processing" ? <LockKeyhole /> : <CircleHelp />}</div><h1 className="text-4xl text-[#631b37]">{state === "paid" ? "Merci pour votre commande" : state === "processing" ? "Votre paiement est en cours" : "Confirmation en attente"}</h1><p className="mt-5 text-sm leading-7 text-[#795361]">{state === "paid" ? "Votre paiement a bien été validé. Merci d’avoir choisi Princess Bloom." : state === "processing" ? "Votre paiement est en cours de traitement. Vous pouvez actualiser cette page pour consulter son état." : "Nous n’avons pas encore reçu de confirmation de paiement. Vous pouvez revenir au paiement pour vérifier votre commande."}</p>{amount !== null && state !== "pending" && <p className="mt-4 text-2xl font-semibold text-[#7c1d40]">{new Intl.NumberFormat("fr-FR",{style:"currency",currency}).format(amount)}</p>}<Link href={state === "pending" ? "/paiement" : "/produit"} className="mt-7 inline-block rounded-full bg-[#7c1d40] px-6 py-3 text-sm font-semibold text-white">{state === "pending" ? "Revenir au paiement" : "Continuer mes achats"}</Link></div></main>;
}

export default function ConfirmationPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <Suspense fallback={<main className="mx-auto max-w-3xl px-5 py-20 text-center" role="status">V?rification de votre paiement?</main>}><VerifiedConfirmation {...props} /></Suspense>;
}
