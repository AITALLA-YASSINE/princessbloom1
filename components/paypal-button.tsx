"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type Buttons = { isEligible: () => boolean; render: (container: HTMLElement) => Promise<void>; close: () => Promise<void> };
type PayPalWindow = Window & { paypalPrincessBloom?: { Buttons: (options: Record<string, unknown>) => Buttons } };
const recoveryKey = (clientId: string) => `princessbloom-paypal-pending:${clientId}`;

export default function PayPalButton({ cartPayload, onPendingChange }: { cartPayload: string; onPendingChange: (pending: boolean) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const requestId = useRef<string | null>(null);
  const capturing = useRef(false);
  const [config, setConfig] = useState<{ clientId: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [pendingId, setPendingId] = useState("");
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/paypal/config", { signal: controller.signal }).then(response => response.json()).then(value => {
      if (!value.enabled || controller.signal.aborted) return;
      setConfig(value);
      try { const saved = sessionStorage.getItem(recoveryKey(value.clientId)); if (saved) { setPendingId(saved); onPendingChange(true); } } catch { /* Recovery remains available in the current page. */ }
    }).catch(() => {});
    return () => controller.abort();
  }, [onPendingChange]);

  async function capture(orderId: string) {
    setChecking(true); setMessage(""); onPendingChange(true);
    try {
      const response = await fetch("/api/paypal/capture-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      if (result.status === "failed") {
        try { if (config) sessionStorage.removeItem(recoveryKey(config.clientId)); } catch { /* Optional recovery storage. */ }
        capturing.current = false; requestId.current = null;
        setPendingId(""); onPendingChange(false);
        setMessage("PayPal a refusé le paiement. Vous pouvez choisir un autre moyen de paiement.");
        return;
      }
      if (result.status !== "paid" && result.status !== "processing") throw new Error("PayPal n’a pas confirmé ce paiement. Vérifiez son état avant de recommencer.");
      try { if (config) sessionStorage.removeItem(recoveryKey(config.clientId)); } catch { /* No sensitive data is stored. */ }
      window.location.assign(`/confirmation?paypal_order=${encodeURIComponent(orderId)}`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Impossible de vérifier le paiement PayPal. Ne payez pas une seconde fois."); }
    finally { setChecking(false); }
  }

  useEffect(() => {
    if (!ready || !config || !container.current || pendingId) return;
    let closed = false;
    const buttons = (window as PayPalWindow).paypalPrincessBloom?.Buttons({
      fundingSource: "paypal",
      style: { layout: "horizontal", color: "gold", shape: "rect", label: "paypal", height: 55, tagline: false, borderRadius: 14 },
      createOrder: async () => {
        setMessage(""); onPendingChange(true);
        try {
          if (!requestId.current) requestId.current = crypto.randomUUID();
          const response = await fetch("/api/paypal/create-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...JSON.parse(cartPayload), requestId: requestId.current }) });
          const result = await response.json();
          if (!response.ok || !result.id) throw new Error(result.error || "PayPal est indisponible.");
          return result.id;
        } catch (error) { onPendingChange(false); throw error; }
      },
      onApprove: async (data: { orderID: string }) => {
        capturing.current = true;
        setPendingId(data.orderID);
        try { sessionStorage.setItem(recoveryKey(config.clientId), data.orderID); } catch { /* Current-page retry is still possible. */ }
        await capture(data.orderID);
      },
      onCancel: () => { if (!capturing.current) onPendingChange(false); },
      onError: () => { if (!closed) { setMessage("PayPal n’a pas pu ouvrir le paiement. Veuillez réessayer."); if (!capturing.current) onPendingChange(false); } },
    });
    if (buttons?.isEligible()) void buttons.render(container.current).catch(() => { if (!closed) setMessage("Le bouton PayPal ne peut pas se charger."); });
    return () => { closed = true; void buttons?.close().catch(() => {}); };
    // Capture uses only state setters and its explicit order ID.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, config, cartPayload, pendingId, onPendingChange]);

  if (!config && !pendingId) return null;
  return <div className="checkout-paypal">
    {config && <Script id="paypal-princess-bloom-sdk" src={`https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(config.clientId)}&currency=EUR&intent=capture&components=buttons&disable-funding=card,credit,paylater,venmo`} data-namespace="paypalPrincessBloom" strategy="afterInteractive" onReady={() => setReady(true)} onError={() => setMessage("Le bouton PayPal n’a pas pu se charger.")} />}
    {!pendingId && <div ref={container} aria-label="Paiement express PayPal" />}
    {message && <p role="alert" className="checkout-paypal-message">{message}</p>}
    {pendingId && <button type="button" className="checkout-paypal-recover" disabled={checking} onClick={() => void capture(pendingId)}>{checking ? "Vérification du paiement…" : "Vérifier mon paiement PayPal"}</button>}
  </div>;
}
