"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { CheckCircle2, ChevronLeft, Clipboard, Home, MapPin, Minus, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { showAppToast } from "@/components/AppToast";
import { useCart } from "@/components/CartProvider";
import { Header } from "@/components/Header";
import { ProductImage } from "@/components/ProductImage";
import type { ThaiAddressValue } from "@/components/ThaiAddressFields";
import type { CartSummary } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { formatPrice, productColors } from "@/lib/product-ui";
import { estimateThailandPostShippingFee } from "@/lib/shipping";

const emptyCart: CartSummary = {
  lines: [],
  itemCount: 0,
  subtotal: 0,
};

const ORDERS_STORAGE_KEY = "rubhiw-orders";
const MAX_SLIP_SIZE_BYTES = 5 * 1024 * 1024;
const promptPayId = process.env.NEXT_PUBLIC_PROMPTPAY_ID?.trim() ?? "";
const ThaiAddressFields = dynamic(() => import("@/components/ThaiAddressFields").then((mod) => mod.ThaiAddressFields), {
  ssr: false,
});
const createEmptyThaiAddressValue = (): ThaiAddressValue => ({
  district: "",
  postalCode: "",
  province: "",
  subdistrict: "",
});

type CheckoutForm = {
  name: string;
  contact: string;
  addressLabel: "home" | "work";
  addressLine: string;
  slipName: string;
};

