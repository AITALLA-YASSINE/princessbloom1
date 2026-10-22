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
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const storedCart = localStorage.getItem(CART_KEY);
      return storedCart ? JSON.parse(storedCart) : [];
    } catch {
      return [];
    }
  });
  const [promoCode, setPromoCode] = useState("");
  const [orderData, setOrderDataState] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const storedOrder = localStorage.getItem(ORDER_KEY);
      return storedOrder ? JSON.parse(storedOrder) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(ORDER_KEY, JSON.stringify(orderData));
  }, [orderData]);

  const addToCart = (item: CartItem) => {
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

  const shipping = subtotal > 0 ? (promoCode === "PRINCESSBLOOM10" ? 0 : 6.9) : 0;

  const discount = promoCode === "PRINCESSBLOOM10" ? subtotal * 0.1 : 0;

  const total = subtotal + shipping - discount;

  const setOrderData = (data: Record<string, string>) => {
    setOrderDataState(data);
  };

  const value: StoreContextValue = {
    cart,
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
