"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, Search, X } from "lucide-react";
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
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname === "/produit") return (
    <header className="pb-header">
      <div className="pb-header-inner">
        <button aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        <Link href="/" className="pb-wordmark" aria-label="Princess Bloom, accueil"><span>PRINCESS</span><span>BLOOM</span></Link>
        <div className="pb-header-actions"><Link href="/faq" aria-label="Rechercher une r?ponse"><Search /></Link><Link href="/panier" aria-label={`Panier, ${itemCount} article(s)`}><ShoppingBag />{itemCount > 0 && <span className="pb-cart-count">{itemCount}</span>}</Link></div>
      </div>
      {menuOpen && <nav className="pb-mobile-nav" aria-label="Navigation principale">{navItems.map(item => <Link href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>{item.label}</Link>)}</nav>}
    </header>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(100,27,59,0.08)] bg-[rgba(249,239,237,0.9)] backdrop-blur-xl shadow-[0_8px_26px_rgba(120,82,92,0.06)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center justify-center">
            <Image src="/massseur/logovrai.png" alt="Princess Bloom" width={210} height={58} className="h-10 w-auto object-contain md:h-12" priority />
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-[#493238]/80 md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="transition-colors duration-200 hover:text-[#641b3b]">
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
            className="inline-flex items-center gap-2 rounded-full border border-[#641b3b]/15 bg-[#fffaf8] px-4 py-2 text-sm font-medium text-[#493238] shadow-[0_10px_18px_rgba(100,27,59,0.06)] transition-all duration-200 hover:border-[#d9a65f]/60 hover:shadow-[0_12px_22px_rgba(100,27,59,0.1)]"
          >
            <ShoppingBag className="h-4 w-4" />
            Panier
            <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-[#641b3b] px-1.5 text-xs text-white shadow-[0_6px_14px_rgba(100,27,59,0.25)]">
              {itemCount}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
