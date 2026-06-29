"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { MessageCircle, Search, Users, Ban, CheckCircle2 } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/utils";
import { adminToggleUserActive } from "@/lib/supabase/actions";
import type { Profile } from "@/types";

export default function ClientsContent({ customers }: { customers: Profile[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      [c.first_name, c.last_name, c.email, c.phone]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q))
    );
  }, [customers, query]);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">Clients</h1>
          <p className="text-text-secondary text-sm mt-0.5">{customers.length} clients enregistrés</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 w-56">
          <Search size={15} className="text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un client..."
            className="bg-transparent text-sm outline-none flex-1 text-[#0F172A]"
          />
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-16 text-center">
          <Users size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="font-semibold text-[#0F172A] mb-2">Aucun client</p>
          <p className="text-text-secondary text-sm">Les clients apparaîtront ici après inscription</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Client", "Téléphone", "Statut", "Membre depuis", "Actions"].map((h) => (
                    <th key={h} className="text-left text-xs text-text-secondary font-medium py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center text-text-secondary text-sm">Aucun client ne correspond à « {query} ».</td></tr>
                ) : filtered.map((c) => <ClientRow key={c.id} client={c} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ClientRow({ client }: { client: Profile }) {
  const [active, setActive] = useState(client.is_active);
  const [pending, startTransition] = useTransition();

  const initials = [client.first_name, client.last_name]
    .filter(Boolean)
    .map((n) => n![0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";
  const displayName = [client.first_name, client.last_name].filter(Boolean).join(" ") || "Utilisateur";

  const toggle = () => {
    const next = !active;
    if (!next && !confirm(`Bloquer ${displayName} ? Le client ne pourra plus se connecter.`)) return;
    setActive(next);
    startTransition(() => { adminToggleUserActive(client.id, next); });
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">{initials}</div>
          <div>
            <p className="text-sm font-medium text-[#0F172A]">{displayName}</p>
            <p className="text-xs text-text-secondary">{client.email ?? "—"}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4"><span className="text-sm text-text-secondary">{client.phone ?? "—"}</span></td>
      <td className="py-3 px-4">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${active ? "bg-green-50 text-green" : "bg-red-50 text-red-600"}`}>
          {active ? "Actif" : "Bloqué"}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-text-secondary">
          {new Date(client.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1">
          {client.phone && (
            <Link
              href={getWhatsAppUrl(`Bonjour ${client.first_name ?? ""}`)}
              target="_blank"
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#25D366] transition-colors"
              title="WhatsApp"
            >
              <MessageCircle size={15} />
            </Link>
          )}
          <button
            onClick={toggle}
            disabled={pending}
            className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-60 ${active ? "text-red-500 hover:bg-red-50" : "text-green hover:bg-green-50"}`}
            title={active ? "Bloquer le client" : "Débloquer le client"}
          >
            {active ? <><Ban size={13} /> Bloquer</> : <><CheckCircle2 size={13} /> Débloquer</>}
          </button>
        </div>
      </td>
    </tr>
  );
}
