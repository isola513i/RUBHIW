import type { Product } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";

type ProductGridProps = {
  products: Product[];
  onSelectProduct: (product: Product) => void;
};

export function ProductGrid({ products, onSelectProduct }: ProductGridProps) {
  return (
    <section className="mt-5 sm:mt-8">
      <div className="mb-4 sm:mb-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-[-0.01em] text-muted sm:uppercase sm:tracking-[0.16em]">Popular picks</p>
          <h2 className="text-[1.35rem] font-semibold leading-tight tracking-[-0.04em] text-ink sm:text-xl">Ready for preorder</h2>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} onSelect={onSelectProduct} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-beige/55 bg-cream px-4 py-8 text-center text-sm text-muted shadow-soft">
          No products available right now.
        </div>
      )}
    </section>
  );
}
