"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type StoreContextValue = {
  cart: CartItem[];
  cartDrawerOpen: boolean;
  closeCartDrawer: () => void;
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
  shipping: number;
  total: number;
  promoCode: string;
  setPromoCode: (value: string) => void;
  discount: number;
  setOrderData: (data: Record<string, string>) => void;
  orderData: Record<string, string>;
};

const CART_KEY = "princessbloom-cart";
const ORDER_KEY = "princessbloom-order";

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const closeCartDrawer = () => setCartDrawerOpen(false);
  const [promoCode, setPromoCode] = useState("");
  const [orderData, setOrderDataState] = useState<Record<string, string>>({});

  useEffect(() => {
    // Restore browser storage after hydration so the first render matches the server.
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const storedCart = localStorage.getItem(CART_KEY);
      if (storedCart) setCart(JSON.parse(storedCart));
    } catch { /* Keep an empty cart if storage is unavailable or invalid. */ }
    try {
      const storedOrder = localStorage.getItem(ORDER_KEY);
      if (storedOrder) setOrderDataState(JSON.parse(storedOrder));
    } catch { /* Keep empty order data if storage is unavailable or invalid. */ }
    setStorageReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { /* The cart still works without persistence. */ }
  }, [cart, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    try { localStorage.setItem(ORDER_KEY, JSON.stringify(orderData)); } catch { /* Checkout still works without persistence. */ }
  }, [orderData, storageReady]);

  const addToCart = (item: CartItem) => {
    setCartDrawerOpen(true);
    setCart((current) => {
      const existing = current.find((entry) => entry.id === item.id);
      if (existing) {
        return current.map((entry) =>
          entry.id === item.id ? { ...entry, quantity: entry.quantity + item.quantity } : entry,
        );
      }
      return [...current, item];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart((current) =>
      current
        .map((entry) => (entry.id === id ? { ...entry, quantity: Math.max(0, quantity) } : entry))
        .filter((entry) => entry.quantity > 0),
    );
  };

  const removeFromCart = (id: string) => {
    setCart((current) => current.filter((entry) => entry.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

  const itemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  const shipping = 0;

  const normalizedPromo = promoCode.trim().toUpperCase();
  const discount = Math.round(subtotal * (normalizedPromo === "PRINCESSBLOOM10" ? 0.1 : normalizedPromo === "PRINCESSBLOOM5" ? 0.05 : 0) * 100) / 100;

  const total = subtotal + shipping - discount;

  const setOrderData = (data: Record<string, string>) => {
    setOrderDataState(data);
  };

  const value: StoreContextValue = {
    cart,
    cartDrawerOpen,
    closeCartDrawer,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    itemCount,
    shipping,
    total,
    promoCode,
    setPromoCode,
    discount,
    setOrderData,
    orderData,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
}
