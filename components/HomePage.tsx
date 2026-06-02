"use client";

import { useEffect, useState } from "react";
import { CategoryTabs } from "@/components/CategoryTabs";
import { Header } from "@/components/Header";
import { HeroBanner } from "@/components/HeroBanner";
import { ProductBottomSheet } from "@/components/ProductBottomSheet";
import { ProductGrid } from "@/components/ProductGrid";
import type { CategoryFilter, Product } from "@/data/products";

type HomePageProps = {
  products: Product[];
  categories: CategoryFilter[];
};

export function HomePage({ products, categories }: HomePageProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const visibleProducts =
    activeCategory === "All" ? products : products.filter((product) => product.category === activeCategory);

  useEffect(() => {
    document.body.style.overflow = selectedProduct ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedProduct]);

  return (
    <>
      <main className="mx-auto min-h-screen max-w-md px-5 pb-10">
        <Header />
        <HeroBanner />
        <CategoryTabs categories={categories} activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        <ProductGrid products={visibleProducts} onSelectProduct={setSelectedProduct} />
      </main>
      <ProductBottomSheet product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </>
  );
}
