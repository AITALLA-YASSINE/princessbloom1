import { HeartHandshake, Sparkles, ShieldCheck } from "lucide-react";

const values = [
  { icon: HeartHandshake, title: "Confort au quotidien", text: "Nous concevons des solutions pensées pour accompagner les femmes dans les moments les plus exigeants de leur routine." },
  { icon: Sparkles, title: "Design discret", text: "Tout est pensé pour se fondre dans le quotidien avec élégance et simplicité." },
  { icon: ShieldCheck, title: "Transparence", text: "Nous favorisons une expérience claire, juste et rassurante, sans promesses excessives." },
];

export default function StoryPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] bg-[linear-gradient(135deg,#f8ecea_0%,#f3dfe2_100%)] p-8 lg:p-12">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#b77b8c]">Notre histoire</p>
        <h1 className="mt-4 text-4xl text-[#493238]">Une marque pensée pour garder votre douceur, même dans les jours les plus chargés.</h1>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {values.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-[1.75rem] border border-[#493238]/10 bg-[#fffaf8] p-6">
            <div className="mb-4 inline-flex rounded-full bg-[#f3dfe2] p-3 text-[#493238]">
              <Icon className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-[#493238]">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-[#493238]/70">{text}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 grid gap-8 lg:grid-cols-2">
        <div className="rounded-[2rem] bg-[#f5ece9] p-8">
          <h2 className="text-2xl text-[#493238]">Mission</h2>
          <p className="mt-4 text-sm leading-7 text-[#493238]/75">
            Princess Bloom accompagne les femmes avec un produit pensé pour offrir une sensation de confort immédiat, un moment de pause et une solution discrète dans le quotidien.
          </p>
        </div>
        <div className="rounded-[2rem] bg-[#f5ece9] p-8">
          <h2 className="text-2xl text-[#493238]">Philosophie</h2>
          <p className="mt-4 text-sm leading-7 text-[#493238]/75">
            Nous privilégions l’élégance, la simplicité et l’accessibilité premium, sans sur-promettre ni faire de fausses promesses médicales.
          </p>
        </div>
      </div>
    </main>
  );
}