type CheckoutErrors = Partial<Record<keyof CheckoutForm, string>>;
type CheckoutStep = "contact" | "address" | "payment";

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
    addressLabel: "home",
    addressLine: "",
    slipName: "",
  });
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("contact");
  const [addressValue, setAddressValue] = useState<ThaiAddressValue>(() => createEmptyThaiAddressValue());
  const [checkoutErrors, setCheckoutErrors] = useState<CheckoutErrors>({});
  const [submittedOrder, setSubmittedOrder] = useState<SubmittedOrder | null>(null);
  const [exitingProductIds, setExitingProductIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    let isCurrent = true;

    async function syncCart() {
      if (items.length === 0) {
        setError("");
        setCart(emptyCart);
        setIsLoading(false);
        return;
      }

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

  const shippingEstimate = estimateThailandPostShippingFee(cart.itemCount, addressValue.province, addressValue.postalCode);
  const cargoFee = shippingEstimate.fee;
  const total = cart.subtotal + cargoFee;
  const promptPayQrUrl = promptPayId ? `https://promptpay.io/${encodeURIComponent(promptPayId)}/${total.toFixed(2)}.png` : "";
  const formattedAddress = [
    checkoutForm.addressLine.trim(),
    addressValue.subdistrict ? `ตำบล/แขวง ${addressValue.subdistrict}` : "",
    addressValue.district ? `อำเภอ/เขต ${addressValue.district}` : "",
    addressValue.province ? `จังหวัด${addressValue.province}` : "",
    addressValue.postalCode,
  ]
    .filter(Boolean)
    .join(" ");
  const validateCheckoutForm = () => {
    const nextErrors: CheckoutErrors = {};
    const contact = checkoutForm.contact.trim();
    const phoneLikeContact = contact.replace(/[\s-]/g, "");

    if (checkoutForm.name.trim().length < 2) {
      nextErrors.name = t.cart.validation.name;
    }

    if (contact.length < 4) {
      nextErrors.contact = t.cart.validation.contactRequired;
    } else if (/^\d/.test(phoneLikeContact) && !/^[+0-9]{9,15}$/.test(phoneLikeContact)) {
      nextErrors.contact = t.cart.validation.contactFormat;
    }

    if (checkoutForm.addressLine.trim().length < 8) {
      nextErrors.addressLine = t.cart.validation.address;
    }

    if (!addressValue.province || !addressValue.district || !addressValue.subdistrict || !addressValue.postalCode) {
      nextErrors.addressLine = t.cart.validation.address;
    }

    if (!slipFile) {
      nextErrors.slipName = t.cart.validation.slip;
    }

    if (!promptPayId) {
      nextErrors.slipName = t.cart.promptPayMissing;
    }

    setCheckoutErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const canSubmitOrder = Boolean(promptPayId) && !isSubmittingOrder;

  const validateCheckoutStep = (step: CheckoutStep) => {
    const nextErrors: CheckoutErrors = {};
    const contact = checkoutForm.contact.trim();
    const phoneLikeContact = contact.replace(/[\s-]/g, "");

    if (step === "contact") {
      if (checkoutForm.name.trim().length < 2) {
        nextErrors.name = t.cart.validation.name;
      }

      if (contact.length < 4) {
        nextErrors.contact = t.cart.validation.contactRequired;
      } else if (/^\d/.test(phoneLikeContact) && !/^[+0-9]{9,15}$/.test(phoneLikeContact)) {
        nextErrors.contact = t.cart.validation.contactFormat;
      }
    }

    if (step === "address") {
      if (checkoutForm.addressLine.trim().length < 8 || !addressValue.province || !addressValue.district || !addressValue.subdistrict || !addressValue.postalCode) {
        nextErrors.addressLine = t.cart.validation.address;
      }
    }

    if (step === "payment") {
      if (!slipFile) {
        nextErrors.slipName = t.cart.validation.slip;
      }

      if (!promptPayId) {
        nextErrors.slipName = t.cart.promptPayMissing;
      }
    }

    setCheckoutErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goToNextCheckoutStep = () => {
    if (!validateCheckoutStep(checkoutStep)) {
      return;
    }

    setCheckoutStep((currentStep) => (currentStep === "contact" ? "address" : currentStep === "address" ? "payment" : "payment"));
  };

  const goToPreviousCheckoutStep = () => {
    setCheckoutErrors({});
    setCheckoutStep((currentStep) => (currentStep === "payment" ? "address" : currentStep === "address" ? "contact" : "contact"));
  };

  const updateCheckoutField = (field: keyof CheckoutForm, value: string) => {
    setCheckoutForm((currentForm) => ({ ...currentForm, [field]: value }));
    setCheckoutErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
  };

  const updateThailandAddress = (value: ThaiAddressValue) => {
    setAddressValue(value);
    setCheckoutErrors((currentErrors) => ({ ...currentErrors, addressLine: undefined }));
  };

  const updateCartLineQuantity = (productId: string, quantity: number) => {
    if (quantity > 0) {
      updateQuantity(productId, quantity);
      return;
    }

    setExitingProductIds((currentIds) => new Set(currentIds).add(productId));

    window.setTimeout(() => {
      updateQuantity(productId, 0);
      setExitingProductIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.delete(productId);
        return nextIds;
      });
    }, 180);
  };

  const updateSlipFile = (file: File | null) => {
    if (!file) {
      setSlipFile(null);
      updateCheckoutField("slipName", "");
      setCheckoutErrors((currentErrors) => ({ ...currentErrors, slipName: t.cart.validation.slip }));
      return;
    }

    if (!file.type.startsWith("image/")) {
      setSlipFile(null);
      updateCheckoutField("slipName", "");
      setCheckoutErrors((currentErrors) => ({ ...currentErrors, slipName: t.cart.slipInvalidType }));
      showAppToast({ message: t.cart.slipInvalidType, variant: "error" });
      return;
    }

    if (file.size > MAX_SLIP_SIZE_BYTES) {
      setSlipFile(null);
      updateCheckoutField("slipName", "");
      setCheckoutErrors((currentErrors) => ({ ...currentErrors, slipName: t.cart.slipTooLarge }));
      showAppToast({ message: t.cart.slipTooLarge, variant: "error" });
      return;
    }

    setSlipFile(file);
    updateCheckoutField("slipName", file.name);
    setCheckoutErrors((currentErrors) => ({ ...currentErrors, slipName: undefined }));
  };

  const submitOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateCheckoutForm() || !slipFile || isSubmittingOrder) {
      return;
    }

    try {
      setIsSubmittingOrder(true);

      const formData = new FormData();
      formData.append("name", checkoutForm.name);
      formData.append("contact", checkoutForm.contact);
      formData.append("address", formattedAddress);
      formData.append("items", JSON.stringify(items));
      formData.append("shippingFee", String(cargoFee));
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
    <main className="mx-auto min-h-screen max-w-md px-5 pb-28 md:max-w-3xl md:px-8 lg:max-w-4xl">
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

      {error ? <p className="motion-error-enter mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}

      <section className="mt-7 grid gap-3 md:grid-cols-2" aria-live="polite">
        {isLoading ? (
          <div className="rounded-[28px] border border-beige/55 bg-cream px-5 py-9 text-center text-[15px] font-medium leading-6 text-muted shadow-soft md:col-span-2">
            {t.cart.loading}
          </div>
        ) : cart.lines.length > 0 ? (
          cart.lines.map((line, index) => {
            const packageColor = productColors[index % productColors.length];
            const isExiting = exitingProductIds.has(line.product.id);

            return (
              <article
                key={line.product.id}
                className={`cart-line-enter grid grid-cols-[6.25rem_1fr] gap-4 rounded-[28px] border border-beige/55 bg-cream p-3 shadow-[0_14px_34px_rgba(74,67,59,0.08)] ${
                  isExiting ? "cart-line-exit pointer-events-none" : ""
                }`}
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
                        className="grid h-11 w-11 place-items-center text-ink transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.9] disabled:opacity-45"
                        aria-label={t.cart.decreaseQuantity(line.product.name)}
                        disabled={isExiting}
                        onClick={() => updateCartLineQuantity(line.product.id, line.quantity - 1)}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span key={`${line.product.id}-${line.quantity}`} className="quantity-pop min-w-8 text-center text-sm font-semibold text-ink">{line.quantity}</span>
                      <button
                        type="button"
                        className="grid h-11 w-11 place-items-center text-ink transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.9] disabled:opacity-45"
                        aria-label={t.cart.increaseQuantity(line.product.name)}
                        disabled={isExiting}
                        onClick={() => updateCartLineQuantity(line.product.id, line.quantity + 1)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="grid h-11 w-11 place-items-center rounded-full bg-stone-100 text-muted transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.92] disabled:opacity-45"
                      aria-label={t.cart.remove(line.product.name)}
                      disabled={isExiting}
                      onClick={() => updateCartLineQuantity(line.product.id, 0)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-[30px] border border-beige/55 bg-cream px-6 py-11 text-center shadow-soft md:col-span-2">
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
        <section className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-beige/60 bg-cream/95 px-5 pb-5 pt-4 backdrop-blur md:max-w-3xl md:px-8 lg:max-w-4xl">
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
        <section className="checkout-panel-enter fixed inset-0 z-50 mx-auto flex h-[100dvh] w-full max-w-md flex-col bg-cream md:inset-y-6 md:h-auto md:max-w-2xl md:rounded-[32px] md:shadow-[0_24px_70px_rgba(74,67,59,0.18)]" aria-label={t.cart.checkoutTitle} aria-modal="true" role="dialog">
          <div className="flex shrink-0 items-center justify-between border-b border-beige/45 px-5 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)]">
            <h2 className="text-[1.65rem] font-semibold leading-none text-ink">{submittedOrder ? t.cart.orderSubmitted : t.cart.checkoutTitle}</h2>
            <button type="button" className="grid h-11 w-11 place-items-center rounded-full bg-stone-100 text-ink transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.94]" aria-label={t.filters.close} onClick={() => setIsCheckoutOpen(false)}>
              <X className="h-5 w-5" strokeWidth={2.2} />
            </button>
          </div>

          {submittedOrder ? (
            <div className="checkout-step-enter flex flex-1 flex-col items-center justify-center px-6 text-center">
              <div className="add-success-pop grid h-16 w-16 place-items-center rounded-full bg-[#E8F3EA] text-[#2C7A46]">
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
            <form className="min-h-0 flex-1 overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-5" noValidate onSubmit={submitOrder}>
              <div className="grid grid-cols-3 gap-2" aria-label={t.cart.checkoutProgress}>
                {(["contact", "address", "payment"] as CheckoutStep[]).map((step, index) => {
                  const isActive = checkoutStep === step;
                  const isDone =
                    (checkoutStep === "address" && step === "contact") ||
                    (checkoutStep === "payment" && (step === "contact" || step === "address"));

                  return (
                    <div key={step} className={`rounded-full px-2 py-2 text-center text-[12px] font-semibold transition-colors duration-200 ease-[var(--ease-out-ui)] ${isActive || isDone ? "bg-ink text-cream" : "bg-stone-100 text-muted"}`}>
                      {index + 1}. {t.cart.steps[step]}
                    </div>
                  );
                })}
              </div>

              {checkoutStep === "contact" ? (
                <section key="contact" className="checkout-step-enter mt-6">
                  <h3 className="text-base font-semibold text-ink">{t.cart.contactTitle}</h3>
                  <div className="mt-4 space-y-3">
                    <div>
                      <input
                        aria-invalid={Boolean(checkoutErrors.name)}
                        aria-describedby={checkoutErrors.name ? "checkout-name-error" : undefined}
                        className={`min-h-12 w-full rounded-2xl border bg-cream px-4 text-[15px] font-medium text-ink outline-none transition-colors duration-200 ease-[var(--ease-out-ui)] placeholder:text-muted focus:border-blue/80 ${
                          checkoutErrors.name ? "border-red-300 bg-red-50/45" : "border-beige/60"
                        }`}
                        placeholder={t.cart.customerName}
                        value={checkoutForm.name}
                        onChange={(event) => updateCheckoutField("name", event.target.value)}
                      />
                      {checkoutErrors.name ? <p id="checkout-name-error" className="motion-error-enter mt-2 text-[13px] font-medium leading-5 text-red-700">{checkoutErrors.name}</p> : null}
                    </div>
                    <div>
                      <input
                        aria-invalid={Boolean(checkoutErrors.contact)}
                        aria-describedby={checkoutErrors.contact ? "checkout-contact-error" : undefined}
                        className={`min-h-12 w-full rounded-2xl border bg-cream px-4 text-[15px] font-medium text-ink outline-none transition-colors duration-200 ease-[var(--ease-out-ui)] placeholder:text-muted focus:border-blue/80 ${
                          checkoutErrors.contact ? "border-red-300 bg-red-50/45" : "border-beige/60"
                        }`}
                        inputMode="tel"
                        placeholder={t.cart.customerContact}
                        value={checkoutForm.contact}
                        onChange={(event) => updateCheckoutField("contact", event.target.value)}
                      />
                      {checkoutErrors.contact ? <p id="checkout-contact-error" className="motion-error-enter mt-2 text-[13px] font-medium leading-5 text-red-700">{checkoutErrors.contact}</p> : null}
                    </div>
                  </div>
                </section>
              ) : null}

              {checkoutStep === "address" ? (
                <section key="address" className="checkout-step-enter mt-6">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-ink">{t.cart.shippingAddress}</h3>
                    <div className="inline-flex rounded-full border border-beige/55 bg-cream p-0.5">
                      {(["home", "work"] as const).map((label) => (
                        <button
                          key={label}
                          type="button"
                          className={`min-h-8 rounded-full px-3 text-[13px] font-semibold transition duration-200 ease-[var(--ease-out-ui)] active:scale-[0.96] ${
                            checkoutForm.addressLabel === label ? "bg-blue/80 text-ink shadow-[0_1px_6px_rgba(74,67,59,0.08)]" : "text-muted"
                          }`}
                          onClick={() => updateCheckoutField("addressLabel", label)}
                        >
                          {label === "home" ? t.cart.addressHome : t.cart.addressWork}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <textarea
                      aria-invalid={Boolean(checkoutErrors.addressLine)}
                      aria-describedby={checkoutErrors.addressLine ? "checkout-address-error" : undefined}
                      className={`min-h-20 w-full resize-none rounded-2xl border bg-cream px-4 py-3 text-[15px] font-medium leading-6 text-ink outline-none transition-colors duration-200 ease-[var(--ease-out-ui)] placeholder:text-muted focus:border-blue/80 ${
                        checkoutErrors.addressLine ? "border-red-300 bg-red-50/45" : "border-beige/60"
                      }`}
                      placeholder={t.cart.addressLine}
                      value={checkoutForm.addressLine}
                      onChange={(event) => updateCheckoutField("addressLine", event.target.value)}
                    />
                  </div>

                  <ThaiAddressFields
                    labels={{
                      district: t.cart.districtPlaceholder,
                      postalCode: t.cart.postalCodePlaceholder,
                      province: t.cart.provincePlaceholder,
                      subdistrict: t.cart.subdistrictPlaceholder,
                    }}
                    value={addressValue}
                    onChange={updateThailandAddress}
                  />

                  {checkoutErrors.addressLine ? <p id="checkout-address-error" className="motion-error-enter mt-2 text-[13px] font-medium leading-5 text-red-700">{checkoutErrors.addressLine}</p> : null}

                  <div className="mt-4 rounded-[24px] border border-beige/55 bg-[#FDFBF7] p-4">
                    <div className="flex items-start gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-stone-100 text-ink">
                        {checkoutForm.addressLabel === "home" ? <Home className="h-4.5 w-4.5" /> : <MapPin className="h-4.5 w-4.5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink">{cargoFee > 0 ? formatPrice(cargoFee) : t.cart.tbc}</p>
                        <p className="mt-1 text-[13px] font-medium leading-5 text-muted">{shippingEstimate.note}</p>
                      </div>
                    </div>
                  </div>
                </section>
              ) : null}

              {checkoutStep === "payment" ? (
                <section key="payment" className="checkout-step-enter mt-6">
                  <div className="rounded-[24px] border border-beige/55 bg-[#FDFBF7] p-4">
                    <div className="flex justify-between text-sm text-muted">
                      <span>{t.cart.subtotal}</span>
                      <span>{formatPrice(cart.subtotal)}</span>
                    </div>
                    <div className="mt-2 flex justify-between text-sm text-muted">
                      <span>{t.cart.cargoEstimate}</span>
                      <span>{formatPrice(cargoFee)}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-beige/45 pt-3 text-ink">
                      <span className="font-semibold">{t.cart.total}</span>
                      <span className="text-2xl font-semibold">{formatPrice(total)}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-end justify-between gap-4">
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
                  {checkoutErrors.slipName ? <p className="motion-error-enter mt-2 text-[13px] font-medium leading-5 text-red-700">{checkoutErrors.slipName}</p> : null}
                  <p className="mt-2 text-[13px] font-medium leading-5 text-muted">{t.cart.slipRequirement}</p>
                </section>
              ) : null}

              <div className="mt-6 grid grid-cols-[0.9fr_1.1fr] gap-3">
                <button
                  type="button"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-beige/70 bg-cream px-4 py-3 text-sm font-semibold text-ink transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.98] disabled:opacity-45"
                  disabled={checkoutStep === "contact"}
                  onClick={goToPreviousCheckoutStep}
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={2.3} />
                  {t.cart.backStep}
                </button>
                {checkoutStep === "payment" ? (
                  <button
                    type="submit"
                    className="min-h-12 rounded-2xl bg-ink px-5 py-3.5 text-sm font-semibold text-cream transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.98] disabled:opacity-45"
                    disabled={!canSubmitOrder}
                  >
                    {isSubmittingOrder ? t.products.addStates.adding : t.cart.submitOrder}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="min-h-12 rounded-2xl bg-ink px-5 py-3.5 text-sm font-semibold text-cream transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.98]"
                    onClick={goToNextCheckoutStep}
                  >
                    {t.cart.nextStep}
                  </button>
                )}
              </div>
            </form>
          )}
        </section>
      ) : null}
    </main>
  );
}
