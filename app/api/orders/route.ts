import { NextResponse } from "next/server";
import { buildCartSummary, normalizeCartItems } from "@/lib/cart";
import { createGoogleSheetOrder } from "@/lib/google-order-service";
import { fetchSheetProducts } from "@/lib/google-sheet-products";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_SLIP_SIZE_BYTES = 5 * 1024 * 1024;
const allowedSlipTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedSlipExtensions = new Set(["jpg", "jpeg", "png", "webp"]);

async function validateSlipFile(slip: File) {
  if (slip.size === 0 || slip.size > MAX_SLIP_SIZE_BYTES || !allowedSlipTypes.has(slip.type)) {
    return false;
  }

  const extension = slip.name.includes(".") ? slip.name.split(".").pop()?.toLowerCase() : "";

  if (!extension || !allowedSlipExtensions.has(extension)) {
    return false;
  }

  const header = new Uint8Array(await slip.slice(0, 12).arrayBuffer());
  const isJpeg = header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
  const isPng = header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47;
  const isWebp =
    header[0] === 0x52 &&
    header[1] === 0x49 &&
    header[2] === 0x46 &&
    header[3] === 0x46 &&
    header[8] === 0x57 &&
    header[9] === 0x45 &&
    header[10] === 0x42 &&
    header[11] === 0x50;

  return (slip.type === "image/jpeg" && isJpeg) || (slip.type === "image/png" && isPng) || (slip.type === "image/webp" && isWebp);
}

export async function POST(request: Request) {
  try {
    const rateLimitResponse = checkRateLimit(request, "orders:create", { limit: 5, windowMs: 10 * 60 * 1000 });

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const formData = await request.formData();
    const customerName = String(formData.get("name") ?? "").trim();
    const contact = String(formData.get("contact") ?? "").trim();
    const address = String(formData.get("address") ?? "").trim();
    const items = normalizeCartItems(JSON.parse(String(formData.get("items") ?? "[]")));
    const slip = formData.get("slip");
    const promptPayId = process.env.NEXT_PUBLIC_PROMPTPAY_ID?.trim() ?? "";

    if (!customerName || !contact || !address || items.length === 0 || !(slip instanceof File) || !promptPayId) {
      return NextResponse.json({ error: "Invalid order payload" }, { status: 400 });
    }

    if (!(await validateSlipFile(slip))) {
      return NextResponse.json({ error: "Invalid slip file" }, { status: 400 });
    }

    const products = await fetchSheetProducts();
    const summary = buildCartSummary(products, items);

    if (summary.lines.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const order = await createGoogleSheetOrder({
      address,
      contact,
      customerName,
      promptPayId,
      slip,
      summary,
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("[orders] submit failed", error);
    return NextResponse.json({ error: "Order submission failed" }, { status: 500 });
  }
}
