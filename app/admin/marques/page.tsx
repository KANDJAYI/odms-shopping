import type { Metadata } from "next";
import { getAllBrands } from "@/lib/supabase/queries";
import MarquesContent from "./MarquesContent";

export const metadata: Metadata = { title: "Gestion marques" };

export default async function AdminMarquesPage() {
  const brands = await getAllBrands();
  return <MarquesContent brands={brands} />;
}
