import type { Product } from "@/data/products";
import { ProductImage } from "@/components/ProductImage";
import { formatPrice, getStatusClasses, productColors } from "@/lib/product-ui";

type ProductCardProps = {
  product: Product;
  index: number;
  onSelect: (product: Product) => void;
};

export function ProductCard({ product, index, onSelect }: ProductCardProps) {
  const packageColor = productColors[index % productColors.length];
  const displayPrice = product.price_sale ?? product.price_full;
  const statusClasses = getStatusClasses(product.status);
  const discountPercentage =
    product.price_sale !== null && product.price_full > 0
      ? Math.round(((product.price_full - product.price_sale) / product.price_full) * 100)
      : null;

  return (
    <button
      type="button"
      className="group w-full cursor-pointer overflow-hidden rounded-[30px] border border-white/80 bg-white text-left shadow-[0_22px_55px_rgba(74,67,59,0.10)] transition duration-300 active:scale-[0.98] sm:hover:-translate-y-1 sm:hover:shadow-[0_30px_70px_rgba(74,67,59,0.13)]"
      data-sku={product.id}
      onClick={() => onSelect(product)}
    >
      <div className="relative overflow-hidden border-b border-[#EEE8DE] bg-[radial-gradient(circle_at_50%_46%,#FFFFFF_0%,#FAF8F3_58%,#F4EFE7_100%)]">
        {discountPercentage !== null ? (
          <span className="absolute left-4 top-4 z-10 inline-flex rounded-2xl border border-[#F2D8D5] bg-[#FBEAEA]/90 px-3 py-2 text-sm font-semibold text-[#B93C35] shadow-[0_10px_24px_rgba(185,60,53,0.12)] backdrop-blur">
            -{discountPercentage}%
          </span>
        ) : null}
        <ProductImage
          src={product.image_url}
          alt={`${product.brand} ${product.name}`}
          className="aspect-[1/1.22] w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          fallbackClassName="product-art aspect-[1/1.22] w-full"
          packageColor={packageColor}
        />
      </div>
      <div className="space-y-4 px-5 pb-6 pt-5">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#747B84]">{product.brand}</p>
          <h3 className="min-h-[2.25rem] text-[16px] font-semibold leading-tight tracking-[-0.02em] text-[#08111F]">
            {product.name}
          </h3>
        </div>
        <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium ${statusClasses}`}>
          <span className="h-2 w-2 rounded-full bg-current opacity-80" />
          {product.status}
        </span>
        <div className="flex items-end gap-4 pt-1">
          <p className="text-[30px] font-semibold leading-none tracking-[-0.055em] text-[#08111F]">
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
