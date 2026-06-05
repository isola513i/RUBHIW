"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clipboard, Minus, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { showAppToast } from "@/components/AppToast";
import { useCart } from "@/components/CartProvider";
import { Header } from "@/components/Header";
import { ProductImage } from "@/components/ProductImage";
import type { CartSummary } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { formatPrice, productColors } from "@/lib/product-ui";

const emptyCart: CartSummary = {
  lines: [],
  itemCount: 0,
  subtotal: 0,
};

const ORDERS_STORAGE_KEY = "rubhiw-orders";
const MAX_SLIP_SIZE_BYTES = 5 * 1024 * 1024;
const promptPayId = process.env.NEXT_PUBLIC_PROMPTPAY_ID?.trim() ?? "";

type CheckoutForm = {
  name: string;
  contact: string;
  address: string;
  slipName: string;
};

type SubmittedOrder = {
  orderId: string;
  status: "pending-slip-review";
};

const resolveOrderErrorMessage = (message: string, fallback: string, driveSetupMessage: string) => {
  if (message.includes("Service Accounts do not have storage quota")) {
    return driveSetupMessage;
  }

  if (message === "Invalid slip file") {
    return "กรุณาแนบไฟล์รูปภาพของสลิป ขนาดไม่เกิน 5MB";
  }

  if (message === "Invalid order payload") {
    return "กรุณากรอกข้อมูลจัดส่งและแนบสลิปให้ครบ";
  }

  return message || fallback;
};

