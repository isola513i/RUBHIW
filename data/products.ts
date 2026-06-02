export type ProductCategory = string;

export type Product = {
  id: string;
  category: ProductCategory;
  brand: string;
  name: string;
  description: string;
  price_full: number;
  price_sale: number | null;
  status: string;
  image_url: string;
};

export type CategoryFilter = string;

export const mockProducts: Product[] = [
  {
    id: "KSK-BOJ-001",
    category: "Skincare",
    brand: "Beauty of Joseon",
    name: "Relief Sun Rice SPF50+",
    description: "Lightweight sunscreen",
    price_full: 590,
    price_sale: 490,
    status: "รอของ 15 วัน",
    image_url: "",
  },
  {
    id: "KMK-ROM-014",
    category: "Makeup",
    brand: "Rom&nd",
    name: "Juicy Lasting Tint Bare Grape",
    description: "Glossy tint",
    price_full: 350,
    price_sale: null,
    status: "น้ำหนัก 0.1kg",
    image_url: "",
  },
  {
    id: "KSN-LOT-022",
    category: "Snacks",
    brand: "Lotte",
    name: "Choco Pie Original 12 Pack",
    description: "Classic chocolate snack",
    price_full: 210,
    price_sale: 189,
    status: "น้ำหนัก 0.5kg",
    image_url: "",
  },
  {
    id: "KSK-ANU-006",
    category: "Skincare",
    brand: "Anua",
    name: "Heartleaf 77 Soothing Toner",
    description: "Calming toner",
    price_full: 690,
    price_sale: null,
    status: "รอของ 10 วัน",
    image_url: "",
  },
];
