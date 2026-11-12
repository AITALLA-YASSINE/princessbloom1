"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, CircleHelp, Feather, Flower2, Gift, LockKeyhole, ShoppingBag, Sparkles, Star, Truck, UserRound, Waves } from "lucide-react";
import { useStore } from "@/components/store-provider";
import { product } from "@/lib/site-data";

const views = ["La ceinture Princess Bloom sur un satin rose", "La sangle ajustable et sa boucle", "Le réglage de la chaleur", "La ceinture portée au quotidien", "Le coffret Princess Bloom"];
const questions = [
  { question: "Elle chauffe jusqu’à combien ?", answer: "La chaleur se règle sur 5 niveaux. Consultez la notice pour les températures exactes et commencez toujours par le niveau le plus doux." },
  { question: "Est-ce sans fil ?", answer: "Oui, la ceinture s’utilise sans fil après recharge avec son câble USB." },
  { question: "Est-ce confortable à porter ?", answer: "Sa sangle ajustable permet de l’adapter à votre taille. Légère et discrète, elle accompagne vos mouvements au quotidien." },
  { question: "Comment la nettoyer ?", answer: "Éteignez et débranchez la ceinture, puis nettoyez-la avec un chiffon légèrement humide. Ne la plongez pas dans l’eau." },
];
function ProductVisual({ view = 0, className = "" }: { view?: number; className?: string }) {
  return <div role="img" aria-label={views[view] ?? "Pochette, câble USB et poche de gel roses"} className={`pb-visual pb-view-${view} ${className}`} />;
}

export default function ProductPage() {
  const { addToCart } = useStore();
  const [activeImage, setActiveImage] = useState(0);
  const [offer, setOffer] = useState("duo");
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);
  const price = offer === "duo" ? 149 : product.price;
  function handleAddToCart() {
    addToCart({ id: offer === "duo" ? `${product.id}-pack` : product.id, name: offer === "duo" ? "Pack Bien-être Complet — Princess Bloom" : product.name, price, quantity: 1, image: "/massseur/produit1.png" });
  }
  return (
    <main className="pb-product">
      <div className="pb-product-inner">
        <section className="pb-gallery" aria-label="Photos du produit">
          <div className="pb-hero-row">
            <div className="pb-hero"><ProductVisual view={activeImage} /><span className="pb-ribbon">BEST-SELLER 🔥</span></div>
            <div className="pb-benefit-icons">
              <div><span><Waves /></span><strong>Chaleur<br />personnalisable</strong></div>
              <div><span><Flower2 /></span><strong>Massage<br />relaxant</strong></div>
              <div><span><Feather /></span><strong>Discrétion<br />au quotidien</strong></div>
            </div>
          </div>
          <div className="pb-thumbnails">{views.map((label, index) => <button key={label} onClick={() => setActiveImage(index)} aria-label={label} aria-pressed={activeImage === index} className={activeImage === index ? "is-active" : ""}><ProductVisual view={index} /></button>)}</div>
        </section>
        <section className="pb-details" aria-label="Choisir votre ceinture">
          <div className="pb-reviews"><Link href="/avis" className="pb-rating"><span>{Array.from({ length: 5 }, (_, i) => <Star key={i} />)}</span><span><b>4,9/5</b> (1 327 avis vérifiés)</span></Link><span className="pb-community"><UserRound /><b>+50 000 femmes soulagées</b></span></div>
          <h1>Ceinture chauffante et massante<br className="pb-title-break" /> Princess Bloom</h1>
          <div className="pb-price"><strong>89,00 €</strong><del>119,00 €</del><span>-25 %</span></div>
          <ul className="pb-features">{["Soulage efficacement les douleurs de règles", "Chaleur douce et réglable (5 niveaux)", "Massage relaxant (4 modes de vibration)", "Confortable, légère et discrète"].map(text => <li key={text}><Check />{text}</li>)}</ul>
          <fieldset className="pb-offers"><legend className="sr-only">Choisissez votre offre</legend><div className="pb-offer-banner">🔥 MEILLEURE OFFRE DUO</div>
            <label className={`pb-offer pb-pack ${offer === "duo" ? "is-selected" : ""}`}><input type="radio" name="offer" value="duo" checked={offer === "duo"} onChange={() => setOffer("duo")} /><span className="pb-radio" /><span className="pb-offer-content"><span className="pb-offer-heading"><span><strong>Pack Bien-être Complet</strong><small>La solution complète pour un confort absolu</small></span><span className="pb-offer-price"><strong>149,00 €</strong><del>209,00 €</del><em>-29 %</em></span></span><span className="pb-bundle"><ProductVisual /><b>+</b><ProductVisual view={5} /></span><span className="pb-bundle-caption">Ceinture + Pochette + Câble USB + Poche de gel</span><span className="pb-gifts"><Gift /> 4 CADEAUX OFFERTS · 120 € DE VALEUR</span></span></label>
            <label className={`pb-offer pb-single ${offer === "single" ? "is-selected" : ""}`}><input type="radio" name="offer" value="single" checked={offer === "single"} onChange={() => setOffer("single")} /><span className="pb-radio" /><span className="pb-offer-heading"><span><strong>Ceinture seule</strong><small>Le confort essentiel</small></span><span className="pb-offer-price"><strong>89,00 €</strong><del>119,00 €</del></span></span></label>
          </fieldset>
          <button className="pb-add" onClick={handleAddToCart}><ShoppingBag />Ajouter au panier<ArrowRight /></button>
          <div className="pb-payment"><strong><LockKeyhole /> Paiement sécurisé</strong><div className="pb-payment-logos" aria-label="Moyens de paiement"><span className="pb-amex">AMEX</span><span className="pb-apple"> Pay</span><span className="pb-google"><i>G</i> Pay</span><span className="pb-mastercard"><i /><i /></span><span className="pb-paypal">P</span><span className="pb-klarna">Klarna</span><span className="pb-visa">VISA</span></div></div>
          <section className="pb-questions"><h2><Sparkles />Une question sur cette ceinture ?</h2><div className="pb-question-grid">{questions.map(({question, answer}, i) => <div key={question}><button aria-expanded={openQuestion === i} aria-controls={`answer-${i}`} onClick={() => setOpenQuestion(openQuestion === i ? null : i)}><CircleHelp />{question}</button>{openQuestion === i && <p id={`answer-${i}`}>{answer}</p>}</div>)}</div></section>
          <Link className="pb-shipping" href="/livraison"><Truck /><span><strong>Livraison en 5 à 10 jours ouvrés · Livraison offerte</strong><small>Préparée et expédiée sous 48 h, avec un suivi de commande.</small></span></Link>
        </section>
      </div>
      <div className="pb-sticky-cart"><div className="pb-sticky-summary"><ProductVisual /><span><strong>{offer === "duo" ? "Pack Bien-être Complet" : "Ceinture chauffante et massante"}</strong><b>{price.toFixed(2).replace(".", ",")} €</b></span></div><button className="pb-add" onClick={handleAddToCart}>Ajouter au panier<ArrowRight /></button></div>
    </main>
  );
}
