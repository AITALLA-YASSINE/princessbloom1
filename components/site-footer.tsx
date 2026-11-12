import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[#641b3b]/10 bg-[rgba(245,236,233,0.92)] shadow-[inset_0_1px_0_rgba(100,27,59,0.04)]">
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
            <li><Link href="/produit" className="transition hover:text-[#641b3b]">Produit</Link></li>
            <li><Link href="/comment-ca-marche" className="transition hover:text-[#641b3b]">Comment ça fonctionne</Link></li>
            <li><Link href="/histoire" className="transition hover:text-[#641b3b]">Notre histoire</Link></li>
            <li><Link href="/faq" className="transition hover:text-[#641b3b]">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#493238]">Aide</h3>
          <ul className="mt-4 space-y-2 text-sm text-[#493238]/70">
            <li><Link href="/contact" className="transition hover:text-[#641b3b]">Contact</Link></li>
            <li><Link href="/suivi" className="transition hover:text-[#641b3b]">Suivi de commande</Link></li>
            <li><Link href="/livraison" className="transition hover:text-[#641b3b]">Livraison</Link></li>
            <li><Link href="/avis" className="transition hover:text-[#641b3b]">Avis clients</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#493238]">Légal</h3>
          <ul className="mt-4 space-y-2 text-sm text-[#493238]/70">
            <li><Link href="/mentions-legales" className="transition hover:text-[#641b3b]">Mentions légales</Link></li>
            <li><Link href="/conditions-generales" className="transition hover:text-[#641b3b]">CGV</Link></li>
            <li><Link href="/confidentialite" className="transition hover:text-[#641b3b]">Confidentialité</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
