import type { Metadata } from "next";
import { getAllCategories } from "@/lib/supabase/queries";
import CategoriesContent from "./CategoriesContent";

export const metadata: Metadata = { title: "Gestion catégories" };

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();
  return <CategoriesContent categories={categories} />;
}
