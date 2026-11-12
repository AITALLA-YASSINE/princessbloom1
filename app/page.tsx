"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Heart, ShieldCheck, Sparkles, Star, UsersRound, SunMedium, Waves, Flower2, CalendarCheck, LockKeyhole, Truck, RefreshCw } from "lucide-react";
import { ProductArt } from "@/components/product-art";
import { HeroBlossoms } from "@/components/hero-blossoms";
import { product } from "@/lib/site-data";

const heroBenefits = [
  "Chaleur personnalisable",
  "Massage relaxant",
  "Discrétion au quotidien",
];

const marqueeItems = [
  "Paiement sécurisé",
  "Livraison offerte",
  "SAV réactif 7j / 7",
];

const everydaySituations = ["À la maison", "Au bureau", "En déplacement", "Pendant la détente"];

const leftPainPoints = [
  "Les solutions classiques ne s’adaptent pas à votre quotidien.",
  "Le chaud est souvent trop fort ou trop bruyant.",
  "Le confort n’est pas pensé pour être discret sous vos vêtements.",
];

const rightBenefits = [
  "Une ceinture douce, ajustable et pensée pour votre routine.",
  "Une liberté de mouvement avec une chaleur ciblée et des vibrations discrètes.",
  "Un moment de bien-être, sans ralentir votre journée.",
];

const advantageCards = [
  "Discrète sous vos vêtements",
  "Gardez les mains libres",
  "Votre chaleur, votre choix",
  "Au bureau comme à la maison",
  "Une pause bien-être à tout moment",
  "Conçue pour suivre votre quotidien",
];

const faqPreview = [
  { question: "Peut-on l’utiliser chaque jour ?", answer: "Oui, dans le respect des recommandations d’utilisation." },
  { question: "Est-elle discrète sous les vêtements ?", answer: "Oui, elle reste légère et facilement ajustable." },
  { question: "Quel est le délai de livraison ?", answer: "La livraison standard est généralement de 3 à 5 jours." },
];

const productGallery = [
  "/massseur/produit1.png",
  "/massseur/produit2.png",
  "/massseur/produit%203.png",
  "/massseur/produit4.png",
  "/massseur/produit5.png",
];

