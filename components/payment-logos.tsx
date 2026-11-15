import Image from "next/image";
import "./payment-logos.css";

// Display the complete requested reference artwork, retaining the existing
// Klarna mark. This presentation does not enable any checkout payment method.
const logos = [
  { file: "american_express", name: "American Express", method: "card" },
  { file: "apple_pay", name: "Apple Pay", method: "card" },
  { file: "bancontact", name: "Bancontact", method: "bancontact" },
  { file: "diners_club", name: "Diners Club", method: "card" },
  { file: "discover", name: "Discover", method: "card" },
  { file: "google_pay", name: "Google Pay", method: "card" },
  { file: "master", name: "Mastercard", method: "card" },
  { file: "mbway", name: "MB WAY", method: "mb_way" },
  { file: "paypal-full", name: "PayPal", method: "paypal" },
  { file: "satispay", name: "Satispay", method: "satispay" },
  { file: "scalapay", name: "Scalapay", method: "scalapay" },
  { file: "shopify_pay", name: "Shop Pay", method: "shop_pay" },
  { file: "klarna", name: "Klarna", method: "klarna" },
  { file: "visa", name: "Visa", method: "card" },
];

export function PaymentLogos() {
  return <div className="pb-payment-badges" role="list" aria-label="Moyens de paiement, selon disponibilité lors du paiement">
    {logos.map(logo => <span key={logo.file} role="listitem" className={`pb-payment-badge${logo.file === "paypal-full" ? " pb-payment-badge-paypal" : ""}`}><Image src={`/payments/${logo.file}.svg`} alt={logo.name} width={44} height={28} unoptimized /></span>)}
  </div>;
}
