"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import type { CategoryFilter } from "@/data/products";
import { useI18n } from "@/lib/i18n";

export type SortOption = "featured" | "best-deal" | "price-high-low" | "price-low-high";
export type StatusOption = "ready" | "preorder" | "out-of-stock";
export type PriceRangeOption = "under-300" | "300-600" | "over-600";

export type ProductFilterState = {
  sortBy: SortOption;
  statuses: StatusOption[];
  priceRanges: PriceRangeOption[];
};

type ProductFiltersProps = {
  activeCategory: CategoryFilter;
  categories: CategoryFilter[];
  filters: ProductFilterState;
  onCategoryChange: (category: CategoryFilter) => void;
  onFiltersChange: (filters: ProductFilterState) => void;
};

const sortOptions: SortOption[] = ["featured", "best-deal", "price-low-high", "price-high-low"];
const statusOptions: StatusOption[] = ["ready", "preorder", "out-of-stock"];
const priceRangeOptions: PriceRangeOption[] = ["under-300", "300-600", "over-600"];

const toggleValue = <T extends string,>(values: T[], value: T) =>
  values.includes(value) ? values.filter((currentValue) => currentValue !== value) : [...values, value];

export function ProductFilters({
  activeCategory,
  categories,
  filters,
  onCategoryChange,
  onFiltersChange,
}: ProductFiltersProps) {
  const { categoryLabel, t } = useI18n();
  const [sheet, setSheet] = useState<"all" | "category" | "status" | "price" | "sort" | null>(null);
  const sheetPanelRef = useRef<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    document.body.style.overflow = sheet ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [sheet]);

  useEffect(() => {
    if (!sheet) {
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
      return;
    }

    if (!previousFocusRef.current) {
      previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }

    const focusPanel = window.requestAnimationFrame(() => {
      sheetPanelRef.current
        ?.querySelector<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")
        ?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSheet(null);
        return;
      }

      if (event.key !== "Tab" || !sheetPanelRef.current) {
        return;
      }

      const focusableElements = Array.from(
        sheetPanelRef.current.querySelectorAll<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"),
      ).filter((element) => !element.hasAttribute("disabled") && !element.getAttribute("aria-hidden"));

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusPanel);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [sheet]);

  const activeFilterCount = filters.statuses.length + filters.priceRanges.length;
  const statusLabel = `${t.filters.status}${filters.statuses.length > 0 ? ` (${filters.statuses.length})` : ""}`;
  const priceLabel = filters.priceRanges.length > 0 ? `${t.filters.priceSelect} (${filters.priceRanges.length})` : t.filters.priceSelect;
  const sheetTitle =
    sheet === "category"
      ? t.filters.category
      : sheet === "status"
        ? t.filters.status
        : sheet === "price"
          ? t.filters.priceSelect
          : sheet === "sort"
            ? t.filters.sortBy
            : t.filters.filtersTitle;

  const sortLabels = useMemo<Record<SortOption, string>>(
    () => ({
      featured: t.filters.featured,
      "best-deal": t.filters.bestDeal,
      "price-high-low": t.filters.priceHighLow,
      "price-low-high": t.filters.priceLowHigh,
    }),
    [t],
  );

  const statusLabels = useMemo<Record<StatusOption, string>>(
    () => ({
      ready: t.filters.ready,
      preorder: t.filters.preorder,
      "out-of-stock": t.filters.outOfStock,
    }),
    [t],
  );

  const priceRangeLabels = useMemo(
    () => Object.fromEntries(priceRangeOptions.map((option, index) => [option, t.filters.priceRanges[index]])) as Record<PriceRangeOption, string>,
    [t],
  );

  const resetFilters = () => {
    onFiltersChange({ sortBy: "featured", statuses: [], priceRanges: [] });
  };

  const updateFilters = (nextFilters: ProductFilterState) => {
    onFiltersChange(nextFilters);
  };

  return (
    <>
      <div className="-mx-5 mb-5 mt-4 overflow-x-auto px-5 hide-scrollbar sm:mt-5" aria-label={t.filters.filtersTitle}>
        <div className="flex min-w-max gap-2">
          <FilterButton
            label={`${t.filters.allFilters}${activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}`}
            icon={<SlidersHorizontal className="h-4 w-4" strokeWidth={2} />}
            isActive={activeFilterCount > 0}
            onClick={() => setSheet("all")}
          />
          <FilterButton
            label={activeCategory === "All" ? categoryLabel(activeCategory) : categoryLabel(activeCategory)}
            hasChevron
            isActive={activeCategory !== "All"}
            onClick={() => setSheet("category")}
          />
          <FilterButton label={statusLabel} hasChevron isActive={filters.statuses.length > 0} onClick={() => setSheet("status")} />
          <FilterButton label={priceLabel} hasChevron isActive={filters.priceRanges.length > 0} onClick={() => setSheet("price")} />
          <FilterButton label={sortLabels[filters.sortBy]} hasChevron isActive={filters.sortBy !== "featured"} onClick={() => setSheet("sort")} />
        </div>
      </div>

      <Sheet
        compact={sheet === "category" || sheet === "status" || sheet === "price" || sheet === "sort"}
        fullScreen={sheet === "all"}
        isOpen={sheet !== null}
        label={sheetTitle}
        onClose={() => setSheet(null)}
        panelRef={sheetPanelRef}
      >
        {sheet === "all" ? (
          <div className="flex h-full min-h-[100dvh] flex-col bg-cream">
            <SheetHeader title={t.filters.filtersTitle} onClose={() => setSheet(null)} fullScreen />
            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
              <FilterSection title={t.filters.sortBy}>
                <RadioGroup
                  options={sortOptions}
                  labels={sortLabels}
                  value={filters.sortBy}
                  onChange={(sortBy) => updateFilters({ ...filters, sortBy })}
                />
              </FilterSection>
              <FilterSection title={statusLabel}>
                <CheckboxGroup
                  options={statusOptions}
                  labels={statusLabels}
                  values={filters.statuses}
                  onChange={(statuses) => updateFilters({ ...filters, statuses })}
                />
              </FilterSection>
              <FilterSection title={t.filters.priceSelect}>
                <CheckboxGroup
                  options={priceRangeOptions}
                  labels={priceRangeLabels}
                  values={filters.priceRanges}
                  onChange={(priceRanges) => updateFilters({ ...filters, priceRanges })}
                />
              </FilterSection>
            </div>
            <div className="grid shrink-0 grid-cols-2 gap-3 border-t border-beige/45 bg-cream px-6 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4">
              <button className="min-h-11 rounded-full border border-beige/70 bg-cream px-5 py-3 text-[15px] font-semibold text-ink" type="button" onClick={resetFilters}>
                {t.filters.clear}{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
              </button>
              <button className="min-h-11 rounded-full bg-ink px-5 py-3 text-[15px] font-semibold text-cream" type="button" onClick={() => setSheet(null)}>
                {t.filters.apply}
              </button>
            </div>
          </div>
        ) : null}

        {sheet === "category" ? (
          <CompactFilter title={t.filters.category} onClose={() => setSheet(null)} applyLabel={t.filters.apply}>
            <RadioGroup
              options={categories}
              labels={Object.fromEntries(categories.map((category) => [category, categoryLabel(category)])) as Record<CategoryFilter, string>}
              value={activeCategory}
              onChange={(category) => onCategoryChange(category)}
            />
          </CompactFilter>
        ) : null}

        {sheet === "status" ? (
          <CompactFilter
            title={t.filters.status}
            onClose={() => setSheet(null)}
            applyLabel={t.filters.apply}
          >
            <CheckboxGroup
              options={statusOptions}
              labels={statusLabels}
              values={filters.statuses}
              onChange={(statuses) => updateFilters({ ...filters, statuses })}
            />
          </CompactFilter>
        ) : null}

        {sheet === "price" ? (
          <CompactFilter title={t.filters.priceSelect} onClose={() => setSheet(null)} applyLabel={t.filters.apply}>
            <CheckboxGroup
              options={priceRangeOptions}
              labels={priceRangeLabels}
              values={filters.priceRanges}
              onChange={(priceRanges) => updateFilters({ ...filters, priceRanges })}
            />
          </CompactFilter>
        ) : null}

        {sheet === "sort" ? (
          <CompactFilter title={t.filters.sortBy} onClose={() => setSheet(null)} applyLabel={t.filters.apply}>
            <RadioGroup
              options={sortOptions}
              labels={sortLabels}
              value={filters.sortBy}
              onChange={(sortBy) => updateFilters({ ...filters, sortBy })}
            />
          </CompactFilter>
        ) : null}
      </Sheet>
    </>
  );
}

function FilterButton({
  hasChevron = false,
  icon,
  isActive = false,
  label,
  onClick,
}: {
  hasChevron?: boolean;
  icon?: React.ReactNode;
  isActive?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[15px] font-semibold shadow-[0_8px_20px_rgba(74,67,59,0.04)] transition duration-200 ease-[var(--ease-out-ui)] active:scale-[0.97] ${
        isActive ? "border-blue bg-blue/70 text-ink" : "border-beige/75 bg-cream text-ink"
      }`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
      {hasChevron ? <ChevronDown className="h-4 w-4" strokeWidth={2} /> : null}
    </button>
  );
}

function Sheet({
  children,
  compact,
  fullScreen,
  isOpen,
  label,
  onClose,
  panelRef,
}: {
  children: React.ReactNode;
  compact: boolean;
  fullScreen: boolean;
  isOpen: boolean;
  label: string;
  onClose: () => void;
  panelRef: React.MutableRefObject<HTMLElement | null>;
}) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ease-[var(--ease-out-ui)] ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        } ${fullScreen ? "bg-transparent" : "bg-ink/30 backdrop-blur-[2px]"}`}
        aria-hidden="true"
        onClick={onClose}
      />
      <section
        ref={panelRef}
        className={
          fullScreen
            ? `fixed inset-0 z-50 mx-auto h-[100dvh] w-full max-w-md overflow-hidden bg-cream transition-opacity duration-200 ease-[var(--ease-out-ui)] ${
                isOpen ? "opacity-100" : "pointer-events-none opacity-0"
              }`
            : `fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md overflow-hidden rounded-t-[26px] bg-[#FDFBF7] shadow-[0_-18px_45px_rgba(74,67,59,0.16)] transition duration-300 ease-[var(--ease-out-ui)] ${
                isOpen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-5 opacity-0"
              } ${compact ? "" : "top-auto"}`
        }
        aria-label={label}
        aria-hidden={!isOpen}
        aria-modal="true"
        role="dialog"
      >
        {children}
      </section>
    </>
  );
}

