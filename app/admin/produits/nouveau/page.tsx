import type { Metadata } from "next";
import { getAllCategories, getAllBrands } from "@/lib/supabase/queries";
import ProductForm from "../ProductForm";

export const metadata: Metadata = { title: "Nouveau produit" };

export default async function NouveauProduitPage() {
  const [categories, brands] = await Promise.all([getAllCategories(), getAllBrands()]);
  return <ProductForm categories={categories} brands={brands} />;
}
