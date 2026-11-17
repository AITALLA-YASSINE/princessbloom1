"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useElements } from "@stripe/react-stripe-js";
import type {
  StripeExpressCheckoutElementOptions,
  StripeExpressCheckoutElementReadyEvent,
  StripeExpressCheckoutElementAvailablePaymentMethodsChangeEvent,
  StripeExpressCheckoutElementConfirmEvent,
  StripeExpressCheckoutElementShippingAddressChangeEvent,
  StripeExpressCheckoutElementShippingRateChangeEvent,
  StripeError,
} from "@stripe/stripe-js";

type Props = {
  options: StripeExpressCheckoutElementOptions;
  onReady: (event: StripeExpressCheckoutElementReadyEvent) => void;
  onAvailablePaymentMethodsChange: (event: StripeExpressCheckoutElementAvailablePaymentMethodsChangeEvent) => void;
  onConfirm: (event: StripeExpressCheckoutElementConfirmEvent) => void;
  onShippingAddressChange: (event: StripeExpressCheckoutElementShippingAddressChangeEvent) => void;
  onShippingRateChange: (event: StripeExpressCheckoutElementShippingRateChangeEvent) => void;
  onLoadError: (event: { error: StripeError }) => void;
  onLoaderStart: () => void;
};

export default function StripeWalletElement(props: Props) {
  const elements = useElements();
  const mountPoint = useRef<HTMLDivElement>(null);
  const handlers = useRef(props);
  const initialOptions = useRef(props.options);
  useLayoutEffect(() => { handlers.current = props; });
  useEffect(() => {
    if (!elements || !mountPoint.current) return;
    const element = elements.create("expressCheckout", initialOptions.current);
    // Attach before mount so no early ready/availability event can be lost.
    element.on("ready", event => handlers.current.onReady(event));
    element.on("availablepaymentmethodschange", event => handlers.current.onAvailablePaymentMethodsChange(event));
    element.on("confirm", event => handlers.current.onConfirm(event));
    element.on("shippingaddresschange", event => handlers.current.onShippingAddressChange(event));
    element.on("shippingratechange", event => handlers.current.onShippingRateChange(event));
    element.on("loaderror", event => handlers.current.onLoadError(event));
    handlers.current.onLoaderStart();
    element.mount(mountPoint.current);
    return () => element.destroy();
  }, [elements]);
  return <div ref={mountPoint} className="checkout-wallet-element" />;
}
