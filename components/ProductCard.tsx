"use client";

import type { Product } from "@/data/products";
import { ProductImage } from "@/components/ProductImage";
import { formatPrice, getBrandChipClasses, getProductAvailability, getStatusClasses, productColors } from "@/lib/product-ui";
import { useI18n } from "@/lib/i18n";

type ProductCardProps = {
  product: Product;
  index: number;
  onSelect: (product: Product) => void;
};

export function ProductCard({ product, index, onSelect }: ProductCardProps) {
  const { t } = useI18n();
  const packageColor = productColors[index % productColors.length];
  const displayPrice = product.price_sale ?? product.price_full;
  const brandChipClasses = getBrandChipClasses(product.brand);
  const availability = getProductAvailability(product.status);
  const availabilityLabel =
    availability.tone === "stock"
      ? t.products.availability.ready
      : availability.tone === "preorder"
        ? t.products.availability.preorder
        : availability.tone === "unavailable"
          ? t.products.availability.unavailable
          : availability.tone === "hidden"
            ? t.products.availability.hidden
            : t.products.availability.info;

  return (
    <button
      type="button"
      className="group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-[24px] border border-cream/80 bg-cream text-left shadow-[0_16px_38px_rgba(74,67,59,0.09)] transition duration-200 ease-[var(--ease-out-ui)] active:scale-[0.98] sm:rounded-[30px] sm:shadow-[0_22px_55px_rgba(74,67,59,0.10)] sm:hover:-translate-y-1 sm:hover:shadow-[0_30px_70px_rgba(74,67,59,0.13)]"
      data-sku={product.id}
      onClick={() => onSelect(product)}
    >
      <div className="relative overflow-hidden border-b border-[#EEE8DE] bg-[radial-gradient(circle_at_50%_46%,#FDFBF7_0%,#FAF8F3_58%,#F4EFE7_100%)]">
        <span className={`absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-[11px] font-semibold shadow-[0_8px_18px_rgba(74,67,59,0.10)] ${getStatusClasses(product.status)}`}>
          {availabilityLabel}
        </span>
        <ProductImage
          src={product.image_url}
          alt={`${product.brand} ${product.name}`}
          className="aspect-[1/0.92] w-full object-cover transition-transform duration-300 ease-[var(--ease-out-ui)] group-hover:scale-[1.04] sm:aspect-[1/1.22]"
          fallbackClassName="product-art aspect-[1/0.92] w-full sm:aspect-[1/1.22]"
          packageColor={packageColor}
        />
      </div>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-5">
        <div className="flex min-h-7 w-full items-center">
          <span
            className={`inline-flex min-w-0 max-w-[56%] truncate rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] sm:text-[10px] ${brandChipClasses}`}
          >
            {product.brand}
          </span>
        </div>
        <h3 className="mt-3 line-clamp-4 min-h-[5rem] text-base font-semibold leading-tight tracking-normal text-[#08111F] sm:min-h-[5.35rem] sm:text-[17px]">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-1 min-h-5 text-[12px] font-medium leading-5 text-muted sm:text-[13px]">
          {availability.tone === "preorder" ? t.products.availability.preorderHint : product.description || t.products.fallbackDescription}
        </p>
        <div className="mt-auto flex min-h-8 items-end gap-3 pt-2 sm:gap-4 sm:pt-3">
          <p className="text-[25px] font-semibold leading-none tracking-normal text-[#08111F] sm:text-[30px]">
            {formatPrice(displayPrice)}
          </p>
          {product.price_sale !== null ? (
            <p className="pb-1 text-sm font-semibold text-[#756F68] line-through">{formatPrice(product.price_full)}</p>
          ) : null}
        </div>
      </div>
    </button>
  );
}
