"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useStore } from "@/components/store-provider";

export default function CartPage() {
  const { cart, subtotal, shipping, total, discount, updateQuantity, removeFromCart, setPromoCode, promoCode } = useStore();

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl text-[#493238]">Votre panier</h1>

      {cart.length === 0 ? (
        <div className="mt-8 rounded-[2rem] border border-dashed border-[#493238]/20 bg-[#f5ece9] p-10 text-center">
          <p className="text-xl text-[#493238]">Votre panier est vide pour le moment.</p>
          <Link href="/produit" className="mt-6 inline-flex rounded-full bg-[#b77b8c] px-6 py-3 text-sm font-medium text-white">
            Découvrir la ceinture
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            {cart.map((item) => (
              <div key={item.id} className="flex flex-col gap-4 rounded-[1.75rem] border border-[#493238]/10 bg-[#fffaf8] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-[1.25rem] bg-[radial-gradient(circle_at_top,#f7e7ea_0%,#efdbdd_38%,#e4c1c9_100%)]" />
                  <div>
                    <p className="font-medium text-[#493238]">{item.name}</p>
                    <p className="text-sm text-[#493238]/70">{item.price.toFixed(2)} €</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 rounded-full border border-[#493238]/10 bg-white px-3 py-2">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Diminuer">
                      <Minus className="h-4 w-4 text-[#493238]" />
                    </button>
                    <span className="min-w-5 text-center text-sm font-medium text-[#493238]">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Augmenter">
                      <Plus className="h-4 w-4 text-[#493238]" />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-[#b77b8c]">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <aside className="rounded-[2rem] border border-[#493238]/10 bg-[#f5ece9] p-6">
            <h2 className="text-xl font-semibold text-[#493238]">Récapitulatif</h2>
            <div className="mt-5 space-y-3 text-sm text-[#493238]/75">
              <div className="flex justify-between"><span>Sous-total</span><span>{subtotal.toFixed(2)} €</span></div>
              <div className="flex justify-between"><span>Livraison</span><span>{shipping.toFixed(2)} €</span></div>
              <div className="flex justify-between"><span>Remise</span><span>-{discount.toFixed(2)} €</span></div>
            </div>

            <div className="mt-5 rounded-[1.25rem] bg-white p-3">
              <label className="text-xs uppercase tracking-[0.12em] text-[#493238]/60">Code promo</label>
              <input
                value={promoCode}
                onChange={(event) => setPromoCode(event.target.value)}
                placeholder="PRINCESSBLOOM10"
                className="mt-2 w-full rounded-full border border-[#493238]/10 px-4 py-2 text-sm outline-none focus:border-[#b77b8c]"
              />
            </div>

            <div className="mt-5 border-t border-[#493238]/10 pt-4 text-lg font-semibold text-[#493238] flex justify-between">
              <span>Total</span>
              <span>{total.toFixed(2)} €</span>
            </div>

            <Link href="/livraison" className="mt-6 inline-flex w-full justify-center rounded-full bg-[#b77b8c] px-6 py-3 text-sm font-medium text-white">
              Passer au paiement
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
