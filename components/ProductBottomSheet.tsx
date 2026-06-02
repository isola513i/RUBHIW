"use client";

import { useEffect } from "react";
import { ProductImage } from "@/components/ProductImage";
import type { Product } from "@/data/products";
import { formatPrice, getStatusClasses, productColors } from "@/lib/product-ui";
type ProductBottomSheetProps = {
  product: Product | null;
  onClose: () => void;
};

export function ProductBottomSheet({ product, onClose }: ProductBottomSheetProps) {
  useEffect(() => {
    if (!product) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [product, onClose]);

  const isOpen = product !== null;
  const displayPrice = product ? product.price_sale ?? product.price_full : 0;
  const packageColor = productColors[(product?.id.length ?? 0) % productColors.length];

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
        onClick={onClose}
      />

      <section
        className={`fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md transition-transform duration-300 ${
          isOpen ? "translate-y-0" : "pointer-events-none translate-y-full"
        }`}
        aria-label="Product details"
        aria-hidden={!isOpen}
      >
        <div className="rounded-t-3xl bg-[#FDFBF7] shadow-[0_-12px_30px_rgba(74,67,59,0.16)]">
          <div className="flex justify-center pt-3">
            <span className="h-1.5 w-12 rounded-full bg-beige/90" />
          </div>

          {product ? (
            <>
              <div className="max-h-[78vh] overflow-y-auto px-5 pb-36 pt-4">
                <div className="overflow-hidden rounded-[24px] border border-beige/50 bg-cream shadow-soft">
                  <ProductImage
                    src={product.image_url}
                    alt={`${product.brand} ${product.name}`}
                    className="aspect-square w-full object-cover"
                    fallbackClassName="product-art aspect-square w-full"
                    packageColor={packageColor}
                  />
                </div>

                <div className="mt-5 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/70">{product.brand}</p>
                  <h2 className="text-2xl font-semibold leading-tight text-ink">{product.name}</h2>
                  <span
                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium ${getStatusClasses(product.status)}`}
                  >
                    {product.status}
                  </span>
                  <p className="text-sm leading-7 text-muted">
                    {product.description || "Product details will be updated soon."}
                  </p>
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 border-t border-beige/60 bg-cream/95 px-5 pb-5 pt-4 backdrop-blur">
                <div className="flex items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-semibold tracking-wide text-ink">{formatPrice(displayPrice)}</p>
                    {product.price_sale !== null ? (
                      <p className="text-sm text-gray-400 line-through">{formatPrice(product.price_full)}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="min-w-[9.5rem] rounded-2xl bg-[#8FB2BF] px-5 py-3.5 text-sm font-semibold text-ink shadow-soft"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </section>
    </>
  );
}
