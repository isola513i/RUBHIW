import { fetchSheetProducts, getCategoryFilters } from "@/lib/google-sheet-products";
import { HomePage } from "@/components/HomePage";

export default async function Page() {
  const products = await fetchSheetProducts();
  const categories = getCategoryFilters(products);

  return <HomePage products={products} categories={categories} />;
}
