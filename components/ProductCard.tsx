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

  return (
    <button
      type="button"
      className="w-full cursor-pointer rounded-2xl border border-beige/55 bg-cream p-3 text-left shadow-soft transition-transform duration-200 active:scale-95"
      data-sku={product.id}
      onClick={() => onSelect(product)}
    >
      <div className="overflow-hidden rounded-2xl border border-beige/35 bg-[#F8F4ED]">
        <ProductImage
          src={product.image_url}
          alt={`${product.brand} ${product.name}`}
          className="aspect-square w-full object-cover"
          fallbackClassName="product-art aspect-square w-full"
          packageColor={packageColor}
        />
      </div>
      <div className="mt-3 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/70">{product.brand}</p>
        <h3 className="min-h-10 text-[15px] font-medium leading-snug text-ink">
          {product.name}
        </h3>
        <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-medium ${statusClasses}`}>
          {product.status}
        </span>
        <div className="pt-1">
          <p className="text-[1.05rem] font-semibold tracking-wide text-ink">{formatPrice(displayPrice)}</p>
          {product.price_sale !== null ? (
            <p className="text-xs text-gray-400 line-through">{formatPrice(product.price_full)}</p>
          ) : null}
        </div>
      </div>
    </button>
  );
}
