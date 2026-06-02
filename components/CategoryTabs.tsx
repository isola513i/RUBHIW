"use client";

import type { CategoryFilter } from "@/data/products";

type CategoryTabsProps = {
  categories: readonly CategoryFilter[];
  activeCategory: CategoryFilter;
  onCategoryChange: (category: CategoryFilter) => void;
};

export function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <nav className="-mx-5 mb-5 mt-5 overflow-x-auto px-5 hide-scrollbar sm:mb-8 sm:mt-6" aria-label="Product categories">
      <div className="flex min-w-max gap-3">
        {categories.map((category) => {
          const isActive = category === activeCategory;

          return (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category)}
              className={
                isActive
                  ? "rounded-full bg-blue px-5 py-2.5 text-sm font-medium text-ink"
                  : "rounded-full border border-beige bg-cream px-5 py-2.5 text-sm font-medium text-muted"
              }
            >
              {category}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
