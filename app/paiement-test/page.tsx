import type { Metadata } from "next";
import PaymentCheckout from "@/components/payment-checkout";

export const metadata: Metadata = { title: "Nouvelle présentation du paiement | Princess Bloom", robots: { index: false, follow: false } };

export default function PaymentComparisonPage() {
  return <PaymentCheckout comparison />;
}
