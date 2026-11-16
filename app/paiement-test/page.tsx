import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Nouvelle présentation du paiement | Princess Bloom", robots: { index: false, follow: false } };

export default function PaymentComparisonPage() {
  redirect("/paiement");
}
