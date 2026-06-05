"use client";

import type { CategoryFilter } from "@/data/products";
import { useI18n } from "@/lib/i18n";

type CategoryTabsProps = {
  categories: readonly CategoryFilter[];
  activeCategory: CategoryFilter;
  onCategoryChange: (category: CategoryFilter) => void;
};

export function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
  const { categoryLabel, t } = useI18n();

  return (
    <nav className="-mx-5 mb-5 mt-5 overflow-x-auto px-5 hide-scrollbar sm:mb-8 sm:mt-6" aria-label={t.categories.ariaLabel}>
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
                  ? "min-h-11 rounded-full bg-blue px-5 py-2.5 text-[15px] font-medium text-ink"
                  : "min-h-11 rounded-full border border-beige bg-cream px-5 py-2.5 text-[15px] font-medium text-muted"
              }
            >
              {categoryLabel(category)}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
