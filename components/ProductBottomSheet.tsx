"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Share2 } from "lucide-react";
import { showAppToast } from "@/components/AppToast";
import { useCart } from "@/components/CartProvider";
import { ProductImage } from "@/components/ProductImage";
import type { Product } from "@/data/products";
import { useI18n } from "@/lib/i18n";
import { formatPrice, getProductAvailability, getStatusClasses, productColors } from "@/lib/product-ui";

type ProductBottomSheetProps = {
  product: Product | null;
  onClose: () => void;
};

export function ProductBottomSheet({ product, onClose }: ProductBottomSheetProps) {
  const { addItem } = useCart();
  const { categoryLabel, statusLabel, t } = useI18n();
  const [addStatus, setAddStatus] = useState<"idle" | "adding" | "added">("idle");
  const [isSharing, setIsSharing] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const sheetPanelRef = useRef<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!product) {
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
        onClose();
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
  }, [product, onClose]);

  useEffect(() => {
    setAddStatus("idle");
    setIsSharing(false);
    setIsDescriptionExpanded(false);
  }, [product?.id]);

  const isOpen = product !== null;
  const displayPrice = product ? product.price_sale ?? product.price_full : 0;
  const packageColor = productColors[(product?.id.length ?? 0) % productColors.length];
  const productDescription = product?.description || t.products.fallbackDescription;
  const isDescriptionLong = productDescription.length > 120;
  const availability = product ? getProductAvailability(product.status) : { isPurchasable: false, tone: "info" as const };
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
  const availabilityHint =
    availability.tone === "stock"
      ? t.products.availability.readyHint
      : availability.tone === "preorder"
        ? t.products.availability.preorderHint
        : availability.tone === "unavailable"
          ? t.products.availability.unavailableHint
          : availability.tone === "hidden"
            ? t.products.availability.hiddenHint
            : t.products.availability.infoHint;

  const addToCart = async () => {
    if (!product || !availability.isPurchasable) {
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
      showAppToast({
        action: { href: "/bag", label: t.products.viewCart },
        duration: 2800,
        message: t.products.addedToast,
      });
    }, 500);
  };

  const shareProduct = async () => {
    if (!product || isSharing) {
      return;
    }

    setIsSharing(true);

    try {
      const productUrl = `${window.location.origin}/?product=${encodeURIComponent(product.id)}`;
      const shareData = {
        title: `${product.brand} ${product.name}`,
        text: `${product.brand} ${product.name} - ${formatPrice(displayPrice)}`,
        url: productUrl,
      };

      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(productUrl);
        showAppToast({ message: t.products.shareCopied });
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      showAppToast({ message: t.products.shareFailed, variant: "error" });
    } finally {
      setIsSharing(false);
    }
  };

  const detailRows = product
    ? [
        [t.products.detailLabels.category, categoryLabel(product.category)],
        [t.products.detailLabels.brand, product.brand],
        [t.products.detailLabels.name, product.name],
      ]
    : [];

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-ink/35 backdrop-blur-[2px] transition-opacity duration-300 ease-[var(--ease-out-ui)] ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
        onClick={onClose}
      />

      <section
        ref={sheetPanelRef}
        className={`fixed inset-0 z-50 mx-auto w-full max-w-md overflow-hidden bg-[#F6F1EA] transition duration-300 ease-[var(--ease-out-ui)] ${
          isOpen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
        aria-label={t.products.detailsAria}
        aria-hidden={!isOpen}
        aria-modal="true"
        role="dialog"
      >
        {product ? (
          <div className="relative h-full">
            <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-6 pt-[calc(env(safe-area-inset-top)+1.25rem)]">
              <button
                type="button"
                className="grid h-12 w-12 place-items-center rounded-full bg-[#FDFBF7]/95 text-[#14120F] shadow-[0_8px_24px_rgba(74,67,59,0.10)] transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.94]"
                aria-label={t.products.closeDetails}
                onClick={onClose}
              >
                <ChevronLeft className="h-6 w-6" strokeWidth={2.4} />
              </button>
              <button
                type="button"
                className="grid h-12 w-12 place-items-center rounded-full bg-[#FDFBF7]/95 text-[#14120F] shadow-[0_8px_24px_rgba(74,67,59,0.10)] transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.94] disabled:opacity-70"
                aria-label={t.products.moreActions}
                disabled={isSharing}
                onClick={shareProduct}
              >
                <Share2 className="h-5 w-5" strokeWidth={2.3} />
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
                      <dt className="text-[16px] font-medium leading-6 tracking-normal text-[#27231F]">{label}</dt>
                      <dd className="text-right text-[15px] font-medium leading-6 tracking-normal text-[#27231F]">{value}</dd>
                    </div>
                  ))}

                  <div className="grid grid-cols-[5.75rem_1fr] gap-4 py-3">
                    <dt className="text-[16px] font-medium leading-6 tracking-normal text-[#27231F]">
                      {t.products.detailLabels.description}
                    </dt>
                    <dd className="min-w-0 text-right text-[15px] font-medium leading-6 tracking-normal text-[#27231F]">
                      <p className={isDescriptionExpanded ? "" : "line-clamp-4"}>{productDescription}</p>
                      {isDescriptionLong ? (
                        <button
                          type="button"
                          className="mt-2 min-h-11 text-[15px] font-semibold text-[#55737C] transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.98]"
                          onClick={() => setIsDescriptionExpanded((currentValue) => !currentValue)}
                        >
                          {isDescriptionExpanded ? t.products.showLess : t.products.readMore}
                        </button>
                      ) : null}
                    </dd>
                  </div>

                  <div className="grid grid-cols-[5.75rem_1fr] gap-4 py-3">
                    <dt className="text-[16px] font-medium leading-6 tracking-normal text-[#27231F]">{t.products.detailLabels.fullPrice}</dt>
                    <dd className="text-right text-[15px] font-semibold leading-6 text-[#756F68] line-through">
                      {formatPrice(product.price_full)}
                    </dd>
                  </div>

                  <div className="grid grid-cols-[5.75rem_1fr] gap-4 py-3">
                    <dt className="text-[16px] font-medium leading-6 tracking-normal text-[#27231F]">{t.products.detailLabels.salePrice}</dt>
                    <dd className="text-right text-[32px] font-semibold leading-none tracking-normal text-[#14120F]">
                      {formatPrice(displayPrice)}
                    </dd>
                  </div>

                  <div className="grid grid-cols-[5.75rem_1fr] gap-4 py-3">
                    <dt className="text-[16px] font-medium leading-6 tracking-normal text-[#27231F]">{t.products.detailLabels.status}</dt>
                    <dd className="text-right">
                      <span
                        className={`inline-flex rounded-full border px-4 py-1.5 text-sm font-medium ${getStatusClasses(product.status)}`}
                      >
                        {availabilityLabel}
                      </span>
                      <p className="ml-auto mt-2 max-w-[12rem] text-right text-[13px] font-medium leading-5 text-muted">{availabilityHint}</p>
                      {statusLabel(product.status) !== availabilityLabel ? (
                        <p className="mt-1 text-right text-[12px] font-medium leading-5 text-muted">{statusLabel(product.status)}</p>
                      ) : null}
                    </dd>
                  </div>
                </div>
              </div>

              <div className="shrink-0 px-6 pb-[calc(env(safe-area-inset-bottom)+0.9rem)] pt-2">
                <button
                  type="button"
                  className="w-full rounded-[18px] bg-[#151412] px-6 py-3.5 text-lg font-semibold text-[#FDFBF7] shadow-[0_16px_34px_rgba(20,18,15,0.18)] transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.99] disabled:opacity-70"
                  disabled={addStatus !== "idle" || !availability.isPurchasable}
                  onClick={addToCart}
                >
                  {addStatus === "adding" ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#FDFBF7]/35 border-t-[#FDFBF7]" />
                      {t.products.addStates.adding}
                    </span>
                  ) : addStatus === "added" ? (
                    t.products.addStates.added
                  ) : !availability.isPurchasable ? (
                    availabilityLabel
                  ) : (
                    t.products.addStates.addToCart
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
