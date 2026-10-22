import { Star } from "lucide-react";
import { testimonials } from "@/lib/site-data";

export default function ReviewsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#b77b8c]">Avis clients</p>
        <h1 className="mt-4 text-4xl font-semibold text-[#493238]">Des avis authentiques, sans artifices</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((review) => (
          <article key={review.name} className="rounded-[1.75rem] border border-[#493238]/10 bg-[#fffaf8] p-6">
            <div className="flex items-center gap-1 text-[#d4a026]">
              {Array.from({ length: review.rating }).map((_, index) => (
                <Star key={index} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-4 text-sm leading-7 text-[#493238]/75">“{review.quote}”</p>
            <div className="mt-6 border-t border-[#493238]/10 pt-4">
              <p className="font-semibold text-[#493238]">{review.name}</p>
              <p className="text-sm text-[#493238]/60">{review.title}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-16 rounded-[2rem] border border-dashed border-[#493238]/20 bg-[#f5ece9] p-8 text-center">
        <h2 className="text-2xl text-[#493238]">Aucun avis authentique pour le moment</h2>
        <p className="mt-3 text-sm text-[#493238]/70">
          Les avis seront affichés ici après validation de leur authenticité et de leur conformité.
        </p>
      </div>
    </main>
  );
}
