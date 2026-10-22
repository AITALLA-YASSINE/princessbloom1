import Link from "next/link";
import { ArrowRight, Flame, Sparkles, TimerReset, Wind } from "lucide-react";
import { ProductArt } from "@/components/product-art";

const steps = [
  { icon: Flame, title: "Chaleur ciblée", text: "Choisissez le niveau de chaleur qui correspond à votre confort." },
  { icon: Wind, title: "Massage doux", text: "4 modes de vibration pour soulager les tensions et la fatigue." },
  { icon: TimerReset, title: "Minuteur pratique", text: "Programmez 15 ou 30 minutes selon votre rythme." },
  { icon: Sparkles, title: "Sangle ajustable", text: "La forme ovale s’adapte à votre morphologie et reste discrète sous vos vêtements." },
];

export default function HowItWorksPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#b77b8c]">Comment ça fonctionne</p>
        <h1 className="mt-4 text-4xl font-semibold text-[#493238]">Une routine de confort pensée pour votre quotidien</h1>
      </div>

      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <ProductArt />
        <div className="space-y-5">
          {steps.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-[1.75rem] border border-[#493238]/10 bg-[#fffaf8] p-5">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-[#f3dfe2] p-3 text-[#493238]">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#493238]">{title}</h2>
                  <p className="mt-2 text-sm leading-7 text-[#493238]/70">{text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 rounded-[2rem] bg-[#f5ece9] p-8 text-center">
        <h2 className="text-3xl text-[#493238]">Un moment de douceur, à votre rythme</h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#493238]/75">
          Les réglages simples et la ceinture ajustable vous permettent de personnaliser votre confort sans perturber votre journée.
        </p>
        <Link href="/produit" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#b77b8c] px-6 py-3 text-sm font-medium text-white">
          Découvrir la ceinture <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}