export default function Home() {
  return (
    <main className="homepage-shell pb-20">
      <div className="hero-decorations pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="blossom-corner blossom-corner-top"><HeroBlossoms /></div>
        <div className="blossom-corner blossom-corner-bottom"><HeroBlossoms /></div>
        <div className="hero-blur hero-blur-left" />
        <div className="hero-blur hero-blur-right" />
        <div className="hero-petal petal-a" />
        <div className="hero-petal petal-b" />
        <div className="hero-petal petal-c" />
        <div className="hero-arc hero-arc-left" />
        <div className="hero-arc hero-arc-right" />
      </div>

      <section className="hero-section relative mx-auto max-w-[1280px] px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-6 inline-flex items-center rounded-full px-2 py-1">
              <Image src="/massseur/logovrai.png" alt="Princess Bloom" width={220} height={58} className="h-10 w-auto object-contain sm:h-12" />
            </div>

            <div className="hero-title-wrap">
              <h1 className="hero-title text-[#493238]">
                <span>Calmer la</span> <span className="hero-highlight italic">douleur</span> <span>de vos règles</span>
              </h1>
              <div className="hero-title-curve" aria-hidden="true">
                <span className="hero-title-heart">
                  <Heart className="h-3.5 w-3.5" strokeWidth={1.5} />
                </span>
              </div>
            </div>

            <p className="mt-5 max-w-xl text-lg leading-8 text-[#493238]/75 sm:text-[1.08rem]">
              Découvrez la ceinture chauffante et massante pensée pour vous accompagner sans rien interrompre.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/produit" className="hero-button-primary inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(100,27,59,0.36)] transition-transform duration-200 hover:-translate-y-0.5">
                Découvrir ma ceinture <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/comment-ca-marche" className="hero-button-secondary inline-flex items-center gap-2 rounded-full border border-[#493238]/15 bg-white/80 px-6 py-3.5 text-sm font-semibold text-[#493238] transition-all duration-200 hover:border-[#d9a65f]/60 hover:text-[#641b3b]">
                Comment ça fonctionne ?
              </Link>
            </div>

            <div className="hero-social-proof">
              <Link href="/avis" className="hero-review-summary" aria-label="Note de 4,9 sur 5, sur 8 600 avis vérifiés">
                <span className="hero-review-stars" aria-hidden="true">
                  {Array.from({ length: 5 }, (_, index) => <Star key={index} />)}
                </span>
                <span><strong>4,9/5</strong> <span className="hero-review-count">(8 600 avis vérifiés)</span></span>
              </Link>
              <span className="hero-social-divider" aria-hidden="true" />
              <span className="hero-community-summary">
                <UsersRound aria-hidden="true" />
                <span><strong>+1 000</strong> femmes soulagées</span>
              </span>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {heroBenefits.map((benefit, index) => (
                <div key={benefit} className="feature-pill rounded-[1.25rem] border border-[#d7b9c0]/80 bg-[#fffaf8]/90 px-4 py-3 text-sm font-medium text-[#493238] shadow-[0_10px_18px_rgba(73,50,56,0.04)]">
                  {index === 0 ? <Waves aria-hidden="true" /> : index === 1 ? <Flower2 aria-hidden="true" /> : <CalendarCheck aria-hidden="true" />}
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="hero-product-panel relative mx-auto w-full max-w-[640px]">
            <div className="product-glow" aria-hidden="true" />
            <div className="product-badge">✨ Votre moment de douceur</div>
            <div className="product-card rounded-[2.1rem] border border-[#fff9f7]/80 bg-[radial-gradient(circle_at_top,#f9e8eb_0%,#f3dfe6_30%,#eed6db_60%,#f6e7ea_100%)] p-3 shadow-[0_30px_60px_rgba(132,92,104,0.18)]">
              <div className="relative overflow-hidden rounded-[1.7rem] bg-[radial-gradient(circle_at_top,#f7e7ea_0%,#efdbdd_38%,#e4c1c9_100%)]">
                <div className="hero-sparkle hero-sparkle-one" aria-hidden="true" />
                <div className="hero-sparkle hero-sparkle-two" aria-hidden="true" />
                <div className="hero-sparkle hero-sparkle-three" aria-hidden="true" />
                <div className="hero-product-image relative h-[470px] w-full sm:h-[540px] md:h-[610px]">
                  <Image src="/massseur/produit1.png" alt="Princess Bloom produit" fill className="object-contain" sizes="(max-width: 1023px) 92vw, 620px" priority />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="hero-services relative mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-full border border-[#493238]/10 bg-white/80 shadow-[0_12px_28px_rgba(73,50,56,0.06)] backdrop-blur-sm">
          <div className="promo-track py-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#493238]/80" aria-label="Informations de service">
            {[...marqueeItems, ...marqueeItems].map((item, index) => (
              <span key={`${item}-${index}`} className="inline-flex items-center gap-3">
                {index % 3 === 0 ? <LockKeyhole aria-hidden="true" /> : index % 3 === 1 ? <Truck aria-hidden="true" /> : <RefreshCw aria-hidden="true" />}
                {item}
                <span className="h-1.5 w-1.5 rounded-full bg-[#b77b8c]" aria-hidden="true" />
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] bg-[#fff9f7] p-8 shadow-[0_20px_40px_rgba(73,50,56,0.05)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#b77b8c]">Pourquoi Princess Bloom ?</p>
            <h2 className="mt-4 text-4xl text-[#493238]">Et si votre confort ne vous obligeait plus à ralentir ?</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#493238]/70">
              Un confort pensé pour votre rythme, votre énergie et votre vie quotidienne.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {everydaySituations.map((item) => (
                <div key={item} className="rounded-[1.2rem] border border-[#493238]/10 bg-[#f5ece9] px-4 py-3 text-sm font-medium text-[#493238]">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-[#493238]/10 bg-[#fffaf8] p-2 shadow-[0_20px_40px_rgba(73,50,56,0.08)]">
            <div className="relative h-full min-h-[320px] overflow-hidden rounded-[1.5rem] bg-[#f8efe9]">
              <Image src="/massseur/produit1.png" alt="Visuel Princess Bloom lifestyle" fill className="object-contain p-4" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#b77b8c]">Confort</p>
          <h2 className="mt-4 text-4xl text-[#493238]">Une solution simple pour un quotidien plus doux</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {productGallery.map((src, index) => (
            <div key={src} className="overflow-hidden rounded-[1.8rem] border border-[#493238]/10 bg-[#fffaf8] p-2 shadow-[0_20px_40px_rgba(73,50,56,0.08)]">
              <div className="relative h-[280px] overflow-hidden rounded-[1.3rem] bg-[#f8efe9]">
                <Image src={src} alt={`Produit Princess Bloom ${index + 1}`} fill className="object-contain p-3" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 rounded-[2rem] bg-[#f5ece9] p-8 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#b77b8c]">Comparatif</p>
            <h3 className="mt-4 text-3xl text-[#493238]">Les solutions classiques ont leurs limites</h3>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-[#493238]/70">
              {leftPainPoints.map((item) => (
                <li key={item} className="flex gap-3"><span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#b77b8c]" />{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#b77b8c]">Princess Bloom</p>
            <h3 className="mt-4 text-3xl text-[#493238]">La liberté Princess Bloom</h3>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-[#493238]/70">
              {rightBenefits.map((item) => (
                <li key={item} className="flex gap-3"><span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#493238]" />{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#b77b8c]">Fonctionnement</p>
          <h2 className="mt-4 text-4xl text-[#493238]">Tout est pensé pour votre confort</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {product.features.map((feature) => (
            <div key={feature} className="rounded-[1.5rem] border border-[#493238]/10 bg-[#fffaf8] p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f3dfe2] text-[#493238]">
                {feature.includes("température") ? <SunMedium className="h-5 w-5" /> : feature.includes("vibration") ? <Sparkles className="h-5 w-5" /> : feature.includes("Minuteur") ? <Flame className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
              </div>
              <p className="text-sm font-medium text-[#493238]">{feature}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-[2.2rem] bg-[linear-gradient(135deg,#f8ecea_0%,#f3dfe2_100%)] p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#b77b8c]">Offre</p>
            <h2 className="mt-4 text-4xl text-[#493238]">Princess Bloom — un confort discret, à chaque journée.</h2>
            <div className="mt-5 flex items-center gap-3 text-[#493238]">
              <span className="text-4xl font-semibold">89,00 €</span>
              <span className="text-lg text-[#493238]/40 line-through">119,00 €</span>
            </div>
            <ul className="mt-6 space-y-2 text-sm leading-7 text-[#493238]/75">
              <li>• Ceinture chauffante et massante</li>
              <li>• Accessoire de confort inclus</li>
              <li>• Livraison standard offerte dès 60 €</li>
            </ul>
          </div>
          <div className="rounded-[1.75rem] bg-white p-6 shadow-[0_20px_35px_rgba(73,50,56,0.08)]">
            <ProductArt className="mx-auto max-w-[260px]" />
            <Link href="/produit" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#493238] px-6 py-3 text-sm font-medium text-white">
              Ajouter au panier <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
