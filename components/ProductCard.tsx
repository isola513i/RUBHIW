import type { Product } from "@/data/products";
import { ProductImage } from "@/components/ProductImage";
import { formatPrice, getBrandChipClasses, getStatusClasses, productColors } from "@/lib/product-ui";

type ProductCardProps = {
  product: Product;
  index: number;
  onSelect: (product: Product) => void;
};

export function ProductCard({ product, index, onSelect }: ProductCardProps) {
  const packageColor = productColors[index % productColors.length];
  const displayPrice = product.price_sale ?? product.price_full;
  const statusClasses = getStatusClasses(product.status);
  const brandChipClasses = getBrandChipClasses(product.brand);

  return (
    <button
      type="button"
      className="group w-full cursor-pointer overflow-hidden rounded-[24px] border border-white/80 bg-white text-left shadow-[0_16px_38px_rgba(74,67,59,0.09)] transition duration-300 active:scale-[0.98] sm:rounded-[30px] sm:shadow-[0_22px_55px_rgba(74,67,59,0.10)] sm:hover:-translate-y-1 sm:hover:shadow-[0_30px_70px_rgba(74,67,59,0.13)]"
      data-sku={product.id}
      onClick={() => onSelect(product)}
    >
      <div className="relative overflow-hidden border-b border-[#EEE8DE] bg-[radial-gradient(circle_at_50%_46%,#FFFFFF_0%,#FAF8F3_58%,#F4EFE7_100%)]">
        <ProductImage
          src={product.image_url}
          alt={`${product.brand} ${product.name}`}
          className="aspect-[1/0.92] w-full object-cover transition duration-500 group-hover:scale-[1.04] sm:aspect-[1/1.22]"
          fallbackClassName="product-art aspect-[1/0.92] w-full sm:aspect-[1/1.22]"
          packageColor={packageColor}
        />
      </div>
      <div className="flex min-h-[10.4rem] flex-col px-4 pb-4 pt-4 sm:min-h-[11.25rem] sm:px-5 sm:pb-5 sm:pt-5">
        <div className="flex w-full items-center justify-between gap-2">
          <span
            className={`inline-flex min-w-0 max-w-[56%] truncate rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] sm:text-[10px] ${brandChipClasses}`}
          >
            {product.brand}
          </span>
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-medium leading-none sm:px-2.5 sm:text-[11px] ${statusClasses}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
            {product.status}
          </span>
        </div>
        <h3 className="mt-3 min-h-[2.15rem] text-base font-semibold leading-tight tracking-[-0.025em] text-[#08111F] sm:text-[17px]">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-1 text-[12px] font-medium leading-5 text-muted sm:text-[13px]">
          {product.description || "Product details will be updated soon."}
        </p>
        <div className="mt-auto flex items-end gap-3 pt-2 sm:gap-4 sm:pt-3">
          <p className="text-[25px] font-semibold leading-none tracking-[-0.055em] text-[#08111F] sm:text-[30px]">
            {formatPrice(displayPrice)}
          </p>
          {product.price_sale !== null ? (
            <p className="pb-1 text-sm font-semibold text-[#A6A1A0] line-through">{formatPrice(product.price_full)}</p>
          ) : null}
        </div>
      </div>
    </button>
  );
}
