"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Elements, ExpressCheckoutElement, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, StripeExpressCheckoutElementConfirmEvent } from "@stripe/stripe-js";
import { Building2, Check, ChevronDown, CircleHelp, Crown, Headphones, KeyRound, LockKeyhole, Mail, MapPin, Phone, ShoppingBag, Star, Truck, UserRound } from "lucide-react";
import "./checkout-comparison.css";
import CheckoutComparisonSummary from "./checkout-comparison-summary";
import PayPalButton from "./paypal-button";
import AddressAutocomplete from "@/components/address-autocomplete";
import { useStore } from "@/components/store-provider";
import { CHECKOUT_CATALOG, COUNTRIES } from "@/lib/checkout";
import { STRIPE_PAYMENT_METHODS } from "@/lib/payment-methods";

const catalog: Record<string, { name: string; price: number; oldPrice: number }> = CHECKOUT_CATALOG;
const publicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim().replace(/^(['"])([\s\S]*)\1$/, "$2").trim();
// Keep the same Stripe instance across Fast Refresh updates of this module.
const stripeCache = globalThis as typeof globalThis & { princessBloomStripe?: { key: string; promise: ReturnType<typeof loadStripe> } };
if (publicKey && stripeCache.princessBloomStripe?.key !== publicKey) stripeCache.princessBloomStripe = { key: publicKey, promise: loadStripe(publicKey, { locale: "fr" }) };
const stripePromise = publicKey ? stripeCache.princessBloomStripe!.promise : null;
function walletDebug(event: string, data: Record<string, unknown>) {
  if (process.env.NODE_ENV === "development") console.warn("[wallet-debug]", JSON.stringify({ event, ...data }));
}
const money = (value: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
const countryNames: Record<string, string> = { FR: "France", BE: "Belgique", LU: "Luxembourg", DE: "Allemagne", ES: "Espagne", IT: "Italie", NL: "Pays-Bas", PT: "Portugal", AT: "Autriche", IE: "Irlande" };

function CheckoutForm({ comparison = false }: { comparison?: boolean }) {
  const { cart, subtotal, total, discount, promoCode, setPromoCode, orderData, setOrderData } = useStore();
  const stripe = useStripe();
  const elements = useElements();
  const [values, setValues] = useState<Record<string, string>>({});
  const customer: Record<string, string> = { ...orderData, billingCountry: orderData.billingCountry || "FR", country: orderData.country && COUNTRIES.includes(orderData.country) ? orderData.country : "FR", ...values };
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [billingSame, setBillingSame] = useState(true);
  const [newsletter, setNewsletter] = useState(false);
  const [expressAvailable, setExpressAvailable] = useState<boolean | null>(null);
  const [expressMessage, setExpressMessage] = useState("");
  const [paypalPending, setPaypalPending] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const requestId = useRef<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const addressReady = Boolean(customer.address?.trim() && customer.postalCode?.trim() && customer.city?.trim());
  const oldTotal = cart.reduce((sum, item) => sum + (catalog[item.id]?.oldPrice ?? item.price * 100) * item.quantity / 100, 0);

  useEffect(() => { if (elements && total > 0) elements.update({ amount: Math.round(total * 100) }); }, [elements, total]);

  useEffect(() => {
    walletDebug("context", { stripe: Boolean(stripe), elements: Boolean(elements), secure: window.location.protocol === "https:", embedded: window.top !== window.self });
  }, [stripe, elements]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setExpressMessage(window.location.protocol === "https:"
        ? "Le chargement des boutons express prend plus de temps que prévu. Vous pouvez utiliser le formulaire ci-dessous pendant leur chargement."
        : "Apple Pay et Google Pay nécessitent une page HTTPS. Pour les tester, ouvrez la boutique sécurisée dans un navigateur compatible.");
    }, window.location.protocol === "https:" ? 12000 : 0);
    return () => window.clearTimeout(timeout);
  }, [stripe]);

  function expressAvailability(available: boolean) {
    walletDebug("availability", { available });
    setExpressAvailable(available);
    setExpressMessage(available ? "" : "Stripe ne propose aucun paiement express dans cette fenêtre. Ouvrez cette page directement dans Safari, Chrome ou Edge, en dehors d’un aperçu intégré.");
  }

  function change(name: string, value: string) { setValues(current => ({ ...current, [name]: value })); }
  function billingDetails(data: Record<string, string>) {
    return { name: data.cardholderName || (billingSame ? `${data.firstName || ""} ${data.lastName}`.trim() : data.billingName), email: data.email, phone: data.phone || undefined, address: { line1: billingSame ? data.address : data.billingAddress, line2: billingSame ? data.address2 || undefined : undefined, postal_code: billingSame ? data.postalCode : data.billingPostalCode, city: billingSame ? data.city : data.billingCity, country: billingSame ? data.country : data.billingCountry } };
  }
  async function pay(data: Record<string, string>, expressEvent?: StripeExpressCheckoutElementConfirmEvent) {
    if (!stripe || !elements || loading || paypalPending) return;
    setStatus(""); setLoading(true);
    try {
      const submitted = await elements.submit();
      if (submitted.error) throw new Error(submitted.error.message || "Vérifiez vos informations de paiement.");
      if (!requestId.current) requestId.current = crypto.randomUUID();
      const response = await fetch("/api/create-payment-intent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cart: cart.map(({id,quantity}) => ({id,quantity})), customer: data, promoCode, requestId: requestId.current }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Le paiement est indisponible. Veuillez réessayer.");
      if (result.amount !== Math.round(total * 100)) throw new Error("Le montant de votre panier a changé. Actualisez la page avant de réessayer.");
      setOrderData(data);
      const confirmation = await stripe.confirmPayment({ elements, clientSecret: result.clientSecret, confirmParams: { return_url: `${window.location.origin}/confirmation`, ...(!expressEvent ? { payment_method_data: { billing_details: billingDetails(data) } } : {}) } });
      if (confirmation.error) throw new Error(confirmation.error.message || "Le paiement n’a pas abouti. Veuillez réessayer.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Impossible de finaliser le paiement.");
      expressEvent?.paymentFailed({ reason: "fail" });
    } finally { setLoading(false); }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cart.length) { setStatus("Votre panier est vide."); return; }
    void pay({ ...customer, newsletter: String(newsletter), billingSame: String(billingSame) });
  }
  function expressConfirm(event: StripeExpressCheckoutElementConfirmEvent) {
    const details = event.billingDetails;
    const shipping = event.shippingAddress;
    if (!shipping || !details?.email) { event.paymentFailed({ reason: "invalid_shipping_address" }); setStatus("Veuillez renseigner votre adresse de livraison."); return; }
    const name = shipping.name.trim().split(/\s+/);
    const data = { ...customer, firstName: name.slice(0, -1).join(" "), lastName: name.at(-1) || shipping.name, email: details.email, phone: details.phone || "", address: shipping.address.line1, address2: shipping.address.line2 || "", postalCode: shipping.address.postal_code, city: shipping.address.city, country: shipping.address.country, newsletter: "false", billingSame: "true" };
    setValues(data); void pay(data, event);
  }
  const field = (name: string, label: string, icon: React.ReactNode, options: { type?: string; required?: boolean; autoComplete?: string; pattern?: string; title?: string } = {}) => <label className="checkout-field" key={name}><span className="sr-only">{label}</span>{icon}<input name={name} aria-label={label} placeholder={label} value={customer[name] || ""} onChange={event => change(name, event.target.value)} type={options.type ?? "text"} required={options.required} autoComplete={options.autoComplete} pattern={options.pattern} title={options.title} maxLength={254} /></label>;

  return <>
    {comparison ? <CheckoutComparisonSummary /> : <section className="checkout-summary">
      <button type="button" aria-expanded={summaryOpen} aria-controls="checkout-order-details" onClick={() => setSummaryOpen(!summaryOpen)}><span>Résumé de la commande <ChevronDown className={summaryOpen ? "is-open" : ""} /></span><span><del>{money(oldTotal)}</del><strong>{money(total)}</strong></span></button>
      {summaryOpen && <div id="checkout-order-details" className="checkout-order-details">{cart.map(item => <div className="checkout-order-item" key={item.id}><Image src={item.image ?? "/photos/product-hero-square.webp"} width={58} height={58} alt="" /><span>{catalog[item.id]?.name ?? item.name}<small>Quantité : {item.quantity}</small></span><b>{money(item.price * item.quantity)}</b></div>)}<div className="checkout-order-line"><span>Sous-total</span><b>{money(subtotal)}</b></div><div className="checkout-order-line"><span>Livraison</span><b>Offerte</b></div>{discount > 0 && <div className="checkout-order-line"><span>Remise</span><b>−{money(discount)}</b></div>}<label className="checkout-promo"><span>Code de réduction</span><input value={promoCode} onChange={event => setPromoCode(event.target.value)} placeholder="Code de réduction" /></label></div>}
    </section>}
    <form ref={formRef} onSubmit={submit} className="checkout-form">
      <div className="checkout-express-area"><h2>Paiement express</h2><PayPalButton cartPayload={JSON.stringify({ cart: cart.map(({ id, quantity }) => ({ id, quantity })), promoCode })} onPendingChange={setPaypalPending} /><section className={`checkout-express ${expressAvailable === false ? "checkout-express-unavailable" : ""}`} aria-label="Paiement express"><h2>Paiement express</h2><ExpressCheckoutElement options={{ buttonHeight: 55, buttonTheme: { applePay: "black", googlePay: "black", paypal: "gold" }, paymentMethods: { applePay: "always", googlePay: "always", paypal: "auto", link: "auto", klarna: "never", amazonPay: "never" }, paymentMethodOrder: ["paypal", "apple_pay", "google_pay", "link"], layout: { maxColumns: 3, maxRows: 3, overflow: "never" }, emailRequired: true, phoneNumberRequired: false, shippingAddressRequired: true, allowedShippingCountries: COUNTRIES, shippingRates: [{ id: "free", displayName: "Livraison offerte", amount: 0, deliveryEstimate: { minimum: { unit: "business_day", value: 5 }, maximum: { unit: "business_day", value: 10 } } }] }} onReady={event => { walletDebug("ready", { methods: event.availablePaymentMethods || null }); if (event.availablePaymentMethods) expressAvailability(Object.values(event.availablePaymentMethods).some(Boolean)); }} onAvailablePaymentMethodsChange={event => { walletDebug("change", { methods: event.paymentMethods || null }); expressAvailability(Object.values(event.paymentMethods || {}).some(method => method?.available)); }} onConfirm={expressConfirm} onShippingAddressChange={event => event.resolve()} onShippingRateChange={event => event.resolve()} onLoadError={event => { walletDebug("loaderror", { code: event.error.code || null, type: event.error.type }); setExpressAvailable(false); setExpressMessage("Le chargement Stripe a échoué. Vérifiez votre connexion et les bloqueurs de contenu, puis rechargez la page."); }} />{expressAvailable === null && !expressMessage && <span className="checkout-loading">Recherche des paiements express disponibles…</span>}{expressAvailable === false && <p>Continuez ci-dessous pour choisir votre moyen de paiement.</p>}</section></div>
      {expressAvailable !== true && expressMessage && <p className="checkout-express-notice" role="status">{expressMessage}<a href="https://princessbloom1.vercel.app/paiement" target="_blank" rel="noopener noreferrer">Ouvrir la boutique sécurisée</a></p>}
      {expressAvailable !== false && <div className="checkout-divider"><span>OU</span></div>}
      <section className="checkout-contact"><h2>Contact</h2>{field("email", "Adresse e-mail", <Mail />, { type: "email", required: true, autoComplete: "email" })}<label className="checkout-checkbox"><input type="checkbox" checked={newsletter} onChange={event => setNewsletter(event.target.checked)} /><span><Check /></span>Envoyez-moi des nouvelles et des offres par e-mail</label></section>
      <section className="checkout-delivery"><h2>Livraison</h2><div className="checkout-address-grid"><label className="checkout-field checkout-country"><MapPin /><span>Pays/région<select aria-label="Pays/région" name="country" value={customer.country} onChange={event => change("country", event.target.value)} autoComplete="shipping country">{COUNTRIES.map((code: string) => <option key={code} value={code}>{countryNames[code]}</option>)}</select></span><ChevronDown /></label><div className="checkout-field-pair">{field("firstName", "Prénom (facultatif)", <UserRound />, { autoComplete: "shipping given-name" })}{field("lastName", "Nom", <UserRound />, { required: true, autoComplete: "shipping family-name" })}</div>{<AddressAutocomplete name="address" label="Adresse" value={customer.address || ""} country={customer.country} onChange={value => change("address", value)} onSelect={address => setValues(current => ({ ...current, address: address.address, postalCode: address.postalCode, city: address.city }))} />}{field("address2", "Appartement, suite, etc. (facultatif)", <Building2 />, { autoComplete: "shipping address-line2" })}<div className="checkout-field-pair">{field("postalCode", "Code postal", <KeyRound />, { required: true, autoComplete: "shipping postal-code", ...(customer.country === "FR" ? { pattern: "[0-9]{5}", title: "Saisissez un code postal à 5 chiffres." } : {}) })}{field("city", "Ville", <Building2 />, { required: true, autoComplete: "shipping address-level2" })}</div>{field("phone", "Téléphone (facultatif)", <Phone />, { type: "tel", autoComplete: "tel" })}</div></section>
      <section className="checkout-shipping"><h2>Mode d’expédition</h2><div className="checkout-shipping-note"><Truck />{addressReady ? <span><strong>Livraison standard offerte</strong><small>Livraison en 5 à 10 jours ouvrés, avec suivi.</small></span> : <strong>Saisissez votre adresse d’expédition pour voir les modes d’expédition disponibles.</strong>}{addressReady && <Check />}</div></section>
      <section className="checkout-payment"><h2><LockKeyhole />Paiement</h2><p>Toutes les transactions sont sécurisées et chiffrées.</p><div className="checkout-stripe-fields">{!paymentReady && !paymentFailed && <div className="checkout-card-skeleton" aria-label="Chargement du formulaire bancaire"><div><span>Carte de crédit</span><span>Klarna</span></div><span>Numéro de carte</span><div><span>Date d’expiration (MM/AA)</span><span>Code de sécurité</span></div></div>}<PaymentElement options={{ layout: "tabs", fields: { billingDetails: "auto" }, wallets: { applePay: "never", googlePay: "never", link: "never" }, business: { name: "Princess Bloom" } }} onReady={() => setPaymentReady(true)} onLoadError={() => { setPaymentFailed(true); setStatus("Le formulaire de paiement n’a pas pu se charger. Vérifiez votre connexion et réessayez."); }} /></div>{field("cardholderName", "Nom sur la carte (facultatif)", <UserRound />, { autoComplete: "cc-name" })}<label className="checkout-checkbox"><input type="checkbox" checked={billingSame} onChange={event => setBillingSame(event.target.checked)} /><span><Check /></span>Utiliser l’adresse d’expédition comme adresse de facturation</label>{!billingSame && <div className="checkout-billing"><h3>Adresse de facturation</h3>{field("billingName", "Nom de facturation", <UserRound />, { required: true, autoComplete: "billing name" })}{<AddressAutocomplete name="billingAddress" label="Adresse de facturation" value={customer.billingAddress || ""} country={customer.billingCountry} onChange={value => change("billingAddress", value)} onSelect={address => setValues(current => ({ ...current, billingAddress: address.address, billingPostalCode: address.postalCode, billingCity: address.city }))} />}<div className="checkout-field-pair">{field("billingPostalCode", "Code postal de facturation", <KeyRound />, { required: true, autoComplete: "billing postal-code" })}{field("billingCity", "Ville de facturation", <Building2 />, { required: true, autoComplete: "billing address-level2" })}</div><label className="checkout-field"><MapPin /><select aria-label="Pays de facturation" value={customer.billingCountry || "FR"} onChange={event => change("billingCountry",event.target.value)} autoComplete="billing country">{COUNTRIES.map((code:string)=><option value={code} key={code}>{countryNames[code]}</option>)}</select></label></div>}</section>
      {status && <div className="checkout-error" role="alert"><CircleHelp />{status}</div>}
      <button type="submit" className="checkout-pay" disabled={!stripe || !paymentReady || paymentFailed || loading || paypalPending || !cart.length}><LockKeyhole />{loading ? "Paiement en cours…" : <>Payer maintenant<span>·</span>{money(total)}</>}</button>
      <p className="checkout-legal">En passant commande, vous acceptez nos <Link href="/conditions-generales">conditions générales de vente</Link>.</p>
    </form>
  </>;
}

