"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { HeroBanner } from "@/components/HeroBanner";
import { ProductBottomSheet } from "@/components/ProductBottomSheet";
import { ProductFilters, type PriceRangeOption, type ProductFilterState, type StatusOption } from "@/components/ProductFilters";
import { ProductGrid } from "@/components/ProductGrid";
import type { CategoryFilter, Product } from "@/data/products";

type HomePageProps = {
  products: Product[];
  categories: CategoryFilter[];
};

export function HomePage({ products, categories }: HomePageProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUrlStateReady, setIsUrlStateReady] = useState(false);
  const [filters, setFilters] = useState<ProductFilterState>({
    sortBy: "featured",
    statuses: [],
    priceRanges: [],
  });

  const visibleProducts = products
    .filter((product) => {
      const normalizedQuery = searchQuery.trim().toLowerCase();

      if (!normalizedQuery) {
        return true;
      }

      return [product.brand, product.name, product.description, product.category]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    })
    .filter((product) => activeCategory === "All" || product.category === activeCategory)
    .filter((product) => {
      if (filters.statuses.length === 0) {
        return true;
      }

      return filters.statuses.includes(getProductStatusOption(product.status));
    })
    .filter((product) => {
      if (filters.priceRanges.length === 0) {
        return true;
      }

      const price = product.price_sale ?? product.price_full;
      return filters.priceRanges.some((range) => isPriceInRange(price, range));
    })
    .slice()
    .sort((firstProduct, secondProduct) => {
      const firstPrice = firstProduct.price_sale ?? firstProduct.price_full;
      const secondPrice = secondProduct.price_sale ?? secondProduct.price_full;

      switch (filters.sortBy) {
        case "best-deal":
          return getDiscountAmount(secondProduct) - getDiscountAmount(firstProduct);
        case "price-high-low":
          return secondPrice - firstPrice;
        case "price-low-high":
          return firstPrice - secondPrice;
        case "featured":
        default:
          return products.indexOf(firstProduct) - products.indexOf(secondProduct);
      }
    });

  useEffect(() => {
    document.body.style.overflow = selectedProduct ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedProduct]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const category = searchParams.get("category") ?? "All";
    const status = searchParams.get("status");
    const productId = searchParams.get("product");
    const linkedProduct = products.find((product) => product.id === productId);

    setSearchQuery(searchParams.get("q") ?? "");
    setActiveCategory(category.trim() ? category : "All");
    setFilters((currentFilters) => ({
      ...currentFilters,
      statuses: isStatusOption(status) ? [status] : [],
    }));

    if (linkedProduct) {
      setSelectedProduct(linkedProduct);
    }

    setIsUrlStateReady(true);
  }, [categories, products]);

  useEffect(() => {
    if (!isUrlStateReady) {
      return;
    }

    const nextUrl = new URL(window.location.href);
    const nextQuery = searchQuery.trim();

    if (nextQuery) {
      nextUrl.searchParams.set("q", nextQuery);
    } else {
      nextUrl.searchParams.delete("q");
    }

    window.history.replaceState(null, "", nextUrl);
  }, [isUrlStateReady, searchQuery]);

  useEffect(() => {
    if (!isUrlStateReady) {
      return;
    }

    const nextUrl = new URL(window.location.href);

    if (activeCategory === "All") {
      nextUrl.searchParams.delete("category");
    } else {
      nextUrl.searchParams.set("category", activeCategory);
    }

    const singleStatus = filters.statuses.length === 1 ? filters.statuses[0] : "";

    if (singleStatus) {
      nextUrl.searchParams.set("status", singleStatus);
    } else {
      nextUrl.searchParams.delete("status");
    }

    window.history.replaceState(null, "", nextUrl);
  }, [activeCategory, filters.statuses, isUrlStateReady]);

  const selectProduct = (product: Product) => {
    setSelectedProduct(product);

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("product", product.id);
    window.history.replaceState(null, "", nextUrl);
  };

  const closeProduct = () => {
    setSelectedProduct(null);

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete("product");
    window.history.replaceState(null, "", nextUrl);
  };

  const resetDiscovery = () => {
    setSearchQuery("");
    setActiveCategory("All");
    setFilters({ sortBy: "featured", statuses: [], priceRanges: [] });

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete("q");
    window.history.replaceState(null, "", nextUrl);
  };

  const hasActiveDiscoveryState =
    searchQuery.trim().length > 0 ||
    activeCategory !== "All" ||
    filters.sortBy !== "featured" ||
    filters.statuses.length > 0 ||
    filters.priceRanges.length > 0;
  const filterCategories = categories.includes(activeCategory) ? categories : [...categories, activeCategory];

  return (
    <>
      <main className="mx-auto min-h-screen max-w-md px-5 pb-10">
        <Header searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} />
        <HeroBanner />
        <ProductFilters
          activeCategory={activeCategory}
          categories={filterCategories}
          filters={filters}
          onCategoryChange={setActiveCategory}
          onFiltersChange={setFilters}
        />
        <ProductGrid
          hasActiveFilters={hasActiveDiscoveryState}
          products={visibleProducts}
          searchQuery={searchQuery}
          totalCount={products.length}
          onReset={resetDiscovery}
          onSelectProduct={selectProduct}
        />
      </main>
      <ProductBottomSheet product={selectedProduct} onClose={closeProduct} />
    </>
  );
}

function isStatusOption(status: string | null): status is StatusOption {
  return status === "ready" || status === "preorder" || status === "out-of-stock";
}

function getProductStatusOption(status: string): StatusOption {
  const normalizedStatus = status.trim().toLowerCase();

  if (normalizedStatus.includes("out of stock") || normalizedStatus.includes("หมด")) {
    return "out-of-stock";
  }

  if (normalizedStatus.includes("preorder") || normalizedStatus.includes("pre-order") || normalizedStatus.includes("รอของ")) {
    return "preorder";
  }

  return "ready";
}

function getDiscountAmount(product: Product) {
  return product.price_sale === null ? 0 : product.price_full - product.price_sale;
}

function isPriceInRange(price: number, range: PriceRangeOption) {
  switch (range) {
    case "under-300":
      return price < 300;
    case "300-600":
      return price >= 300 && price <= 600;
    case "over-600":
      return price > 600;
  }
}
