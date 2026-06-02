import type { Product } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";

type ProductGridProps = {
  products: Product[];
  onSelectProduct: (product: Product) => void;
};

export function ProductGrid({ products, onSelectProduct }: ProductGridProps) {
  return (
    <section className="mt-0">
      <div className="mb-4">
        <div>
          <p className="text-sm font-medium text-muted">Popular picks</p>
          <h2 className="text-lg font-medium text-ink">Ready for preorder</h2>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
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
