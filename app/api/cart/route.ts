import { NextResponse } from "next/server";
import { buildCartSummary, normalizeCartItems } from "@/lib/cart";
import { fetchSheetProducts } from "@/lib/google-sheet-products";

export async function GET() {
  return NextResponse.json({
    lines: [],
    itemCount: 0,
    subtotal: 0,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const products = await fetchSheetProducts();
    const items = normalizeCartItems(body?.items);

    return NextResponse.json(buildCartSummary(products, items));
  } catch {
    return NextResponse.json({ error: "Invalid cart payload" }, { status: 400 });
  }
}
