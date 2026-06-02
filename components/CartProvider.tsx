"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItemInput } from "@/lib/cart";
import { normalizeCartItems } from "@/lib/cart";

const CART_STORAGE_KEY = "rubhiw-cart";

type CartContextValue = {
  items: CartItemInput[];
  itemCount: number;
  pulseKey: number;
  addItem: (productId: string) => CartItemInput[];
  updateQuantity: (productId: string, quantity: number) => CartItemInput[];
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const readStoredItems = () => {
  try {
    const rawCart = window.localStorage.getItem(CART_STORAGE_KEY);
    return normalizeCartItems(rawCart ? JSON.parse(rawCart) : []);
  } catch {
    return [];
  }
};

const writeStoredItems = (items: CartItemInput[]) => {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("rubhiw-cart-updated"));
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemInput[]>([]);
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    const syncFromStorage = () => setItems(readStoredItems());

    syncFromStorage();
    window.addEventListener("storage", syncFromStorage);
    window.addEventListener("rubhiw-cart-updated", syncFromStorage);

    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener("rubhiw-cart-updated", syncFromStorage);
    };
  }, []);

  const itemCount = useMemo(() => items.reduce((total, item) => total + item.quantity, 0), [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount,
      pulseKey,
      addItem: (productId) => {
        const currentItems = readStoredItems();
        const existingItem = currentItems.find((item) => item.productId === productId);
        const nextItems = existingItem
          ? currentItems.map((item) =>
              item.productId === productId ? { ...item, quantity: Math.min(item.quantity + 1, 99) } : item,
            )
          : [...currentItems, { productId, quantity: 1 }];

        setItems(nextItems);
        setPulseKey((key) => key + 1);
        writeStoredItems(nextItems);
        return nextItems;
      },
      updateQuantity: (productId, quantity) => {
        const nextItems = items
          .map((item) => (item.productId === productId ? { ...item, quantity: Math.max(Math.trunc(quantity), 0) } : item))
          .filter((item) => item.quantity > 0);

        setItems(nextItems);
        writeStoredItems(nextItems);
        return nextItems;
      },
      clearCart: () => {
        setItems([]);
        writeStoredItems([]);
      },
    }),
    [itemCount, items, pulseKey],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);

  if (!cart) {
    throw new Error("useCart must be used within CartProvider");
  }

  return cart;
}
