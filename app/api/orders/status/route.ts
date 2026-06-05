import { NextResponse } from "next/server";
import { getGoogleSheetOrderStatuses } from "@/lib/google-order-service";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ORDER_ID_PATTERN = /^RBW-[A-F0-9]{8}$/i;
const MAX_CONTACT_LENGTH = 80;

export async function GET(request: Request) {
  try {
    const rateLimitResponse = checkRateLimit(request, "orders:status", { limit: 20, windowMs: 10 * 60 * 1000 });

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId")?.trim() ?? "";
    const contact = searchParams.get("contact")?.trim() ?? "";

    if (!orderId || !contact || !ORDER_ID_PATTERN.test(orderId) || contact.length > MAX_CONTACT_LENGTH) {
      return NextResponse.json({ error: "Order id and contact are required" }, { status: 400 });
    }

    const orders = await getGoogleSheetOrderStatuses(orderId, contact);

    if (orders.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("[order-status] lookup failed", error);
    return NextResponse.json({ error: "Order status lookup failed" }, { status: 500 });
  }
}