function SheetHeader({ fullScreen = false, onClose, title }: { fullScreen?: boolean; onClose: () => void; title: string }) {
  const { t } = useI18n();

  return (
    <div className={`flex items-center justify-between px-6 pb-5 ${fullScreen ? "pt-[calc(env(safe-area-inset-top)+1rem)]" : "pt-6"}`}>
      <h2 className="text-[1.55rem] font-semibold tracking-normal text-ink">{title}</h2>
      <button type="button" className="grid h-11 w-11 place-items-center rounded-full bg-stone-100 text-ink transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.94]" aria-label={t.filters.close} onClick={onClose}>
        <X className="h-5 w-5" strokeWidth={2.2} />
      </button>
    </div>
  );
}

function CompactFilter({
  applyLabel,
  children,
  onClose,
  title,
}: {
  applyLabel: string;
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <div className="pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-0">
      <SheetHeader title={title} onClose={onClose} />
      <div className="px-7 pb-5">{children}</div>
      <button type="button" className="mx-6 mt-3 min-h-11 w-[calc(100%-3rem)] rounded-full bg-ink px-5 py-3.5 text-[15px] font-semibold text-cream transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.98]" onClick={onClose}>
        {applyLabel}
      </button>
    </div>
  );
}

function FilterSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="border-b border-beige/45 py-6">
      <h3 className="mb-4 text-[16px] font-semibold leading-6 text-ink">{title}</h3>
      {children}
    </section>
  );
}

