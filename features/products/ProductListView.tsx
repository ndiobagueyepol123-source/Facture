"use client";

import React, { useState, useEffect } from "react";
import { Package, Search, Plus, Edit, Trash2, Sparkles, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useCurrency } from "@/providers/CurrencyProvider";
import { getProducts, createProduct, deleteProduct } from "@/lib/api/products";
import { Product } from "@/types";

export const ProductListView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const { activeCurrency, convertAndFormat } = useCurrency();

  // New product form state
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    type: "Service",
    price: 0,
    vatRate: 0,
    sku: "",
    unit: "unité",
    description: "",
  });

  const loadProducts = async () => {
    setIsLoading(true);
    const data = await getProducts();
    setProducts(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || prod.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Supprimer "${name}" du catalogue ?`)) {
      const ok = await deleteProduct(id);
      if (ok) {
        setProducts(products.filter((p) => p.id !== id));
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name?.trim()) return alert("Le nom est requis !");
    
    setIsSubmitting(true);
    const created = await createProduct({
      name: newProduct.name.trim(),
      type: (newProduct.type as "Produit" | "Service") || "Service",
      price: Number(newProduct.price) || 0,
      vatRate: Number(newProduct.vatRate) || 0,
      sku: newProduct.sku?.trim() || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      unit: newProduct.unit?.trim() || "unité",
      description: newProduct.description?.trim() || "",
      stock: newProduct.type === "Produit" ? (newProduct.stock ?? "10") : undefined,
    });
    
    setIsSubmitting(false);

    if (created) {
      setProducts([created, ...products]);
      setShowAddModal(false);
      setNewProduct({
        name: "",
        type: "Service",
        price: 0,
        vatRate: 0,
        sku: "",
        unit: "unité",
        description: "",
      });
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Catalogue & Prestations</h1>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Gérez vos prestations et articles pour insertion instantanée dans vos documents.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-3.5 h-9 rounded-lg shadow-2xs flex items-center transition-all w-fit flex-shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
          <span>Nouvel article</span>
        </button>
      </div>

      {/* Unboxed Search & Tabs Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Type Pills */}
        <div className="flex items-center space-x-1 p-1 bg-slate-100/80 rounded-lg w-fit overflow-x-auto text-xs">
          {[
            { label: "Tous", value: "all" },
            { label: "Services (Honoraires)", value: "Service" },
            { label: "Produits (Stock)", value: "Produit" },
          ].map((tab) => {
            const isActive = filterType === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setFilterType(tab.value)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher nom ou SKU..."
            className="w-full pl-8 pr-3 py-1.5 h-8 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-xs font-medium text-slate-800 rounded-lg border border-slate-200/60 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Catalog Table */}
      <Card className="p-0 overflow-hidden border border-slate-200/80 shadow-2xs rounded-xl bg-white w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 bg-slate-50/70 uppercase tracking-wider">
                <th className="py-2.5 px-4">Code / SKU</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Désignation & Description</th>
                <th className="py-2.5 px-4">Prix Unitaire</th>
                <th className="py-2.5 px-4">TVA</th>
                <th className="py-2.5 px-4">Dispo</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    <span>Chargement de votre catalogue...</span>
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="py-2.5 px-4 font-mono text-xs font-bold text-slate-600 whitespace-nowrap">
                      {p.sku || "—"}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        p.type === "Service"
                          ? "bg-purple-50 text-purple-700 border border-purple-200/60"
                          : "bg-amber-50 text-amber-700 border border-amber-200/60"
                      }`}>
                        {p.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 max-w-[250px] truncate">
                      <p className="font-bold text-slate-900 truncate text-[13px]">{p.name}</p>
                      {p.description && <p className="text-[11px] text-slate-400 truncate font-normal">{p.description}</p>}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {convertAndFormat(p.price, "FCFA")} <span className="text-slate-400 font-normal text-[11px]">/ {p.unit || 'unité'}</span>
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-600 whitespace-nowrap">
                      {p.vatRate}%
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      {p.type === "Produit" ? (
                        <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                          {p.stock ?? 10} pce
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium italic">Illimité</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end space-x-1">
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id, p.name)}
                          title="Supprimer"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium text-xs">
                    <Package className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                    <p className="font-bold text-slate-700 text-sm">Aucun article ou prestation dans votre catalogue.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Cliquez sur « Nouvel article » pour ajouter votre premier produit ou service.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="py-2 px-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>Affichage de <strong className="text-slate-800 font-bold">{filteredProducts.length}</strong> références.</span>
          <span>Prêt pour insertion rapide.</span>
        </div>
      </Card>

      {/* Modal Création Produit / Service */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <Card className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Nouveau Produit / Prestation
              </h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs font-semibold text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] mb-1 text-slate-500">Type d&apos;article *</label>
                  <select
                    value={newProduct.type}
                    onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value as "Produit" | "Service" })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                  >
                    <option value="Service">Service (Honoraires)</option>
                    <option value="Produit">Produit physique (Stock)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] mb-1 text-slate-500">Code SKU / Réf.</label>
                  <input
                    type="text"
                    placeholder="Ex: SRV-001"
                    value={newProduct.sku || ""}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] mb-1 text-slate-500">Désignation / Titre *</label>
                <input
                  type="text"
                  placeholder="ex: Consultation Audit / Pack Licence"
                  required
                  value={newProduct.name || ""}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] mb-1 text-slate-500">Description courte</label>
                <textarea
                  rows={2}
                  placeholder="Détails de la prestation ou conditions..."
                  value={newProduct.description || ""}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] mb-1 text-slate-500">Prix ({activeCurrency})</label>
                  <input
                    type="number"
                    value={newProduct.price || ""}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] mb-1 text-slate-500">Unité</label>
                  <input
                    type="text"
                    value={newProduct.unit || "unité"}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] mb-1 text-slate-500">TVA (%)</label>
                  <input
                    type="number"
                    value={newProduct.vatRate || 0}
                    onChange={(e) => setNewProduct({ ...newProduct, vatRate: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)} className="font-semibold text-xs py-1.5 px-3">
                  Annuler
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting} className="font-bold text-xs px-4 py-1.5 rounded-lg bg-blue-600 text-white">
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                  <span>Enregistrer</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
