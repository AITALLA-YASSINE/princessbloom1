"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Menu, X } from "lucide-react";
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
  // Cached pages remain in the DOM; checkout visibility must follow the active URL.
  const isCheckout = pathname === "/paiement" || pathname === "/livraison";
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="pb-header" data-checkout={isCheckout ? "true" : undefined} onKeyDown={event => { if (event.key === "Escape") setMenuOpen(false); }}>
      <div className="pb-header-inner">
        <button type="button" className="pb-menu-toggle" aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={menuOpen} aria-controls="site-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        <Link href="/" className="pb-wordmark" aria-label="Princess Bloom, accueil" onClick={() => setMenuOpen(false)}><Image src="/massseur/logovrai.png" alt="Princess Bloom" width={1928} height={815} className="h-10 w-auto object-contain md:h-12" preload /></Link>
        <div className="pb-header-actions"><Link href="/panier" aria-label={`Panier, ${itemCount} article(s)`} onClick={() => setMenuOpen(false)}><ShoppingBag />{itemCount > 0 && <span className="pb-cart-count">{itemCount}</span>}</Link></div>
      </div>
      {menuOpen && <nav id="site-navigation" className="pb-mobile-nav" aria-label="Navigation principale">{navItems.map(item => <Link href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>{item.label}</Link>)}</nav>}
    </header>
  );
}
