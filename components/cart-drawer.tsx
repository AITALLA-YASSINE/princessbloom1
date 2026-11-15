"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight, Check, LockKeyhole, Minus, Plus, ShoppingBag, Tag, Trash2, Truck, X } from "lucide-react";
import { useStore } from "@/components/store-provider";
import { CHECKOUT_CATALOG } from "@/lib/checkout";
import "./cart-drawer.css";

const euros = (value: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);

export function CartDrawer() {
  const { cart, subtotal, total, discount, shipping, itemCount, cartDrawerOpen, closeCartDrawer, updateQuantity, removeFromCart } = useStore();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const oldSubtotal = cart.reduce((sum, item) => sum + (CHECKOUT_CATALOG[item.id as keyof typeof CHECKOUT_CATALOG]?.oldPrice ?? Math.round(item.price * 100)) * item.quantity, 0) / 100;
  const savings = Math.max(0, Math.round((oldSubtotal - subtotal) * 100) / 100);

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
    <dialog ref={dialogRef} className="cart-drawer cart-drawer-sliding" aria-labelledby="cart-drawer-title" onCancel={event => { event.preventDefault(); closeCartDrawer(); }} onClick={event => { if (event.target === event.currentTarget) { const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeCartDrawer(); } }}>
      <div className="cart-drawer-content">
        <header className="cart-drawer-heading"><h2 id="cart-drawer-title">Votre panier <span className="cart-drawer-count" aria-label={`${itemCount} article${itemCount > 1 ? "s" : ""}`} aria-live="polite">{itemCount}</span></h2><button type="button" className="cart-drawer-close" aria-label="Fermer le panier" onClick={closeCartDrawer} autoFocus><X /></button></header>
        <div className="cart-drawer-body">
          {cart.length > 0 ? <>
            <div className="cart-drawer-shipping"><p><Truck />{shipping === 0 ? "La livraison est offerte pour votre commande !" : "Votre livraison est calculée dans le récapitulatif."}</p>{shipping === 0 && <div className="cart-drawer-shipping-bar" aria-hidden="true"><span /></div>}</div>
            <div className="cart-drawer-success" role="status"><Check />Produit ajouté à votre panier</div>
            <div className="cart-drawer-items">
              {cart.map(item => {
                const reference = CHECKOUT_CATALOG[item.id as keyof typeof CHECKOUT_CATALOG];
                const oldPrice = reference ? reference.oldPrice / 100 : item.price;
                return <article key={item.id} className="cart-drawer-item">
                  <div className="cart-drawer-image"><Image src={item.image ?? "/photos/product-hero-square.webp"} alt={item.name} fill sizes="(max-width: 599px) 84px, 104px" className="object-cover" /></div>
                  <div className="cart-drawer-item-info"><div className="cart-drawer-item-heading"><h3>{reference?.name ?? item.name}</h3><div className="cart-drawer-item-prices">{oldPrice > item.price && <del>{euros(oldPrice)}</del>}<strong>{euros(item.price)}</strong></div></div>
                    <div className="cart-drawer-item-actions"><div className="cart-drawer-quantity"><button type="button" aria-label={`Diminuer la quantité de ${item.name}`} onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus /></button><span aria-label="Quantité" aria-live="polite">{item.quantity}</span><button type="button" aria-label={`Augmenter la quantité de ${item.name}`} onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus /></button></div><button type="button" className="cart-drawer-remove" aria-label={`Supprimer ${item.name}`} onClick={() => removeFromCart(item.id)}><Trash2 /></button></div>
                    {oldPrice > item.price && <span className="cart-drawer-item-saving"><Tag />Économisez {euros(oldPrice - item.price)}</span>}
                  </div>
                </article>;
              })}
            </div>
          </> : <div className="cart-drawer-empty"><ShoppingBag /><p>Votre panier est vide.</p><span>Un peu de douceur vous attend.</span></div>}
        </div>
        <footer className="cart-drawer-footer">
          {cart.length > 0 && <>
            {savings > 0 && <div className="cart-drawer-summary-line cart-drawer-savings"><span>Vous économisez</span><strong><Tag />{euros(savings)}</strong></div>}
            <div className="cart-drawer-summary-line"><span>Sous-total</span><span aria-live="polite">{euros(subtotal)}</span></div>
            {discount > 0 && <div className="cart-drawer-summary-line"><span>Réduction supplémentaire</span><span>−{euros(discount)}</span></div>}
            <div className="cart-drawer-summary-line"><span>Livraison</span><span>{shipping === 0 ? "Offerte" : euros(shipping)}</span></div>
            <div className="cart-drawer-total"><span>Total · {itemCount} article{itemCount > 1 ? "s" : ""}</span><strong aria-live="polite">{euros(total)}</strong></div>
            <Link href="/paiement" className="cart-drawer-checkout" onClick={closeCartDrawer}><LockKeyhole />Paiement sécurisé<ArrowRight /></Link>
            <p className="cart-drawer-secure"><LockKeyhole />Paiement sécurisé</p>
          </>}
          <button type="button" className="cart-drawer-continue" onClick={closeCartDrawer}>Continuer mes achats</button>
        </footer>
      </div>
    </dialog>
  );
}
