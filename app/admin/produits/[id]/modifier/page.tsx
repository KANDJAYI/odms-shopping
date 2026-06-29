import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminProductById, getAllCategories, getAllBrands } from "@/lib/supabase/queries";
import ProductForm from "../../ProductForm";

export const metadata: Metadata = { title: "Modifier le produit" };

export default async function ModifierProduitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories, brands] = await Promise.all([
    getAdminProductById(id),
    getAllCategories(),
    getAllBrands(),
  ]);

  if (!product) notFound();

  return <ProductForm product={product} categories={categories} brands={brands} />;
}
