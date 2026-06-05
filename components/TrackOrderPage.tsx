"use client";

import { FormEvent, useState } from "react";
import { Search } from "lucide-react";
import { Header } from "@/components/Header";
import { formatPrice } from "@/lib/product-ui";

type OrderStatus = {
  createdAt: string;
  customerName: string;
  itemCount: number;
  orderId: string;
  paymentStatus: string;
  status: string;
  total: number;
  trackingNumber: string;
};

type FieldErrors = {
  contact?: string;
  orderId?: string;
};

const paymentStatusLabels: Record<string, string> = {
  paid: "ชำระแล้ว",
  pending_review: "รอตรวจสลิป",
  refunded: "คืนเงินแล้ว",
  rejected: "สลิปไม่ถูกต้อง",
};

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [contact, setContact] = useState("");
  const [orders, setOrders] = useState<OrderStatus[]>([]);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateLookup = () => {
    const nextErrors: FieldErrors = {};
    const normalizedOrderId = orderId.trim().toUpperCase();
    const normalizedContact = contact.trim();

    if (!normalizedOrderId) {
      nextErrors.orderId = "กรุณากรอกเลขคำสั่งซื้อ";
    } else if (!/^RBW-[A-F0-9]{8}$/.test(normalizedOrderId)) {
      nextErrors.orderId = "เลขคำสั่งซื้อควรอยู่ในรูปแบบ RBW-12345678";
    }

    if (!normalizedContact) {
      nextErrors.contact = "กรุณากรอกเบอร์โทรหรือ LINE ที่ใช้สั่งซื้อ";
    } else if (normalizedContact.length < 4) {
      nextErrors.contact = "ข้อมูลติดต่อสั้นเกินไป";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitLookup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setOrders([]);

    if (isLoading || !validateLookup()) {
      return;
    }

    try {
      setIsLoading(true);
      const params = new URLSearchParams();

      params.set("contact", contact.trim());
      params.set("orderId", orderId.trim());

      const response = await fetch(`/api/orders/status?${params.toString()}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "ไม่พบคำสั่งซื้อ");
      }

      setOrders(Array.isArray(payload.orders) ? payload.orders : [payload as OrderStatus]);
    } catch (lookupError) {
      const message = lookupError instanceof Error ? lookupError.message : "ไม่สามารถตรวจสอบสถานะได้";
      setError(message === "Order not found" ? "ไม่พบคำสั่งซื้อนี้ กรุณาตรวจเลขคำสั่งซื้อและเบอร์/LINE" : message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderId = (value: string) => {
    setOrderId(value);
    setFieldErrors((currentErrors) => ({ ...currentErrors, orderId: undefined }));
  };

  const updateContact = (value: string) => {
    setContact(value);
    setFieldErrors((currentErrors) => ({ ...currentErrors, contact: undefined }));
  };

  return (
    <main className="mx-auto min-h-screen max-w-md px-5 pb-12">
      <Header />

      <section className="pt-7">
        <p className="text-sm font-semibold text-muted">ติดตามคำสั่งซื้อ</p>
        <h1 className="mt-2 text-[2rem] font-semibold leading-[1.12] tracking-normal text-ink">เช็กสถานะพรีออเดอร์</h1>
        <p className="mt-3 text-[15px] font-medium leading-7 text-muted">
          กรอกเลขคำสั่งซื้อพร้อมเบอร์โทรหรือ LINE ที่ใช้ตอนส่งคำสั่งซื้อ
        </p>
      </section>

      <form className="mt-7 space-y-3" noValidate onSubmit={submitLookup}>
        <div>
          <input
            aria-invalid={Boolean(fieldErrors.orderId)}
            className={`min-h-12 w-full rounded-2xl border bg-cream px-4 text-[15px] font-semibold uppercase text-ink outline-none placeholder:normal-case placeholder:text-muted ${
              fieldErrors.orderId ? "border-red-300 bg-red-50/35" : "border-beige/70"
            }`}
            inputMode="text"
            placeholder="เลขคำสั่งซื้อ เช่น RBW-12345678"
            value={orderId}
            onChange={(event) => updateOrderId(event.target.value)}
          />
          {fieldErrors.orderId ? <p className="mt-2 px-1 text-sm font-semibold text-red-700">{fieldErrors.orderId}</p> : null}
        </div>
        <div>
          <input
            aria-invalid={Boolean(fieldErrors.contact)}
            className={`min-h-12 w-full rounded-2xl border bg-cream px-4 text-[15px] font-semibold text-ink outline-none placeholder:text-muted ${
              fieldErrors.contact ? "border-red-300 bg-red-50/35" : "border-beige/70"
            }`}
            inputMode="text"
            placeholder="เบอร์โทรหรือ LINE"
            value={contact}
            onChange={(event) => updateContact(event.target.value)}
          />
          {fieldErrors.contact ? <p className="mt-2 px-1 text-sm font-semibold text-red-700">{fieldErrors.contact}</p> : null}
        </div>
        <button
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-3.5 text-sm font-semibold text-cream transition-transform duration-200 ease-[var(--ease-out-ui)] active:scale-[0.98] disabled:opacity-45"
          disabled={isLoading}
          type="submit"
        >
          <Search className="h-4 w-4" strokeWidth={2.3} />
          {isLoading ? "กำลังตรวจสอบ" : "ตรวจสอบสถานะ"}
        </button>
      </form>

      {error ? <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold leading-6 text-red-700">{error}</p> : null}

      {orders.length > 0 ? (
        <section className="mt-6 space-y-3">
          {orders.map((order) => (
            <article key={order.orderId} className="rounded-[28px] border border-beige/60 bg-cream p-5 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{order.orderId}</p>
                  <h2 className="mt-2 text-2xl font-semibold leading-tight text-ink">{order.status || "รอตรวจสอบ"}</h2>
                </div>
                <span className="rounded-full bg-[#E8F3EA] px-3 py-1 text-xs font-semibold text-[#2C7A46]">
                  {paymentStatusLabels[order.paymentStatus] ?? order.paymentStatus}
                </span>
              </div>

              <dl className="mt-6 space-y-3 text-[15px] font-medium">
                <div className="flex justify-between gap-4 text-muted">
                  <dt>ชื่อผู้รับ</dt>
                  <dd className="text-right text-ink">{order.customerName}</dd>
                </div>
                <div className="flex justify-between gap-4 text-muted">
                  <dt>วันที่สั่ง</dt>
                  <dd className="text-right text-ink">{formatDate(order.createdAt)}</dd>
                </div>
                <div className="flex justify-between gap-4 text-muted">
                  <dt>จำนวนสินค้า</dt>
                  <dd className="text-right text-ink">{order.itemCount} รายการ</dd>
                </div>
                <div className="flex justify-between gap-4 text-muted">
                  <dt>ยอดรวม</dt>
                  <dd className="text-right text-ink">{formatPrice(order.total)}</dd>
                </div>
                <div className="flex justify-between gap-4 text-muted">
                  <dt>เลขพัสดุ</dt>
                  <dd className="text-right text-ink">{order.trackingNumber || "ยังไม่มี"}</dd>
                </div>
              </dl>
            </article>
          ))}
        </section>
      ) : null}
    </main>
  );
}
