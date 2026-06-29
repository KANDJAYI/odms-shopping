"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Plus, Pencil, Award, X } from "lucide-react";
import { adminCreateBrand, adminUpdateBrand, adminDeleteBrand } from "@/lib/supabase/actions";
import DeleteForm from "@/components/admin/DeleteForm";
import ImageUploadField from "@/components/admin/ImageUploadField";
import type { Brand } from "@/types";

export default function MarquesContent({ brands }: { brands: Brand[] }) {
  const [editing, setEditing] = useState<Brand | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">Marques</h1>
          <p className="text-text-secondary text-sm mt-0.5">{brands.length} marques</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-green hover:bg-[#15803d] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} /> Ajouter une marque
        </button>
      </div>

      {brands.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-16 text-center">
          <Award size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="font-semibold text-[#0F172A] mb-1">Aucune marque</p>
          <p className="text-text-secondary text-sm">Ajoutez votre première marque.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {brands.map((brand) => (
            <div key={brand.id} className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 text-center group">
              <div className="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-3 overflow-hidden">
                {brand.logo_url ? (
                  <Image src={brand.logo_url} alt={brand.name} width={56} height={56} className="object-contain" />
                ) : (
                  <Award size={24} className="text-green" />
                )}
              </div>
              <p className="font-semibold text-[#0F172A] text-sm">{brand.name}</p>
              <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-2 ${brand.is_active ? "bg-green-50 text-green" : "bg-gray-100 text-gray-500"}`}>
                {brand.is_active ? "Actif" : "Inactif"}
              </span>
              <div className="flex items-center justify-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditing(brand)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#0F172A] transition-colors"
                  title="Modifier"
                >
                  <Pencil size={14} />
                </button>
                <DeleteForm action={adminDeleteBrand.bind(null, brand.id)} name={brand.name} iconSize={14} />
              </div>
            </div>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <BrandModal brand={editing} onClose={() => { setCreating(false); setEditing(null); }} />
      )}
    </div>
  );
}

function BrandModal({ brand, onClose }: { brand: Brand | null; onClose: () => void }) {
  const isEdit = !!brand;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const action = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const res = isEdit
        ? await adminUpdateBrand(brand!.id, formData)
        : await adminCreateBrand(formData);
      if (res?.error) setError(res.error);
      else onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-bold text-[#0F172A]">{isEdit ? "Modifier la marque" : "Nouvelle marque"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-[#0F172A] transition-colors"><X size={20} /></button>
        </div>

        <form action={action} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Nom<span className="text-red-500 ml-0.5">*</span></label>
            <input name="name" defaultValue={brand?.name} required placeholder="Nike" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green transition-colors" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Description</label>
            <textarea name="description" defaultValue={brand?.description ?? ""} rows={2} placeholder="Description courte…" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green transition-colors resize-none" />
          </div>

          <ImageUploadField name="logo_url" bucket="brands" label="Logo" defaultValue={brand?.logo_url} />

          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Statut</label>
            <select name="is_active" defaultValue={brand && !brand.is_active ? "false" : "true"} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green bg-white">
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={pending} className="bg-green hover:bg-[#15803d] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
              {pending ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer la marque"}
            </button>
            <button type="button" onClick={onClose} className="text-text-secondary text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}
