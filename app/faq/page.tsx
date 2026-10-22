import { faqs } from "@/lib/site-data";

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#b77b8c]">FAQ</p>
        <h1 className="mt-4 text-4xl font-semibold text-[#493238]">Tout ce que vous devez savoir</h1>
      </div>

      <div className="space-y-8">
        {faqs.map((section) => (
          <div key={section.category} className="rounded-[2rem] border border-[#493238]/10 bg-[#fffaf8] p-6">
            <h2 className="text-2xl text-[#493238]">{section.category}</h2>
            <div className="mt-5 space-y-4">
              {section.items.map((item) => (
                <details key={item.question} className="rounded-[1.25rem] border border-[#493238]/10 bg-white p-4 open:bg-[#f9efe9]">
                  <summary className="cursor-pointer list-none text-base font-medium text-[#493238]">{item.question}</summary>
                  <p className="mt-3 text-sm leading-7 text-[#493238]/70">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
