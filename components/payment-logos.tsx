import Image from "next/image";
import { STRIPE_PAYMENT_METHODS } from "@/lib/payment-methods";
import "./payment-logos.css";

// Card networks and wallets supported by the existing card integration, in
// reference-image order. Klarna is already accepted by this storefront.
// PayPal, Bancontact, MB WAY, Scalapay and Shop Pay are not accepted by the
// current checkout configuration and must not be advertised as available.
const logos = [
  { file: "american_express", name: "American Express", method: "card" },
  { file: "apple_pay", name: "Apple Pay", method: "card" },
  { file: "diners_club", name: "Diners Club", method: "card" },
  { file: "discover", name: "Discover", method: "card" },
  { file: "google_pay", name: "Google Pay", method: "card" },
  { file: "master", name: "Mastercard", method: "card" },
  { file: "klarna", name: "Klarna", method: "klarna" },
  { file: "visa", name: "Visa", method: "card" },
];

export function PaymentLogos() {
  return <div className="pb-payment-badges" role="list" aria-label="Moyens de paiement, selon disponibilité lors du paiement">
    {logos.filter(logo => STRIPE_PAYMENT_METHODS.includes(logo.method)).map(logo => <span key={logo.file} role="listitem" className="pb-payment-badge"><Image src={`/payments/${logo.file}.svg`} alt={logo.name} width={60} height={38} unoptimized /></span>)}
  </div>;
}
