"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ChevronLeft, MoreHorizontal } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { ProductImage } from "@/components/ProductImage";
import type { Product } from "@/data/products";
import { formatPrice, getStatusClasses, productColors } from "@/lib/product-ui";

type ProductBottomSheetProps = {
  product: Product | null;
  onClose: () => void;
};

const categoryLabels: Record<string, string> = {
  Makeup: "เมคอัพ",
  Skincare: "สกินแคร์",
  Snacks: "ขนม",
};

const statusLabels: Record<string, string> = {
  "in stock": "พร้อมขาย",
  preorder: "พรีออเดอร์",
  "pre-order": "พรีออเดอร์",
  "out of stock": "สินค้าหมด",
  hidden: "ซ่อนสินค้า",
};

const getStatusLabel = (status: string) => statusLabels[status.trim().toLowerCase()] ?? status;

export function ProductBottomSheet({ product, onClose }: ProductBottomSheetProps) {
  const { addItem } = useCart();
  const [addStatus, setAddStatus] = useState<"idle" | "adding" | "added">("idle");

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

  useEffect(() => {
    setAddStatus("idle");
  }, [product?.id]);

  const isOpen = product !== null;
  const displayPrice = product ? product.price_sale ?? product.price_full : 0;
  const packageColor = productColors[(product?.id.length ?? 0) % productColors.length];

  const addToCart = async () => {
    if (!product) {
      return;
    }

    setAddStatus("adding");
    const nextItems = addItem(product.id);

    fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: nextItems }),
    }).catch(() => {
      // Local cart still updates; the bag page will retry hydration.
    });

    setAddStatus("added");
    window.setTimeout(() => {
      onClose();
      toast.custom(
        (toastInstance) => (
          <div
            className={`flex items-center gap-4 rounded-[18px] border border-[#BBD8C2] bg-[#E8F3EA] px-4 py-3 text-sm font-medium text-[#2C4C3B] shadow-[0_18px_42px_rgba(44,76,59,0.14)] transition ${
              toastInstance.visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
            }`}
          >
            <span>Item added to cart</span>
            <Link
              className="rounded-full bg-[#2C312E] px-3 py-1.5 text-xs font-semibold text-[#FDFBF7]"
              href="/bag"
              onClick={() => toast.dismiss(toastInstance.id)}
            >
              View Cart
            </Link>
          </div>
        ),
        { duration: 2800 },
      );
    }, 500);
  };

  const detailRows = product
    ? [
        ["หมวดหมู่", categoryLabels[product.category] ?? product.category],
        ["แบรนด์", product.brand],
        ["ชื่อสินค้า", product.name],
        ["สรรพคุณ", product.description || "รายละเอียดสินค้าจะอัปเดตเร็ว ๆ นี้"],
      ]
    : [];

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-ink/35 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
        onClick={onClose}
      />

      <section
        className={`fixed inset-0 z-50 mx-auto w-full max-w-md overflow-hidden bg-[#F6F1EA] transition duration-300 ${
          isOpen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
        aria-label="Product details"
        aria-hidden={!isOpen}
      >
        {product ? (
          <div className="relative h-full">
            <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-6 pt-[calc(env(safe-area-inset-top)+1.25rem)]">
              <button
                type="button"
                className="grid h-12 w-12 place-items-center rounded-full bg-[#FDFBF7]/95 text-[#14120F] shadow-[0_8px_24px_rgba(74,67,59,0.10)]"
                aria-label="Close product details"
                onClick={onClose}
              >
                <ChevronLeft className="h-6 w-6" strokeWidth={2.4} />
              </button>
              <button
                type="button"
                className="grid h-12 w-12 place-items-center rounded-full bg-[#FDFBF7]/95 text-[#14120F] shadow-[0_8px_24px_rgba(74,67,59,0.10)]"
                aria-label="More product actions"
              >
                <MoreHorizontal className="h-6 w-6" strokeWidth={2.4} />
              </button>
            </div>

            <div className="h-[44vh] min-h-[18rem] overflow-hidden bg-[radial-gradient(circle_at_50%_28%,#FDFBF7_0%,#F0E7DC_58%,#DCD0C2_100%)]">
              <ProductImage
                src={product.image_url}
                alt={`${product.brand} ${product.name}`}
                className="h-full w-full object-cover"
                fallbackClassName="product-detail-art h-full w-full"
                packageColor={packageColor}
              />
            </div>

            <div className="absolute inset-x-0 bottom-0 flex h-[56vh] flex-col overflow-hidden rounded-t-[30px] bg-[#FDFBF7] shadow-[0_-18px_45px_rgba(74,67,59,0.14)]">
              <div className="flex shrink-0 justify-center pt-3">
                <span className="h-1.5 w-20 rounded-full bg-[#C9C5BF]" />
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-2 pt-4">
                <div className="divide-y divide-[#E4DED5]">
                  {detailRows.map(([label, value]) => (
                    <div key={label} className="grid grid-cols-[5.75rem_1fr] gap-4 py-3">
                      <dt className="text-[16px] font-medium leading-6 tracking-[-0.02em] text-[#27231F]">{label}</dt>
                      <dd className="text-right text-[15px] font-medium leading-6 tracking-[-0.02em] text-[#27231F]">{value}</dd>
                    </div>
                  ))}

                  <div className="grid grid-cols-[5.75rem_1fr] gap-4 py-3">
                    <dt className="text-[16px] font-medium leading-6 tracking-[-0.02em] text-[#27231F]">ราคาเต็ม</dt>
                    <dd className="text-right text-[15px] font-semibold leading-6 text-[#9F9A94] line-through">
                      {formatPrice(product.price_full)}
                    </dd>
                  </div>

                  <div className="grid grid-cols-[5.75rem_1fr] gap-4 py-3">
                    <dt className="text-[16px] font-medium leading-6 tracking-[-0.02em] text-[#27231F]">ราคาลด</dt>
                    <dd className="text-right text-[32px] font-semibold leading-none tracking-[-0.06em] text-[#14120F]">
                      {formatPrice(displayPrice)}
                    </dd>
                  </div>

                  <div className="grid grid-cols-[5.75rem_1fr] gap-4 py-3">
                    <dt className="text-[16px] font-medium leading-6 tracking-[-0.02em] text-[#27231F]">สถานะ</dt>
                    <dd className="text-right">
                      <span
                        className={`inline-flex rounded-full border px-4 py-1.5 text-sm font-medium ${getStatusClasses(product.status)}`}
                      >
                        {getStatusLabel(product.status)}
                      </span>
                    </dd>
                  </div>
                </div>
              </div>

              <div className="shrink-0 px-6 pb-[calc(env(safe-area-inset-bottom)+0.9rem)] pt-2">
                <button
                  type="button"
                  className="w-full rounded-[18px] bg-[#151412] px-6 py-3.5 text-lg font-semibold text-[#FDFBF7] shadow-[0_16px_34px_rgba(20,18,15,0.18)] transition active:scale-[0.99] disabled:opacity-70"
                  disabled={addStatus !== "idle"}
                  onClick={addToCart}
                >
                  {addStatus === "adding" ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#FDFBF7]/35 border-t-[#FDFBF7]" />
                      Adding
                    </span>
                  ) : addStatus === "added" ? (
                    "Added!"
                  ) : (
                    "Add to Cart"
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
}