export default function PaymentCheckout({ comparison = false }: { comparison?: boolean }) {
  const { cart, total } = useStore();
  return <main className={`checkout-page${comparison ? " checkout-comparison" : ""}`}><Image className="checkout-blossoms checkout-blossoms-left" src="/massseur/cherry-blossoms.png" width={240} height={240} alt="" aria-hidden="true" /><Image className="checkout-blossoms checkout-blossoms-right" src="/massseur/cherry-blossoms.png" width={200} height={200} alt="" aria-hidden="true" /><div className="checkout-shell"><header className="checkout-header"><Link href="/" className="checkout-wordmark" aria-label="Princess Bloom, accueil"><Crown /><span>PRINCESS</span><small>BLOOM</small></Link><LockKeyhole className="checkout-header-lock" /><div className="checkout-rating"><span>{[0,1,2].map(i=><span key={i}><Star /></span>)}</span><strong>Noté 4,9/5 par nos clientes</strong></div><div className="checkout-reassurance"><span><Truck />Livraison offerte</span><i /><span><Headphones />Service client réactif 7j/7</span><i /><span><LockKeyhole />Paiement sécurisé</span></div></header>{cart.length ? stripePromise ? <Elements stripe={stripePromise} options={{ mode: "payment", currency: "eur", amount: Math.max(50, Math.round(total*100)), allowedPaymentMethodTypes: STRIPE_PAYMENT_METHODS, locale: "fr", appearance: { theme: "stripe", variables: { colorPrimary: comparison ? "#7c1737" : "#781735", colorText: "#181316", colorBackground: comparison ? "#ffffff" : "#fffdfd", colorDanger: "#a3173f", borderRadius: comparison ? "14px" : "12px", fontFamily: "Arial, sans-serif", fontSizeBase: "16px", spacingUnit: "4px" }, rules: { ".Input": { borderColor: "#d4ccd9", boxShadow: "none" }, ".Tab": { borderColor: comparison ? "#dddddd" : "#e2d8df", boxShadow: "none", padding: comparison ? "16px" : "12px" }, ".Tab--selected": { borderColor: comparison ? "#171717" : "#7c1737", backgroundColor: comparison ? "#f6f6f6" : "#fce7ee" } } } }}><CheckoutForm comparison={comparison} /></Elements> : <div className="checkout-empty"><LockKeyhole /><h1>Le paiement est momentanément indisponible.</h1><p>Veuillez réessayer dans quelques instants.</p><Link href="/produit">Continuer mes achats</Link></div> : <div className="checkout-empty"><ShoppingBag /><h1>Votre panier est vide</h1><p>Retrouvez votre douceur préférée avant de passer commande.</p><Link href="/produit">Découvrir Princess Bloom</Link></div>}</div></main>;
}
