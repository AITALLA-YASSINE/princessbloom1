import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[#493238]/10 bg-[#f5ece9]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center justify-start">
            <Image src="/massseur/logovrai.png" alt="Princess Bloom" width={220} height={60} className="h-12 w-auto object-contain" />
          </div>
          <p className="mt-4 text-sm leading-7 text-[#493238]/70">
            Votre douceur, votre liberté.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#493238]">Navigation</h3>
          <ul className="mt-4 space-y-2 text-sm text-[#493238]/70">
            <li><Link href="/produit">Produit</Link></li>
            <li><Link href="/comment-ca-marche">Comment ça fonctionne</Link></li>
            <li><Link href="/histoire">Notre histoire</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#493238]">Aide</h3>
          <ul className="mt-4 space-y-2 text-sm text-[#493238]/70">
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/suivi">Suivi de commande</Link></li>
            <li><Link href="/livraison">Livraison</Link></li>
            <li><Link href="/avis">Avis clients</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#493238]">Légal</h3>
          <ul className="mt-4 space-y-2 text-sm text-[#493238]/70">
            <li><Link href="/mentions-legales">Mentions légales</Link></li>
            <li><Link href="/conditions-generales">CGV</Link></li>
            <li><Link href="/confidentialite">Confidentialité</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
