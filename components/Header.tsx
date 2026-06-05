"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { useI18n, type Language } from "@/lib/i18n";

const popularSearches = ["anua", "laneige", "rom&nd", "mixsoon", "torriden", "samyang", "jelly", "sunscreen"];
const languageOptions: Array<{ value: Language; label: string }> = [
  { value: "th", label: "TH" },
  { value: "en", label: "EN" },
];

const categoryMenuHrefs = ["/", "/?category=Skincare", "/?category=Makeup", "/?category=Snacks", "/?status=preorder"];
const supportMenuHrefs = ["/track", "/track", "/bag"];

type HeaderProps = {
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
};

export function Header({ searchQuery, onSearchQueryChange }: HeaderProps) {
  const { itemCount, pulseKey } = useCart();
  const { language, setLanguage, t } = useI18n();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSubHeaderVisible, setIsSubHeaderVisible] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const activeSearchQuery = searchQuery ?? localSearchQuery;
  const updateSearchQuery = onSearchQueryChange ?? setLocalSearchQuery;

  useEffect(() => {
    document.body.style.overflow = isMenuOpen || isSearchOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen, isSearchOpen]);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY;
      const productHeading = document.querySelector<HTMLElement>("[data-product-heading]");
      const productHeadingBottom = productHeading?.getBoundingClientRect().bottom ?? Number.POSITIVE_INFINITY;

      setIsSubHeaderVisible(isScrollingDown && productHeadingBottom <= 60);
      lastScrollY = Math.max(currentScrollY, 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen || isSearchOpen) {
      setIsSubHeaderVisible(false);
    }
  }, [isMenuOpen, isSearchOpen]);

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = activeSearchQuery.trim();

    setIsSearchOpen(false);

    if (!onSearchQueryChange && nextQuery) {
      window.location.href = `/?q=${encodeURIComponent(nextQuery)}`;
    }
  };

  const selectSearchTerm = (term: string) => {
    updateSearchQuery(term);
    setIsSearchOpen(false);

    if (!onSearchQueryChange) {
      window.location.href = `/?q=${encodeURIComponent(term)}`;
    }
  };

  return (
    <>
      <header
        className="fixed left-1/2 top-0 z-30 flex min-h-[60px] w-full max-w-md -translate-x-1/2 items-center justify-between border-b border-beige/50 bg-cream/95 px-5 backdrop-blur"
      >
        <div
          className={`absolute inset-0 flex items-center px-5 transition duration-200 ease-[var(--ease-out-ui)] ${
            isSubHeaderVisible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
          }`}
          aria-hidden={!isSubHeaderVisible}
        >
          <h2 className="text-[1.35rem] font-semibold leading-none tracking-normal text-ink">
            {t.products.popularPicks}
          </h2>
        </div>

        <div
          className={`flex w-full items-center justify-between transition duration-200 ease-[var(--ease-out-ui)] ${
            isSubHeaderVisible ? "pointer-events-none translate-y-2 opacity-0" : "translate-y-0 opacity-100"
          }`}
          aria-hidden={isSubHeaderVisible}
        >
          <Link className="flex shrink-0 items-center" href="/" aria-label={t.header.home}>
            <img
              className="block h-[31px] w-auto shrink-0 object-contain md:h-[38px]"
              src="/image/rubhiw_horizontal_lockup.png"
              alt="RUBHIW"
            />
          </Link>

          <div className="flex items-center gap-1 text-ink">
            <button
              className="grid h-11 w-11 place-items-center rounded-full transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.94]"
              type="button"
              aria-label={t.header.openSearch}
              aria-expanded={isSearchOpen}
              onClick={() => {
                setIsMenuOpen(false);
                setIsSearchOpen(true);
              }}
            >
              <Search className="h-5 w-5" strokeWidth={2.1} />
            </button>
            <Link className="relative grid h-11 w-11 place-items-center rounded-full transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.94]" href="/bag" aria-label={t.header.shoppingBag}>
              <ShoppingBag className="h-5 w-5" strokeWidth={2.1} />
              {itemCount > 0 ? (
                <span
                  key={pulseKey}
                  className="cart-badge-pop absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-blue px-1 text-[10px] font-semibold leading-none text-ink"
                >
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              ) : null}
            </Link>
            <button
              className="grid h-11 w-11 place-items-center rounded-full transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.94]"
              type="button"
              aria-label={t.header.openMenu}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="h-6 w-6" strokeWidth={2.1} />
            </button>
          </div>
        </div>
      </header>
      <div className="h-[60px]" aria-hidden="true" />

      <section
        className={`fixed inset-0 z-50 bg-cream transition-opacity duration-200 ease-[var(--ease-out-ui)] ${
          isSearchOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-label={t.header.searchPanel}
      >
        <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-4">
          <form className="flex items-center gap-3" role="search" onSubmit={submitSearch}>
            <div className="flex h-11 flex-1 items-center rounded-full bg-[#F3F3F3] pl-3 pr-4 text-ink">
              <span className="grid h-6 w-6 place-items-center text-[#56514C]">
                <Search className="h-[18px] w-[18px]" strokeWidth={2.15} />
              </span>
              <input
                autoFocus
                type="search"
                value={activeSearchQuery}
                onChange={(event) => updateSearchQuery(event.target.value)}
                placeholder={t.header.searchPlaceholder}
                className="ml-1.5 w-full bg-transparent text-[15px] font-semibold text-ink outline-none placeholder:text-[#8A8580]"
              />
              {activeSearchQuery ? (
                <button
                  type="button"
                  className="-mr-2 grid h-9 w-9 place-items-center rounded-full text-muted transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.92]"
                  aria-label={t.header.clearSearch}
                  onClick={() => updateSearchQuery("")}
                >
                  <X className="h-4 w-4" strokeWidth={2.2} />
                </button>
              ) : null}
            </div>
            <button
              className="min-h-11 shrink-0 text-base font-medium text-ink"
              type={activeSearchQuery.trim() ? "submit" : "button"}
              aria-label={t.header.closeSearch}
              onClick={() => {
                if (!activeSearchQuery.trim()) {
                  setIsSearchOpen(false);
                }
              }}
            >
              {activeSearchQuery.trim() ? t.header.submitSearch : t.header.cancel}
            </button>
          </form>

          <div className="mt-12">
            <p className="text-sm font-medium text-muted">{t.header.popularSearches}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  className="min-h-11 rounded-full bg-stone-100 px-4 py-2.5 text-base font-medium text-ink transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.96]"
                  onClick={() => selectSearchTerm(term)}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div
        className={`fixed inset-0 z-40 bg-ink/20 backdrop-blur-[2px] transition-opacity duration-300 ease-[var(--ease-out-ui)] ${
          isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
        onClick={() => setIsMenuOpen(false)}
      />

      <aside
        className={`fixed bottom-0 right-0 top-0 z-50 w-[82vw] max-w-xs bg-cream px-8 py-6 shadow-[0_0_40px_rgba(74,67,59,0.14)] transition-transform duration-300 ease-[var(--ease-out-ui)] ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label={t.header.primaryMenu}
      >
        <div className="flex justify-end">
          <button
            className="grid h-11 w-11 place-items-center rounded-full text-ink transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.94]"
            type="button"
            aria-label={t.header.closeMenu}
            onClick={() => setIsMenuOpen(false)}
          >
            <X className="h-6 w-6" strokeWidth={2.1} />
          </button>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{t.header.languageLabel}</p>
          <div className="mt-3 inline-flex min-h-11 overflow-hidden rounded-full border border-beige/70 bg-cream p-0.5">
            {languageOptions.map((option) => {
              const isActive = option.value === language;

              return (
                <button
                  key={option.value}
                  type="button"
                  className={`grid min-h-10 min-w-11 place-items-center rounded-full px-3 text-sm font-semibold transition duration-200 ease-[var(--ease-out-ui)] active:scale-[0.96] ${
                    isActive ? "bg-blue text-ink" : "text-muted"
                  }`}
                  aria-pressed={isActive}
                  onClick={() => setLanguage(option.value)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <nav className="mt-7 space-y-6" aria-label={t.header.primaryMenu}>
          {t.header.primaryLinks.map((link, index) => (
            <Link
              key={link}
              className="flex items-center justify-between text-2xl font-medium text-ink transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.98]"
              href={categoryMenuHrefs[index] ?? "/"}
              onClick={() => setIsMenuOpen(false)}
            >
              <span>{link}</span>
              <ChevronRight className="h-5 w-5 text-ink" strokeWidth={2.1} />
            </Link>
          ))}
        </nav>

        <div className="mt-9 space-y-5">
          {t.header.supportLinks.map((link, index) => (
            <Link
              key={link}
              className="block text-lg font-medium text-ink transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.98]"
              href={supportMenuHrefs[index] ?? "/track"}
              onClick={() => setIsMenuOpen(false)}
            >
              {link}
            </Link>
          ))}
        </div>

        <div className="mt-14">
          <p className="max-w-[14rem] text-base font-medium leading-7 text-muted">
            {t.header.memberCopy}
          </p>
          <div className="mt-6 flex gap-3">
            <Link className="min-h-11 rounded-full bg-ink px-5 py-3 text-sm font-medium text-cream" href="/track" onClick={() => setIsMenuOpen(false)}>
              {t.header.joinUs}
            </Link>
            <Link className="min-h-11 rounded-full border border-beige bg-cream px-5 py-3 text-sm font-medium text-ink" href="/bag" onClick={() => setIsMenuOpen(false)}>
              {t.header.signIn}
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
