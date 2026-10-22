"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { Heart, ShieldCheck, Star, Truck, ChevronRight, ChevronLeft } from "lucide-react";
import { useStore } from "@/components/store-provider";
import { product } from "@/lib/site-data";

const galleryImages = [
  "/massseur/produit1.png",
  "/massseur/produit2.png",
  "/massseur/produit%203.png",
  "/massseur/produit4.png",
  "/massseur/produit5.png",
];

export default function ProductPage() {
  const { addToCart } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const showPreviousImage = () => {
    setActiveImage((current) => (current === 0 ? galleryImages.length - 1 : current - 1));
  };

  const showNextImage = () => {
    setActiveImage((current) => (current === galleryImages.length - 1 ? 0 : current + 1));
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
    });
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-2 text-sm text-[#493238]/60">
        <Link href="/">Accueil</Link>
        <ChevronRight className="h-4 w-4" />
        <span>Produit</span>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div className="relative overflow-hidden rounded-[2rem] border border-[#493238]/10 bg-[#f7ecea] p-2 shadow-[0_25px_60px_rgba(73,50,56,0.08)]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-[radial-gradient(circle_at_top,#f7e7ea_0%,#efdbdd_38%,#e4c1c9_100%)]">
              <Image src={galleryImages[activeImage]} alt="Vue produit Princess Bloom" fill className="object-contain p-6" priority />
            </div>

            <button
              onClick={showPreviousImage}
              aria-label="Image précédente"
              className="absolute left-5 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#493238]/10 bg-white/90 text-[#493238] shadow-md transition hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              onClick={showNextImage}
              aria-label="Image suivante"
              className="absolute right-5 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#493238]/10 bg-white/90 text-[#493238] shadow-md transition hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
            {galleryImages.map((src, index) => (
              <button
                key={src}
                type="button"
                onClick={() => setActiveImage(index)}
                className={`overflow-hidden rounded-[1rem] border p-1 transition ${activeImage === index ? "border-[#b77b8c] ring-2 ring-[#f1dbe0]" : "border-[#493238]/10"}`}
                aria-label={`Afficher l’image ${index + 1}`}
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-[0.8rem] bg-[radial-gradient(circle_at_top,#f7e7ea_0%,#efdbdd_38%,#e4c1c9_100%)]">
                  <Image src={src} alt={`Vue produit ${index + 1}`} fill className="object-contain p-1" />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#b77b8c]">Princess Bloom</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight text-[#493238]">Ceinture chauffante & massante menstruelle</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-[#d4a026]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <span className="text-sm text-[#493238]/70">4,9/5 • +200 avis</span>
          </div>

          <div className="flex items-end gap-3">
            <span className="text-4xl font-semibold text-[#493238]">89,00 €</span>
            <span className="text-lg text-[#493238]/40 line-through">119,00 €</span>
          </div>

          <div className="rounded-[1.75rem] border border-[#493238]/10 bg-[#fffaf8] p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#493238]/70">Quantité</span>
              <div className="flex items-center gap-3 rounded-full border border-[#493238]/10 bg-white px-3 py-2">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="text-xl text-[#493238]">−</button>
                <span className="min-w-6 text-center text-sm font-medium text-[#493238]">{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)} className="text-xl text-[#493238]">+</button>
              </div>
            </div>

            <button onClick={handleAddToCart} className="mt-5 w-full rounded-full bg-[#b77b8c] px-5 py-4 text-base font-semibold text-white shadow-[0_18px_30px_rgba(183,123,140,0.35)] transition hover:bg-[#a8647c]">
              Ajouter au panier
            </button>

            <div className="mt-4 flex items-center justify-between rounded-full bg-[#f4e5e8] px-3 py-2 text-xs font-medium text-[#493238]">
              <span>Livraison sous 48h</span>
              <span>paiement sécurisé</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.4rem] border border-[#493238]/10 bg-[#f9efe9] p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-[#b77b8c]">Confiance</p>
              <p className="mt-2 text-sm font-semibold text-[#493238]">2 400+ clientes satisfaites</p>
            </div>
            <div className="rounded-[1.4rem] border border-[#493238]/10 bg-[#f9efe9] p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-[#b77b8c]">Risque zéro</p>
              <p className="mt-2 text-sm font-semibold text-[#493238]">Retour 30 jours garanti</p>
            </div>
            <div className="rounded-[1.4rem] border border-[#493238]/10 bg-[#f9efe9] p-4 sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.15em] text-[#b77b8c]">Un achat rapide</p>
              <p className="mt-2 text-sm font-semibold text-[#493238]">Commande en moins de 2 minutes • 1 clic pour passer au paiement</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-[#493238]/10 bg-[#f9efe9] p-4">
              <Truck className="h-5 w-5 text-[#b77b8c]" />
              <p className="mt-3 text-sm font-medium text-[#493238]">Livraison en 3-5 jours</p>
            </div>
            <div className="rounded-[1.5rem] border border-[#493238]/10 bg-[#f9efe9] p-4">
              <ShieldCheck className="h-5 w-5 text-[#b77b8c]" />
              <p className="mt-3 text-sm font-medium text-[#493238]">Garantie 2 ans</p>
            </div>
            <div className="rounded-[1.5rem] border border-[#493238]/10 bg-[#f9efe9] p-4">
              <Heart className="h-5 w-5 text-[#b77b8c]" />
              <p className="mt-3 text-sm font-medium text-[#493238]">Retour 30 jours</p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-[#493238]/10 bg-[#fffaf8] p-6">
            <h2 className="text-lg font-semibold text-[#493238]">Ce que comprend l’offre</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#493238]/75">
              {product.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#b77b8c]" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
