"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Menu } from "lucide-react";
import { useStore } from "@/components/store-provider";

const navItems = [
  { href: "/", label: "Accueil" },
  { href: "/produit", label: "Produit" },
  { href: "/comment-ca-marche", label: "Comment ça fonctionne" },
  { href: "/histoire", label: "Notre histoire" },
  { href: "/avis", label: "Avis" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const { itemCount } = useStore();

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(73,50,56,0.1)] bg-[rgba(249,240,236,0.92)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center justify-center">
            <Image src="/massseur/logovrai.png" alt="Princess Bloom" width={210} height={58} className="h-10 w-auto object-contain md:h-12" priority />
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-[#493238]/80 md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-[#b77b8c]">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button className="md:hidden" aria-label="Menu">
            <Menu className="h-5 w-5 text-[#493238]" />
          </button>
          <Link
            href="/panier"
            className="inline-flex items-center gap-2 rounded-full border border-[#493238]/15 bg-white px-4 py-2 text-sm font-medium text-[#493238] shadow-sm transition hover:border-[#b77b8c]/40 hover:text-[#b77b8c]"
          >
            <ShoppingBag className="h-4 w-4" />
            Panier
            <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-[#b77b8c] px-1.5 text-xs text-white">
              {itemCount}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
