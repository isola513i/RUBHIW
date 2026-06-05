"use client";

import type { Product } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { useI18n } from "@/lib/i18n";

type ProductGridProps = {
  hasActiveFilters: boolean;
  products: Product[];
  searchQuery: string;
  totalCount: number;
  onReset: () => void;
  onSelectProduct: (product: Product) => void;
};

export function ProductGrid({ hasActiveFilters, products, searchQuery, totalCount, onReset, onSelectProduct }: ProductGridProps) {
  const { t } = useI18n();
  const heading = searchQuery.trim() ? searchQuery.trim() : t.products.popularPicks;
  const resultSummary = hasActiveFilters
    ? `${t.products.resultsCount(products.length)} / ${t.products.resultsCount(totalCount)}`
    : t.products.resultsCount(products.length);

  return (
    <section className="mt-5 sm:mt-8">
      <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6" data-product-heading>
        <h2 className="text-[1.65rem] font-semibold leading-none tracking-normal text-ink sm:text-[1.85rem]">
          {heading}
        </h2>
        <p className="shrink-0 pb-0.5 text-sm font-medium text-muted">{resultSummary}</p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} onSelect={onSelectProduct} />
          ))}
        </div>
      ) : (
        <div className="rounded-[26px] border border-beige/55 bg-cream px-5 py-9 text-center shadow-soft">
          <p className="text-base font-semibold text-ink">{hasActiveFilters ? t.products.emptyFiltered : t.products.empty}</p>
          {hasActiveFilters ? (
            <button type="button" className="mt-5 min-h-11 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-cream" onClick={onReset}>
              {t.products.resetFilters}
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
}
