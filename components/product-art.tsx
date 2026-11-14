import Image from "next/image";

export function ProductArt({ className = "" }: { className?: string }) {
  return (
    <div className={`relative mx-auto aspect-square w-full max-w-[420px] overflow-hidden rounded-[2.2rem] ${className}`}>
      <Image
        src="/photos/product-hero-square.webp"
        alt="Princess Bloom produit principal"
        fill
        sizes="(min-width: 1024px) 420px, 90vw"
        priority
        className="object-contain"
      />
    </div>
  );
}
