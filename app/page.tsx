"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Heart, ShieldCheck, Sparkles, Star, SunMedium } from "lucide-react";
import { ProductArt } from "@/components/product-art";
import { testimonials } from "@/lib/site-data";
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
    <main className="pb-20">
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-5 inline-flex items-center rounded-full px-2 py-1">
              <Image src="/massseur/logovrai.png" alt="Princess Bloom" width={220} height={58} className="h-10 w-auto object-contain sm:h-12" />
            </div>
            <h1 className="text-5xl leading-[0.95] text-[#493238] sm:text-6xl">
              Votre confort, sans compromis. <br />
              Votre vie continue.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#493238]/75">
              Découvrez la ceinture chauffante et massante pensée pour vous accompagner sans rien interrompre.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/produit" className="inline-flex items-center gap-2 rounded-full bg-[#b77b8c] px-6 py-3.5 text-sm font-medium text-white shadow-[0_18px_30px_rgba(183,123,140,0.35)] transition hover:bg-[#a8647c]">
                Découvrir ma ceinture <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/comment-ca-marche" className="inline-flex items-center gap-2 rounded-full border border-[#493238]/15 bg-white px-6 py-3.5 text-sm font-medium text-[#493238] transition hover:border-[#b77b8c]/40 hover:text-[#b77b8c]">
                Comment ça fonctionne ?
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {heroBenefits.map((benefit) => (
                <div key={benefit} className="rounded-[1.25rem] border border-[#493238]/10 bg-[#fffaf8] px-4 py-3 text-sm font-medium text-[#493238] shadow-sm">
                  {benefit}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="rounded-[2rem] border border-[#493238]/10 bg-[#f9efe9] p-3 shadow-[0_25px_60px_rgba(73,50,56,0.08)]">
            <div className="relative overflow-hidden rounded-[1.7rem] bg-[radial-gradient(circle_at_top,#f7e7ea_0%,#efdbdd_38%,#e4c1c9_100%)]">
              <div className="relative h-[630px] w-full">
                <Image src="/massseur/produit1.png" alt="Princess Bloom produit" fill className="object-contain p-8" priority />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-full border border-[#493238]/10 bg-white/80 shadow-[0_12px_28px_rgba(73,50,56,0.06)] backdrop-blur-sm">
          <div className="promo-track py-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#493238]/80" aria-label="Informations de service">
            {[...marqueeItems, ...marqueeItems].map((item, index) => (
              <span key={`${item}-${index}`} className="inline-flex items-center gap-3">
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
