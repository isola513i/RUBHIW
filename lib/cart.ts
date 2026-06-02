import type { Product } from "@/data/products";

export type CartItemInput = {
  productId: string;
  quantity: number;
};

export type CartLine = {
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type CartSummary = {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
};

const normalizeQuantity = (quantity: unknown) => {
  const parsed = Number(quantity);

  if (!Number.isFinite(parsed)) {
    return 1;
  }

  return Math.min(Math.max(Math.trunc(parsed), 1), 99);
};

export function normalizeCartItems(items: unknown): CartItemInput[] {
  if (!Array.isArray(items)) {
    return [];
  }

  const mergedItems = new Map<string, number>();

  for (const item of items) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const productId = "productId" in item ? String(item.productId).trim() : "";

    if (!productId) {
      continue;
    }

    const quantity = normalizeQuantity("quantity" in item ? item.quantity : 1);
    mergedItems.set(productId, Math.min((mergedItems.get(productId) ?? 0) + quantity, 99));
  }

  return Array.from(mergedItems, ([productId, quantity]) => ({ productId, quantity }));
}

export function buildCartSummary(products: Product[], items: CartItemInput[]): CartSummary {
  const productsById = new Map(products.map((product) => [product.id, product]));
  const lines = items.flatMap((item) => {
    const product = productsById.get(item.productId);

    if (!product) {
      return [];
    }

    const unitPrice = product.price_sale ?? product.price_full;

    return [
      {
        product,
        quantity: item.quantity,
        unitPrice,
        subtotal: unitPrice * item.quantity,
      },
    ];
  });

  return {
    lines,
    itemCount: lines.reduce((total, line) => total + line.quantity, 0),
    subtotal: lines.reduce((total, line) => total + line.subtotal, 0),
  };
}