function CheckboxGroup<T extends string>({
  labels,
  onChange,
  options,
  values,
}: {
  labels: Record<T, string>;
  onChange: (values: T[]) => void;
  options: T[];
  values: T[];
}) {
  return (
    <div className="space-y-3">
      {options.map((option) => {
        const isChecked = values.includes(option);

        return (
          <label key={option} className="group flex min-h-11 w-full cursor-pointer items-center gap-3 py-2 text-[15px] font-medium leading-6 text-ink">
            <input
              type="checkbox"
              className="sr-only"
              checked={isChecked}
              onChange={() => onChange(toggleValue(values, option))}
            />
            <span
              aria-hidden="true"
              className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[3px] border transition duration-200 ease-[var(--ease-out-ui)] group-hover:border-ink ${
                isChecked ? "border-ink bg-ink text-cream" : "border-stone-400/70 bg-transparent text-transparent"
              }`}
            >
              <Check className="h-3 w-3" strokeWidth={2.4} />
            </span>
            <span>{labels[option]}</span>
          </label>
        );
      })}
    </div>
  );
}

function RadioGroup<T extends string>({
  labels,
  onChange,
  options,
  value,
}: {
  labels: Record<T, string>;
  onChange: (value: T) => void;
  options: T[];
  value: T;
}) {
  return (
    <div className="space-y-2">
      {options.map((option) => (
        <label key={option} className="flex min-h-11 w-full cursor-pointer items-center gap-3 py-2 text-[15px] font-medium leading-6 text-ink">
          <input
            type="radio"
            className="h-5 w-5 shrink-0 accent-ink"
            checked={value === option}
            onChange={() => onChange(option)}
          />
          <span>{labels[option]}</span>
        </label>
      ))}
    </div>
  );
}