export function CartPage() {
  const { clearCart, items, updateQuantity } = useCart();
  const { t } = useI18n();
  const [cart, setCart] = useState<CartSummary>(emptyCart);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [checkoutForm, setCheckoutForm] = useState<CheckoutForm>({
    name: "",
    contact: "",
    address: "",
    slipName: "",
  });
  const [submittedOrder, setSubmittedOrder] = useState<SubmittedOrder | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function syncCart() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items }),
        });

        if (!response.ok) {
          throw new Error("Cart sync failed");
        }

        const nextCart = (await response.json()) as CartSummary;

        if (isCurrent) {
          setCart(nextCart);
        }
      } catch {
        if (isCurrent) {
          setError(t.cart.syncFailed);
          setCart(emptyCart);
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    syncCart();

    return () => {
      isCurrent = false;
    };
  }, [items, t.cart.syncFailed]);

  const cargoFee = 0;
  const total = cart.subtotal + cargoFee;
  const promptPayQrUrl = promptPayId ? `https://promptpay.io/${encodeURIComponent(promptPayId)}/${total.toFixed(2)}.png` : "";
  const canSubmitOrder =
    Boolean(promptPayId) &&
    checkoutForm.name.trim().length > 0 &&
    checkoutForm.contact.trim().length > 0 &&
    checkoutForm.address.trim().length > 0 &&
    slipFile !== null;

  const updateCheckoutField = (field: keyof CheckoutForm, value: string) => {
    setCheckoutForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const updateSlipFile = (file: File | null) => {
    if (!file) {
      setSlipFile(null);
      updateCheckoutField("slipName", "");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setSlipFile(null);
      updateCheckoutField("slipName", "");
      showAppToast({ message: t.cart.slipInvalidType, variant: "error" });
      return;
    }

    if (file.size > MAX_SLIP_SIZE_BYTES) {
      setSlipFile(null);
      updateCheckoutField("slipName", "");
      showAppToast({ message: t.cart.slipTooLarge, variant: "error" });
      return;
    }

    setSlipFile(file);
    updateCheckoutField("slipName", file.name);
  };

  const submitOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmitOrder || !slipFile || isSubmittingOrder) {
      return;
    }

    try {
      setIsSubmittingOrder(true);

      const formData = new FormData();
      formData.append("name", checkoutForm.name);
      formData.append("contact", checkoutForm.contact);
      formData.append("address", checkoutForm.address);
      formData.append("items", JSON.stringify(items));
      formData.append("slip", slipFile);

      const response = await fetch("/api/orders", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error === "Invalid slip file" || payload.error === "Invalid order payload" ? payload.error : t.cart.orderSubmitFailed);
      }

      const order = payload as SubmittedOrder;

      setSubmittedOrder(order);
      const storedOrders = JSON.parse(window.localStorage.getItem(ORDERS_STORAGE_KEY) ?? "[]") as SubmittedOrder[];
      window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([order, ...storedOrders.filter((storedOrder) => storedOrder.orderId !== order.orderId)].slice(0, 5)));
      clearCart();
      showAppToast({ message: t.cart.orderSubmitted });
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "";
      showAppToast({
        message: resolveOrderErrorMessage(message, t.cart.orderSubmitFailed, t.cart.driveUploadSetupRequired),
        variant: "error",
      });
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const copySubmittedOrderId = async () => {
    if (!submittedOrder) {
      return;
    }

    await navigator.clipboard.writeText(submittedOrder.orderId);
    showAppToast({ message: t.cart.orderNumberCopied });
  };

  return (
    <main className="mx-auto min-h-screen max-w-md px-5 pb-28">
      <Header />

      <section className="pt-7">
        <div className="flex items-start justify-between gap-4">
          <h1 className="max-w-[15rem] text-[2rem] font-semibold leading-[1.12] tracking-normal text-ink">{t.cart.title}</h1>
          {cart.itemCount > 0 ? (
            <button type="button" className="-mr-2 min-h-11 shrink-0 rounded-full px-2 text-sm font-semibold text-muted transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.96]" onClick={clearCart}>
              {t.cart.clear}
            </button>
          ) : null}
        </div>
      </section>

      {error ? <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}

      <section className="mt-7 space-y-3" aria-live="polite">
        {isLoading ? (
          <div className="rounded-[28px] border border-beige/55 bg-cream px-5 py-9 text-center text-[15px] font-medium leading-6 text-muted shadow-soft">
            {t.cart.loading}
          </div>
        ) : cart.lines.length > 0 ? (
          cart.lines.map((line, index) => {
            const packageColor = productColors[index % productColors.length];

            return (
              <article
                key={line.product.id}
                className="grid grid-cols-[6.25rem_1fr] gap-4 rounded-[28px] border border-beige/55 bg-cream p-3 shadow-[0_14px_34px_rgba(74,67,59,0.08)]"
              >
                <div className="grid aspect-square place-items-center overflow-hidden rounded-[22px] border border-beige/40 bg-cream">
                  <ProductImage
                    src={line.product.image_url}
                    alt={`${line.product.brand} ${line.product.name}`}
                    className="h-full w-full origin-center scale-[1.45] object-cover object-center"
                    fallbackClassName="product-art aspect-square w-full"
                    packageColor={packageColor}
                  />
                </div>

                <div className="min-w-0 py-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{line.product.brand}</p>
                  <h2 className="mt-1 line-clamp-2 text-[16px] font-semibold leading-snug tracking-normal text-[#08111F]">
                    {line.product.name}
                  </h2>
                  <p className="mt-2 text-[15px] font-semibold text-ink">{formatPrice(line.unitPrice)}</p>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="inline-flex items-center rounded-full border border-beige/70 bg-cream">
                      <button
                        type="button"
                        className="grid h-11 w-11 place-items-center text-ink transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.9]"
                        aria-label={t.cart.decreaseQuantity(line.product.name)}
                        onClick={() => updateQuantity(line.product.id, line.quantity - 1)}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-8 text-center text-sm font-semibold text-ink">{line.quantity}</span>
                      <button
                        type="button"
                        className="grid h-11 w-11 place-items-center text-ink transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.9]"
                        aria-label={t.cart.increaseQuantity(line.product.name)}
                        onClick={() => updateQuantity(line.product.id, line.quantity + 1)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="grid h-11 w-11 place-items-center rounded-full bg-stone-100 text-muted transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.92]"
                      aria-label={t.cart.remove(line.product.name)}
                      onClick={() => updateQuantity(line.product.id, 0)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-[30px] border border-beige/55 bg-cream px-6 py-11 text-center shadow-soft">
            <p className="text-[1.35rem] font-semibold leading-tight text-ink">{t.cart.emptyTitle}</p>
            <p className="mx-auto mt-3 max-w-[18rem] text-[15px] leading-7 text-muted">{t.cart.emptyDescription}</p>
            <Link
              href="/"
              className="mt-7 inline-flex min-h-11 rounded-2xl bg-[#8FB2BF] px-5 py-3 text-sm font-semibold text-ink shadow-soft transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.98]"
            >
              {t.cart.browseProducts}
            </Link>
          </div>
        )}
      </section>

      {cart.lines.length > 0 ? (
        <section className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-beige/60 bg-cream/95 px-5 pb-5 pt-4 backdrop-blur">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted">
              <span>{t.cart.subtotal}</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>{t.cart.cargoEstimate}</span>
              <span>{cargoFee === 0 ? t.cart.tbc : formatPrice(cargoFee)}</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-ink">
              <span className="text-base font-semibold">{t.cart.total}</span>
              <span className="text-2xl font-semibold tracking-normal">{formatPrice(total)}</span>
            </div>
          </div>
          <button type="button" className="mt-4 min-h-11 w-full rounded-2xl bg-ink px-5 py-3.5 text-sm font-semibold text-cream transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.98]" onClick={() => setIsCheckoutOpen(true)}>
            {t.cart.prepareCheckout}
          </button>
        </section>
      ) : null}

      {isCheckoutOpen ? (
        <section className="fixed inset-0 z-50 mx-auto flex h-[100dvh] w-full max-w-md flex-col bg-cream" aria-label={t.cart.checkoutTitle} aria-modal="true" role="dialog">
          <div className="flex shrink-0 items-center justify-between border-b border-beige/45 px-5 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)]">
            <h2 className="text-[1.65rem] font-semibold leading-none text-ink">{submittedOrder ? t.cart.orderSubmitted : t.cart.checkoutTitle}</h2>
            <button type="button" className="grid h-11 w-11 place-items-center rounded-full bg-stone-100 text-ink transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.94]" aria-label={t.filters.close} onClick={() => setIsCheckoutOpen(false)}>
              <X className="h-5 w-5" strokeWidth={2.2} />
            </button>
          </div>

          {submittedOrder ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-[#E8F3EA] text-[#2C7A46]">
                <CheckCircle2 className="h-8 w-8" strokeWidth={2.4} />
              </div>
              <p className="mt-5 text-2xl font-semibold text-ink">{t.cart.reviewStatus}</p>
              <p className="mt-3 max-w-[19rem] text-[15px] font-medium leading-7 text-muted">
                {t.cart.confirmationCopy}
              </p>
              <div className="mt-5 flex w-full max-w-[20rem] items-center justify-between gap-3 rounded-2xl border border-beige/65 bg-[#FDFBF7] px-4 py-3 text-left">
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-muted">{t.cart.orderNumber}</p>
                  <p className="mt-1 truncate text-lg font-semibold tracking-normal text-ink">{submittedOrder.orderId}</p>
                </div>
                <button
                  type="button"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-stone-100 text-ink transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.94]"
                  aria-label={t.cart.copyOrderNumber}
                  onClick={copySubmittedOrderId}
                >
                  <Clipboard className="h-4.5 w-4.5" strokeWidth={2.2} />
                </button>
              </div>
              <div className="mt-7 grid w-full max-w-[20rem] grid-cols-1 gap-3">
                <Link
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-ink px-6 py-3 text-sm font-semibold text-cream transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.98]"
                  href={`/track?orderId=${encodeURIComponent(submittedOrder.orderId)}`}
                >
                  <Search className="h-4 w-4" strokeWidth={2.3} />
                  {t.cart.trackOrder}
                </Link>
                <Link
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-beige/70 bg-cream px-6 py-3 text-sm font-semibold text-ink transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.98]"
                  href="/"
                >
                  {t.backToHome}
                </Link>
              </div>
            </div>
          ) : (
            <form className="min-h-0 flex-1 overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-5" onSubmit={submitOrder}>
              <section>
                <h3 className="text-base font-semibold text-ink">{t.cart.contactTitle}</h3>
                <div className="mt-4 space-y-3">
                  <input
                    className="min-h-12 w-full rounded-2xl border border-beige/60 bg-cream px-4 text-[15px] font-medium text-ink outline-none placeholder:text-muted"
                    minLength={2}
                    placeholder={t.cart.customerName}
                    value={checkoutForm.name}
                    onChange={(event) => updateCheckoutField("name", event.target.value)}
                    required
                  />
                  <input
                    className="min-h-12 w-full rounded-2xl border border-beige/60 bg-cream px-4 text-[15px] font-medium text-ink outline-none placeholder:text-muted"
                    minLength={4}
                    placeholder={t.cart.customerContact}
                    value={checkoutForm.contact}
                    onChange={(event) => updateCheckoutField("contact", event.target.value)}
                    required
                  />
                  <textarea
                    className="min-h-24 w-full resize-none rounded-2xl border border-beige/60 bg-cream px-4 py-3 text-[15px] font-medium leading-6 text-ink outline-none placeholder:text-muted"
                    minLength={10}
                    placeholder={t.cart.shippingAddress}
                    value={checkoutForm.address}
                    onChange={(event) => updateCheckoutField("address", event.target.value)}
                    required
                  />
                </div>
              </section>

              <section className="mt-7">
                <div className="flex items-end justify-between gap-4">
                  <h3 className="text-base font-semibold text-ink">{t.cart.paymentTitle}</h3>
                  <p className="text-xl font-semibold text-ink">{formatPrice(total)}</p>
                </div>
                <p className="mt-2 text-[15px] font-medium leading-6 text-muted">{t.cart.paymentInstruction}</p>

                <div className="mt-4 rounded-[28px] border border-beige/55 bg-[#FDFBF7] p-4 text-center shadow-soft">
                  {promptPayQrUrl ? (
                    <img className="mx-auto aspect-square w-56 max-w-full rounded-[18px]" src={promptPayQrUrl} alt={t.cart.qrAlt} />
                  ) : (
                    <div className="mx-auto grid aspect-square w-56 max-w-full place-items-center rounded-[18px] border border-dashed border-beige/80 px-5 text-sm font-medium leading-6 text-muted">
                      {t.cart.promptPayMissing}
                    </div>
                  )}
                </div>

                <label className="mt-4 flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-beige/70 bg-cream px-4 text-sm font-semibold text-ink transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.98]">
                  <Upload className="h-4 w-4" strokeWidth={2.2} />
                  {checkoutForm.slipName ? t.cart.slipSelected(checkoutForm.slipName) : t.cart.uploadSlip}
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/*"
                    onChange={(event) => updateSlipFile(event.target.files?.[0] ?? null)}
                  />
                </label>
                <p className="mt-2 text-[13px] font-medium leading-5 text-muted">{t.cart.slipRequirement}</p>
              </section>

              <button
                type="submit"
                className="mt-6 min-h-12 w-full rounded-2xl bg-ink px-5 py-3.5 text-sm font-semibold text-cream transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.98] disabled:opacity-45"
                disabled={!canSubmitOrder || isSubmittingOrder}
              >
                {isSubmittingOrder ? t.products.addStates.adding : t.cart.submitOrder}
              </button>
            </form>
          )}
        </section>
      ) : null}
    </main>
  );
}
