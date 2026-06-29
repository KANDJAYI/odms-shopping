"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { adminCreateProduct, adminUpdateProduct } from "@/lib/supabase/actions";
import ImageUploadField from "@/components/admin/ImageUploadField";
import type { Product, Category, Brand } from "@/types";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "active", label: "Actif" },
  { value: "draft", label: "Brouillon" },
  { value: "out_of_stock", label: "Rupture" },
  { value: "hidden", label: "Masqué" },
];

export default function ProductForm({
  product,
  categories,
  brands,
}: {
  product?: Product | null;
  categories: Category[];
  brands: Brand[];
}) {
  const isEdit = !!product;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const action = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const res = isEdit
        ? await adminUpdateProduct(product!.id, formData)
        : await adminCreateProduct(formData);
      if (res?.error) setError(res.error);
      else {
        router.push("/admin/produits");
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#0F172A] transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">{isEdit ? "Modifier le produit" : "Nouveau produit"}</h1>
          <p className="text-sm text-[#64748B] mt-0.5">{isEdit ? product!.name : "Renseignez les informations du produit"}</p>
        </div>
      </div>

      <form action={action} className="grid lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Informations générales">
            <Field label="Nom du produit" name="name" defaultValue={product?.name} placeholder="Nike Air Max 270" required />
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Description courte</label>
              <input name="short_description" defaultValue={product?.short_description ?? ""} placeholder="Une ligne d'accroche" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Description complète</label>
              <textarea name="description" defaultValue={product?.description ?? ""} rows={5} placeholder="Description détaillée du produit…" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green transition-colors resize-none" />
            </div>
          </Card>

          <Card title="Prix & stock">
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Prix actuel (FCFA)" name="current_price" type="number" defaultValue={product ? String(product.current_price) : ""} placeholder="65000" required />
              <Field label="Ancien prix (FCFA)" name="old_price" type="number" defaultValue={product?.old_price ? String(product.old_price) : ""} placeholder="80000" />
              <Field label="Stock" name="stock_quantity" type="number" defaultValue={product ? String(product.stock_quantity) : "0"} placeholder="10" />
            </div>
            <Field label="SKU (référence)" name="sku" defaultValue={product?.sku ?? ""} placeholder="NK-AM270-42" />
          </Card>

          <Card title="Référencement (SEO)">
            <Field label="Titre SEO" name="seo_title" defaultValue={product?.seo_title ?? ""} placeholder="Nike Air Max 270 au Gabon | Odm's Shopping" />
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Description SEO</label>
              <textarea name="seo_description" defaultValue={product?.seo_description ?? ""} rows={2} placeholder="Description pour les moteurs de recherche…" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green transition-colors resize-none" />
            </div>
          </Card>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          <Card title="Image principale">
            <ImageUploadField name="main_image_url" bucket="products" label="Image" defaultValue={product?.main_image_url} />
          </Card>

          <Card title="Organisation">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Catégorie</label>
              <select name="category_id" defaultValue={product?.category_id ?? ""} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green bg-white">
                <option value="">— Aucune —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Marque</label>
              <select name="brand_id" defaultValue={product?.brand_id ?? ""} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green bg-white">
                <option value="">— Aucune —</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Statut</label>
              <select name="status" defaultValue={product?.status ?? "active"} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green bg-white">
                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </Card>

          <Card title="Mise en avant">
            <Checkbox name="is_featured" label="Produit vedette" defaultChecked={product?.is_featured} />
            <Checkbox name="is_new" label="Nouveauté" defaultChecked={product?.is_new} />
            <Checkbox name="is_promo" label="En promotion" defaultChecked={product?.is_promo} />
          </Card>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-col gap-2">
            <button type="submit" disabled={pending} className="bg-green hover:bg-[#15803d] disabled:opacity-60 text-white text-sm font-semibold px-5 py-3 rounded-lg transition-colors">
              {pending ? "Enregistrement…" : isEdit ? "Enregistrer les modifications" : "Créer le produit"}
            </button>
            <button type="button" onClick={() => router.push("/admin/produits")} className="text-text-secondary text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              Annuler
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
      <h2 className="font-semibold text-[#0F172A] mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, name, type = "text", placeholder, required, defaultValue }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean; defaultValue?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#0F172A] mb-1.5">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <input name={name} type={type} placeholder={placeholder} required={required} defaultValue={defaultValue} min={type === "number" ? 0 : undefined} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green transition-colors" />
    </div>
  );
}

function Checkbox({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer">
      <input type="checkbox" name={name} value="true" defaultChecked={defaultChecked} className="w-4 h-4 rounded border-gray-300 text-green focus:ring-green accent-green" />
      <span className="text-sm text-[#0F172A]">{label}</span>
    </label>
  );
}
