"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Plus, Pencil, Tag, X } from "lucide-react";
import { adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from "@/lib/supabase/actions";
import DeleteForm from "@/components/admin/DeleteForm";
import ImageUploadField from "@/components/admin/ImageUploadField";
import type { Category } from "@/types";

export default function CategoriesContent({ categories }: { categories: Category[] }) {
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">Catégories</h1>
          <p className="text-text-secondary text-sm mt-0.5">{categories.length} catégories</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-green hover:bg-[#15803d] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} /> Ajouter une catégorie
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Catégorie", "Slug", "Ordre", "Statut", "Actions"].map((h) => (
                  <th key={h} className="text-left text-xs text-text-secondary font-medium py-3 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-text-secondary text-sm">Aucune catégorie pour le moment.</td></tr>
              ) : categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-green/10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                        {cat.image_url ? (
                          <Image src={cat.image_url} alt={cat.name} width={36} height={36} className="object-cover w-full h-full" />
                        ) : (
                          <Tag size={15} className="text-green" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-[#0F172A]">{cat.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4"><span className="text-sm text-text-secondary">{cat.slug}</span></td>
                  <td className="py-3 px-4"><span className="text-sm text-text-secondary">{cat.sort_order}</span></td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cat.is_active ? "bg-green-50 text-green" : "bg-gray-100 text-gray-500"}`}>
                      {cat.is_active ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditing(cat)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#0F172A] transition-colors"
                        title="Modifier"
                      >
                        <Pencil size={15} />
                      </button>
                      <DeleteForm action={adminDeleteCategory.bind(null, cat.id)} name={cat.name} iconSize={15} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(creating || editing) && (
        <CategoryModal
          category={editing}
          categories={categories}
          onClose={() => { setCreating(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

function CategoryModal({ category, categories, onClose }: { category: Category | null; categories: Category[]; onClose: () => void }) {
  const isEdit = !!category;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const action = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const res = isEdit
        ? await adminUpdateCategory(category!.id, formData)
        : await adminCreateCategory(formData);
      if (res?.error) setError(res.error);
      else onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-bold text-[#0F172A]">{isEdit ? "Modifier la catégorie" : "Nouvelle catégorie"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-[#0F172A] transition-colors"><X size={20} /></button>
        </div>

        <form action={action} className="p-5 space-y-4">
          <Field label="Nom" name="name" defaultValue={category?.name} placeholder="Chaussures Homme" required />
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Description</label>
            <textarea name="description" defaultValue={category?.description ?? ""} rows={2} placeholder="Description courte…" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green transition-colors resize-none" />
          </div>

          <ImageUploadField name="image_url" bucket="categories" label="Image" defaultValue={category?.image_url} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Catégorie parente</label>
              <select name="parent_id" defaultValue={category?.parent_id ?? ""} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green bg-white">
                <option value="">Aucune</option>
                {categories.filter((c) => c.id !== category?.id).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <Field label="Ordre d'affichage" name="sort_order" type="number" defaultValue={String(category?.sort_order ?? 0)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Statut</label>
            <select name="is_active" defaultValue={category && !category.is_active ? "false" : "true"} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green bg-white">
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={pending} className="bg-green hover:bg-[#15803d] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
              {pending ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer la catégorie"}
            </button>
            <button type="button" onClick={onClose} className="text-text-secondary text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", placeholder, required, defaultValue }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean; defaultValue?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#0F172A] mb-1.5">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <input name={name} type={type} placeholder={placeholder} required={required} defaultValue={defaultValue} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green transition-colors" />
    </div>
  );
}
