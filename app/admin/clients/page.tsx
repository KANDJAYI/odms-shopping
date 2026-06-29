import type { Metadata } from "next";
import { getAdminProfiles } from "@/lib/supabase/queries";
import ClientsContent from "./ClientsContent";

export const metadata: Metadata = { title: "Gestion clients" };

export default async function AdminClientsPage() {
  const profiles = await getAdminProfiles();
  const customers = profiles.filter((p) => p.role === "customer");
  return <ClientsContent customers={customers} />;
}
