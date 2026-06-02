import Papa from "papaparse";
import { mockProducts, type Product } from "@/data/products";

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vST1xZbWxXoo-Vkf_reYvnvkeDNZrEGSm4JjVZ3mIjPWuLvkxULCS_xsIROFi5d7bWtQzsGb2tQSiP0/pub?gid=0&single=true&output=csv";

type SheetRow = {
  id?: string;
  หมวดหมู่?: string;
  แบรนด์?: string;
  ชื่อสินค้า?: string;
  สรรพคุณ?: string;
  ราคาเต็ม?: string;
  ราคาลด?: string;
  สถานะ?: string;
  "url รูป"?: string;
};

const toNumber = (value: string | undefined) => {
  if (!value) {
    return null;
  }

  const cleaned = value.replace(/[^0-9.-]/g, "");

  if (!cleaned) {
    return null;
  }

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeText = (value: string | undefined) => value?.trim() ?? "";

export function mapSheetRowToProduct(row: SheetRow): Product | null {
  const id = normalizeText(row.id);
  const category = normalizeText(row["หมวดหมู่"]);
  const brand = normalizeText(row["แบรนด์"]);
  const name = normalizeText(row["ชื่อสินค้า"]);

  if (!id || !category || !brand || !name) {
    return null;
  }

  return {
    id,
    category,
    brand,
    name,
    description: normalizeText(row["สรรพคุณ"]),
    price_full: toNumber(row["ราคาเต็ม"]) ?? 0,
    price_sale: toNumber(row["ราคาลด"]),
    status: normalizeText(row["สถานะ"]),
    image_url: normalizeText(row["url รูป"]),
  };
}

export async function fetchSheetProducts(): Promise<Product[]> {
  try {
    const response = await fetch(SHEET_CSV_URL, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sheet CSV: ${response.status}`);
    }

    const csvText = await response.text();
    const parsed = Papa.parse<SheetRow>(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
      throw new Error(parsed.errors[0]?.message ?? "CSV parse failed");
    }

    const products = parsed.data
      .map(mapSheetRowToProduct)
      .filter((product): product is Product => product !== null);

    return products.length > 0 ? products : mockProducts;
  } catch {
    return mockProducts;
  }
}

export function getCategoryFilters(products: Product[]) {
  const categorySet = new Set(products.map((product) => product.category).filter(Boolean));
  return ["All", ...categorySet] as string[];
}
