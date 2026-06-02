"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Menu, Search, ShoppingBag, X } from "lucide-react";

const primaryLinks = ["All", "Skincare", "Makeup", "Snacks", "Pre-order"];
const supportLinks = ["Track order", "Shipping status", "Member rewards"];
const popularSearches = ["anua", "laneige", "rom&nd", "mixsoon", "torriden", "samyang", "jelly", "sunscreen"];
const CART_STORAGE_KEY = "rubhiw-cart";

const getCartItemCount = () => {
  try {
    const rawCart = window.localStorage.getItem(CART_STORAGE_KEY);
    const cartItems = rawCart ? JSON.parse(rawCart) : [];

    if (!Array.isArray(cartItems)) {
      return 0;
    }

    return cartItems.reduce((total, item) => total + Math.max(Number(item?.quantity) || 0, 0), 0);
  } catch {
    return 0;
  }
};

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen || isSearchOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen, isSearchOpen]);

  useEffect(() => {
    const updateCartItemCount = () => setCartItemCount(getCartItemCount());

    updateCartItemCount();
    window.addEventListener("storage", updateCartItemCount);
    window.addEventListener("rubhiw-cart-updated", updateCartItemCount);

    return () => {
      window.removeEventListener("storage", updateCartItemCount);
      window.removeEventListener("rubhiw-cart-updated", updateCartItemCount);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 -mx-5 flex min-h-[60px] items-center justify-between border-b border-beige/50 bg-cream/95 px-5 backdrop-blur">
        <a className="flex shrink-0 items-center" href="/" aria-label="RUBHIW home">
          <img
            className="block h-[31px] w-auto shrink-0 object-contain md:h-[38px]"
            src="/image/rubhiw_horizontal_lockup.png"
            alt="RUBHIW"
          />
        </a>

        <div className="flex items-center gap-1 text-ink">
          <button
            className="grid h-10 w-10 place-items-center rounded-full"
            type="button"
            aria-label="Open search"
            aria-expanded={isSearchOpen}
            onClick={() => {
              setIsMenuOpen(false);
              setIsSearchOpen(true);
            }}
          >
            <Search className="h-5 w-5" strokeWidth={2.1} />
          </button>
          <a className="relative grid h-10 w-10 place-items-center rounded-full" href="/bag" aria-label="Shopping bag">
            <ShoppingBag className="h-5 w-5" strokeWidth={2.1} />
            {cartItemCount > 0 ? (
              <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-blue px-1 text-[10px] font-semibold leading-none text-ink">
                {cartItemCount > 9 ? "9+" : cartItemCount}
              </span>
            ) : null}
          </a>
          <button
            className="grid h-10 w-10 place-items-center rounded-full"
            type="button"
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="h-6 w-6" strokeWidth={2.1} />
          </button>
        </div>
      </header>

      <section
        className={`fixed inset-0 z-50 bg-cream transition-opacity duration-200 ${
          isSearchOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-label="Search panel"
      >
        <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 flex-1 items-center rounded-full bg-stone-100 pl-3 pr-4 text-ink">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-stone-300/90">
                <Search className="h-4 w-4" strokeWidth={2.1} />
              </span>
              <input
                autoFocus
                type="search"
                placeholder="Search products"
                className="ml-3 w-full bg-transparent text-base font-medium text-ink outline-none placeholder:text-muted"
              />
            </div>
            <button
              className="shrink-0 text-base font-medium text-ink"
              type="button"
              aria-label="Close search"
              onClick={() => setIsSearchOpen(false)}
            >
              Cancel
            </button>
          </div>

          <div className="mt-12">
            <p className="text-sm font-medium text-muted">Popular searches</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  className="rounded-full bg-stone-100 px-4 py-2.5 text-base font-medium text-ink"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div
        className={`fixed inset-0 z-40 bg-ink/20 backdrop-blur-[2px] transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
        onClick={() => setIsMenuOpen(false)}
      />

      <aside
        className={`fixed bottom-0 right-0 top-0 z-50 w-[82vw] max-w-xs bg-cream px-8 py-6 shadow-[0_0_40px_rgba(74,67,59,0.14)] transition-transform duration-300 ease-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Mobile menu"
      >
        <div className="flex justify-end">
          <button
            className="grid h-10 w-10 place-items-center rounded-full text-ink"
            type="button"
            aria-label="Close menu"
            onClick={() => setIsMenuOpen(false)}
          >
            <X className="h-6 w-6" strokeWidth={2.1} />
          </button>
        </div>

        <nav className="mt-7 space-y-6" aria-label="Primary menu">
          {primaryLinks.map((link) => (
            <a key={link} className="flex items-center justify-between text-2xl font-medium text-ink" href="#">
              {link}
              <ChevronRight className="h-5 w-5 text-ink" strokeWidth={2.1} />
            </a>
          ))}
        </nav>

        <div className="mt-9 space-y-5">
          {supportLinks.map((link) => (
            <a key={link} className="block text-lg font-medium text-ink" href="#">
              {link}
            </a>
          ))}
        </div>

        <div className="mt-14">
          <p className="max-w-[14rem] text-base font-medium leading-7 text-muted">
            Join Seoul Pantry Member for early cargo updates, curated Korean finds, and preorder alerts.
          </p>
          <div className="mt-6 flex gap-3">
            <a className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-cream" href="/profile">
              Join us
            </a>
            <a className="rounded-full border border-beige bg-cream px-5 py-3 text-sm font-medium text-ink" href="/profile">
              Sign in
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
