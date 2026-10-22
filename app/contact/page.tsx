"use client";

import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] bg-[#f5ece9] p-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#b77b8c]">Contact</p>
          <h1 className="mt-4 text-4xl text-[#493238]">Une équipe à votre écoute</h1>
          <p className="mt-4 text-sm leading-7 text-[#493238]/75">
            Support : contact@krypttech.com <br />
            Réponse habituellement sous 24 à 48h.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[2rem] border border-[#493238]/10 bg-[#fffaf8] p-8">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="text-sm text-[#493238]">
              Prénom
              <input required className="mt-2 w-full rounded-full border border-[#493238]/10 bg-white px-4 py-3 outline-none focus:border-[#b77b8c]" placeholder="Votre prénom" />
            </label>
            <label className="text-sm text-[#493238]">
              Nom
              <input required className="mt-2 w-full rounded-full border border-[#493238]/10 bg-white px-4 py-3 outline-none focus:border-[#b77b8c]" placeholder="Votre nom" />
            </label>
            <label className="text-sm text-[#493238] md:col-span-2">
              Email
              <input type="email" required className="mt-2 w-full rounded-full border border-[#493238]/10 bg-white px-4 py-3 outline-none focus:border-[#b77b8c]" placeholder="vous@example.com" />
            </label>
            <label className="text-sm text-[#493238] md:col-span-2">
              Message
              <textarea required rows={5} className="mt-2 w-full rounded-[1.5rem] border border-[#493238]/10 bg-white px-4 py-3 outline-none focus:border-[#b77b8c]" placeholder="Décrivez votre demande" />
            </label>
          </div>

          <button type="submit" className="mt-6 inline-flex rounded-full bg-[#b77b8c] px-6 py-3 text-sm font-medium text-white shadow-[0_18px_30px_rgba(183,123,140,0.35)]">
            Envoyer ma demande
          </button>

          {submitted && (
            <p className="mt-4 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
              Votre message a bien été envoyé. Notre équipe vous répondra dans les meilleurs délais.
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
