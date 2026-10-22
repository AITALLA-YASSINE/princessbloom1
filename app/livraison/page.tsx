"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { shippingMethods } from "@/lib/site-data";
import { useStore } from "@/components/store-provider";

export default function DeliveryPage() {
  const router = useRouter();
  const { subtotal, shipping, setOrderData, total, cart } = useStore();
  const [selectedShipping, setSelectedShipping] = useState(shippingMethods[0].id);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (form: FormData) => {
    const nextErrors: Record<string, string> = {};
    const required = ["firstName", "lastName", "email", "address", "postalCode", "city", "country"];
    required.forEach((field) => {
      const value = String(form.get(field) ?? "").trim();
      if (!value) nextErrors[field] = "Ce champ est requis.";
    });

    if (form.get("email") && !String(form.get("email")).includes("@")) {
      nextErrors.email = "L’email est invalide.";
    }

    return nextErrors;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: Record<string, string> = {};
    for (const [key, value] of form.entries()) {
      payload[String(key)] = String(value);
    }
    payload.shippingMethod = selectedShipping;

    setOrderData(payload);
    router.push("/paiement");
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-[2rem] border border-[#493238]/10 bg-[#fffaf8] p-6">
            <h2 className="text-2xl text-[#493238]">Informations de livraison</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {[
                ["firstName", "Prénom"],
                ["lastName", "Nom"],
                ["email", "Email"],
                ["phone", "Téléphone"],
              ].map(([name, label]) => (
                <label key={name} className="text-sm text-[#493238]">
                  {label}
                  <input name={name} className="mt-2 w-full rounded-full border border-[#493238]/10 bg-white px-4 py-3 outline-none focus:border-[#b77b8c]" />
                  {errors[name] && <span className="mt-1 block text-xs text-red-500">{errors[name]}</span>}
                </label>
              ))}

              <label className="text-sm text-[#493238] md:col-span-2">
                Adresse
                <input name="address" className="mt-2 w-full rounded-full border border-[#493238]/10 bg-white px-4 py-3 outline-none focus:border-[#b77b8c]" />
                {errors.address && <span className="mt-1 block text-xs text-red-500">{errors.address}</span>}
              </label>

              <label className="text-sm text-[#493238] md:col-span-2">
                Complément d’adresse
                <input name="address2" className="mt-2 w-full rounded-full border border-[#493238]/10 bg-white px-4 py-3 outline-none focus:border-[#b77b8c]" />
              </label>

              <label className="text-sm text-[#493238]">
                Code postal
                <input name="postalCode" className="mt-2 w-full rounded-full border border-[#493238]/10 bg-white px-4 py-3 outline-none focus:border-[#b77b8c]" />
                {errors.postalCode && <span className="mt-1 block text-xs text-red-500">{errors.postalCode}</span>}
              </label>

              <label className="text-sm text-[#493238]">
                Ville
                <input name="city" className="mt-2 w-full rounded-full border border-[#493238]/10 bg-white px-4 py-3 outline-none focus:border-[#b77b8c]" />
                {errors.city && <span className="mt-1 block text-xs text-red-500">{errors.city}</span>}
              </label>

              <label className="text-sm text-[#493238] md:col-span-2">
                Pays
                <input name="country" defaultValue="France" className="mt-2 w-full rounded-full border border-[#493238]/10 bg-white px-4 py-3 outline-none focus:border-[#b77b8c]" />
                {errors.country && <span className="mt-1 block text-xs text-red-500">{errors.country}</span>}
              </label>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#493238]/10 bg-[#fffaf8] p-6">
            <h2 className="text-2xl text-[#493238]">Méthode de livraison</h2>
            <div className="mt-5 space-y-3">
              {shippingMethods.map((method) => (
                <label key={method.id} className="flex cursor-pointer items-center justify-between rounded-[1.25rem] border border-[#493238]/10 bg-white p-4">
                  <span className="flex items-center gap-3">
                    <input type="radio" name="shippingMethod" checked={selectedShipping === method.id} onChange={() => setSelectedShipping(method.id)} />
                    <span>
                      <span className="block font-medium text-[#493238]">{method.label}</span>
                      <span className="block text-xs text-[#493238]/60">{method.eta}</span>
                    </span>
                  </span>
                  <span className="text-sm font-medium text-[#493238]">{method.price.toFixed(2)} €</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="rounded-full bg-[#b77b8c] px-6 py-3 text-sm font-medium text-white shadow-[0_18px_30px_rgba(183,123,140,0.35)]">
            Continuer vers le paiement
          </button>
        </form>

        <aside className="rounded-[2rem] border border-[#493238]/10 bg-[#f5ece9] p-6">
          <h2 className="text-2xl text-[#493238]">Récapitulatif</h2>
          <div className="mt-5 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm text-[#493238]/75">
                <span>{item.name} × {item.quantity}</span>
                <span>{(item.price * item.quantity).toFixed(2)} €</span>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-2 border-t border-[#493238]/10 pt-4 text-sm text-[#493238]/75">
            <div className="flex justify-between"><span>Sous-total</span><span>{subtotal.toFixed(2)} €</span></div>
            <div className="flex justify-between"><span>Livraison</span><span>{shipping.toFixed(2)} €</span></div>
            <div className="mt-3 flex justify-between text-lg font-semibold text-[#493238]"><span>Total</span><span>{total.toFixed(2)} €</span></div>
          </div>
        </aside>
      </div>
    </main>
  );
}
