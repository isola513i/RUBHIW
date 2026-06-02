import type { Product } from "@/data/products";

const productColors = ["#F3D8CF", "#C9D7C8", "#F6E3A9", "#D6C8E3", "#E9CFC5"];

type ProductCardProps = {
  product: Product;
  index: number;
  onSelect: (product: Product) => void;
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(value);

const getStatusClasses = (status: string) => {
  switch (status.trim().toLowerCase()) {
    case "in stock":
      return "bg-[#D9F0D8] text-[#1E7A35]";
    case "pre-order":
    case "preorder":
      return "bg-[#D9EAF8] text-[#2D6EA8]";
    case "out of stock":
      return "bg-[#B90F0A] text-white";
    case "hidden":
      return "bg-stone-200 text-stone-600";
    default:
      return "bg-beige/55 text-ink";
  }
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
      <div
        className="product-art aspect-square rounded-2xl"
        style={{ "--package": packageColor } as React.CSSProperties}
        role="img"
        aria-label={`${product.brand} ${product.name}`}
      />
      <div className="mt-3 space-y-1.5">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">{product.brand}</p>
        <h3 className="min-h-10 text-sm font-medium leading-snug text-ink">{product.name}</h3>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${statusClasses}`}>
          {product.status}
        </span>
        <div className="pt-1">
          <p className="text-base font-medium tracking-wide text-ink">{formatPrice(displayPrice)}</p>
          {product.price_sale !== null ? (
            <p className="text-xs text-gray-400 line-through">{formatPrice(product.price_full)}</p>
          ) : null}
        </div>
      </div>
    </button>
  );
}
