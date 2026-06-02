"use client";

import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Header } from "@/components/Header";
import { ProductImage } from "@/components/ProductImage";
import type { CartItemInput, CartSummary } from "@/lib/cart";
import { formatPrice, productColors } from "@/lib/product-ui";

const CART_STORAGE_KEY = "rubhiw-cart";

const emptyCart: CartSummary = {
  lines: [],
  itemCount: 0,
  subtotal: 0,
};

const readStoredItems = (): CartItemInput[] => {
  try {
    const rawCart = window.localStorage.getItem(CART_STORAGE_KEY);
    return rawCart ? JSON.parse(rawCart) : [];
  } catch {
    return [];
  }
};

const writeStoredItems = (items: CartItemInput[]) => {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("rubhiw-cart-updated"));
};

export function CartPage() {
  const [items, setItems] = useState<CartItemInput[]>([]);
  const [cart, setCart] = useState<CartSummary>(emptyCart);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setItems(readStoredItems());
  }, []);

  useEffect(() => {
    let isCurrent = true;

    async function syncCart() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items }),
        });

        if (!response.ok) {
          throw new Error("Cart sync failed");
        }

        const nextCart = (await response.json()) as CartSummary;

        if (isCurrent) {
          setCart(nextCart);
        }
      } catch {
        if (isCurrent) {
          setError("Could not refresh your bag. Please try again.");
          setCart(emptyCart);
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    syncCart();

    return () => {
      isCurrent = false;
    };
  }, [items]);

  const cargoFee = useMemo(() => (cart.itemCount > 0 ? 0 : 0), [cart.itemCount]);
  const total = cart.subtotal + cargoFee;

  const updateQuantity = (productId: string, quantity: number) => {
    const nextItems = items
      .map((item) => (item.productId === productId ? { ...item, quantity: Math.max(quantity, 0) } : item))
      .filter((item) => item.quantity > 0);

    setItems(nextItems);
    writeStoredItems(nextItems);
  };

  const clearCart = () => {
    setItems([]);
    writeStoredItems([]);
  };

  return (
    <main className="mx-auto min-h-screen max-w-md px-5 pb-28">
      <Header />

      <section className="pt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Shopping Bag</p>
        <div className="mt-2 flex items-end justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-[-0.05em] text-ink">Your preorder bag</h1>
          {cart.itemCount > 0 ? (
            <button type="button" className="text-sm font-semibold text-muted" onClick={clearCart}>
              Clear
            </button>
          ) : null}
        </div>
      </section>

      {error ? <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}

      <section className="mt-6 space-y-3" aria-live="polite">
        {isLoading ? (
          <div className="rounded-[28px] border border-beige/55 bg-white px-5 py-8 text-sm font-medium text-muted shadow-soft">
            Refreshing your bag...
          </div>
        ) : cart.lines.length > 0 ? (
          cart.lines.map((line, index) => {
            const packageColor = productColors[index % productColors.length];

            return (
              <article
                key={line.product.id}
                className="grid grid-cols-[5.5rem_1fr] gap-4 rounded-[28px] border border-beige/55 bg-white p-3 shadow-[0_14px_34px_rgba(74,67,59,0.08)]"
              >
                <div className="overflow-hidden rounded-[22px] border border-beige/40 bg-cream">
                  <ProductImage
                    src={line.product.image_url}
                    alt={`${line.product.brand} ${line.product.name}`}
                    className="aspect-square w-full object-cover"
                    fallbackClassName="product-art aspect-square w-full"
                    packageColor={packageColor}
                  />
                </div>

                <div className="min-w-0 py-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{line.product.brand}</p>
                  <h2 className="mt-1 line-clamp-2 text-base font-semibold leading-tight tracking-[-0.02em] text-[#08111F]">
                    {line.product.name}
                  </h2>
                  <p className="mt-2 text-sm font-semibold text-ink">{formatPrice(line.unitPrice)}</p>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="inline-flex items-center rounded-full border border-beige/70 bg-cream">
                      <button
                        type="button"
                        className="grid h-8 w-8 place-items-center text-ink"
                        aria-label={`Decrease ${line.product.name} quantity`}
                        onClick={() => updateQuantity(line.product.id, line.quantity - 1)}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-6 text-center text-sm font-semibold text-ink">{line.quantity}</span>
                      <button
                        type="button"
                        className="grid h-8 w-8 place-items-center text-ink"
                        aria-label={`Increase ${line.product.name} quantity`}
                        onClick={() => updateQuantity(line.product.id, line.quantity + 1)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="grid h-8 w-8 place-items-center rounded-full bg-stone-100 text-muted"
                      aria-label={`Remove ${line.product.name}`}
                      onClick={() => updateQuantity(line.product.id, 0)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-[30px] border border-beige/55 bg-white px-5 py-10 text-center shadow-soft">
            <p className="text-lg font-semibold text-ink">Your bag is empty.</p>
            <p className="mt-2 text-sm leading-6 text-muted">Add preorder items from the catalog and they will appear here.</p>
            <a
              href="/"
              className="mt-6 inline-flex rounded-2xl bg-[#8FB2BF] px-5 py-3 text-sm font-semibold text-ink shadow-soft"
            >
              Browse products
            </a>
          </div>
        )}
      </section>

      {cart.lines.length > 0 ? (
        <section className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-beige/60 bg-cream/95 px-5 pb-5 pt-4 backdrop-blur">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Cargo estimate</span>
              <span>{cargoFee === 0 ? "TBC" : formatPrice(cargoFee)}</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-ink">
              <span className="text-base font-semibold">Total</span>
              <span className="text-2xl font-semibold tracking-[-0.04em]">{formatPrice(total)}</span>
            </div>
          </div>
          <button type="button" className="mt-4 w-full rounded-2xl bg-ink px-5 py-3.5 text-sm font-semibold text-cream">
            Prepare checkout
          </button>
        </section>
      ) : null}
    </main>
  );
}
