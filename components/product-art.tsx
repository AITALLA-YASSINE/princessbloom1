import Image from "next/image";

export function ProductArt({ className = "" }: { className?: string }) {
  return (
    <div className={`relative mx-auto aspect-[4/5] w-full max-w-[420px] overflow-hidden rounded-[2.2rem] bg-[radial-gradient(circle_at_top,#f7e7ea_0%,#efdbdd_38%,#e4c1c9_100%)] shadow-[0_32px_90px_rgba(73,50,56,0.18)] ${className}`}>
      <Image
        src="/massseur/produit1.png"
        alt="Princess Bloom produit principal"
        fill
        priority
        className="object-contain p-3 md:p-5"
      />
    </div>
  );
}
