"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight, Check, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useStore } from "@/components/store-provider";

const euros = (value: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);

export function CartDrawer() {
  const { cart, subtotal, cartDrawerOpen, closeCartDrawer, updateQuantity, removeFromCart } = useStore();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!cartDrawerOpen) {
      dialog.close();
      return;
    }
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, [cartDrawerOpen]);

  return (
    <dialog ref={dialogRef} className="cart-drawer" aria-labelledby="cart-drawer-title" onCancel={closeCartDrawer} onClick={event => { if (event.target === event.currentTarget) { const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeCartDrawer(); } }}>
      <div className="cart-drawer-content">
        <button type="button" className="cart-drawer-close" aria-label="Fermer le panier" onClick={closeCartDrawer} autoFocus><X /></button>
        <Image src="/massseur/cherry-blossoms.png" alt="" width={170} height={170} className="cart-drawer-flowers cart-drawer-flowers-top" aria-hidden="true" />
        <h2 id="cart-drawer-title"><ShoppingBag />Mon panier</h2>
        {cart.length > 0 ? <>
          <div className="cart-drawer-success" role="status"><span><Check /></span>Produit ajouté à votre panier !</div>
          <div className="cart-drawer-items">
            {cart.map(item => <article key={item.id} className="cart-drawer-item">
              <div className="cart-drawer-image"><Image src={item.image ?? "/massseur/produit1.png"} alt={item.name} fill sizes="112px" className="object-cover" /></div>
              <div className="cart-drawer-item-info"><h3>{item.id.endsWith("-pack") ? "Pack Bien-être Complet Princess Bloom" : "Ceinture chauffante et massante Princess Bloom"}</h3><p>{euros(item.price)}</p>
                <div className="cart-drawer-item-actions"><div className="cart-drawer-quantity"><button type="button" aria-label={`Diminuer la quantité de ${item.name}`} onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus /></button><span aria-label="Quantité" aria-live="polite">{item.quantity}</span><button type="button" aria-label={`Augmenter la quantité de ${item.name}`} onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus /></button></div><button type="button" className="cart-drawer-remove" aria-label={`Supprimer ${item.name}`} onClick={() => removeFromCart(item.id)}><Trash2 /></button></div>
              </div>
            </article>)}
          </div>
          <div className="cart-drawer-subtotal"><span>Sous-total</span><strong aria-live="polite">{euros(subtotal)}</strong></div>
          <Link href="/paiement" className="cart-drawer-checkout" onClick={closeCartDrawer}><ShoppingBag />Passer au paiement<ArrowRight /></Link>
        </> : <div className="cart-drawer-empty"><ShoppingBag /><p>Votre panier est vide.</p><span>Un peu de douceur vous attend.</span></div>}
        <button type="button" className="cart-drawer-continue" onClick={closeCartDrawer}>Continuer mes achats</button>
        <div className="cart-drawer-decoration" aria-hidden="true"><Image src="/massseur/cherry-blossoms.png" alt="" width={280} height={280} className="cart-drawer-flowers cart-drawer-flowers-bottom" /></div>
      </div>
    </dialog>
  );
}
