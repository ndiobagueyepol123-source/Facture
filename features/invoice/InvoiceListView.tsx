"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, ChevronRight, MoreVertical, Trash2, Eye, Settings2, Package, CalendarDays } from "lucide-react";
import { formatLocalTime, formatDate } from "@/lib/utils";
import { useCurrency } from "@/providers/CurrencyProvider";
import { getInvoices, deleteInvoice, deleteInvoices } from "@/lib/api/invoices";
import { Invoice } from "@/types";
import Link from "next/link";

export const InvoiceListView: React.FC = () => {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("Tout");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { activeCurrency, convertAndFormat, formatOnly, getConvertedAmount } = useCurrency();
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  
  // Menus & Modals
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.menu-container')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadInvoices = async () => {
    setIsLoading(true);
    const data = await getInvoices();
    setInvoices(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const thirtyDaysStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).getTime();
  
  const todayTotal = invoices
    .filter(inv => new Date(inv.issueDate).getTime() >= todayStart)
    .reduce((sum, inv) => sum + getConvertedAmount(inv.total, inv.currency), 0);
    
  const thirtyDaysTotal = invoices
    .filter(inv => new Date(inv.issueDate).getTime() >= thirtyDaysStart)
    .reduce((sum, inv) => sum + getConvertedAmount(inv.total, inv.currency), 0);

  const filteredInvoices = invoices.filter((inv) => {
    const productNames = inv.items?.map(i => i.description).join(" ").toLowerCase() || "";
    const matchesSearch = productNames.includes(searchQuery.toLowerCase()) ||
                          inv.number.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    const invTime = new Date(inv.issueDate).getTime();
    if (selectedFilter === "Aujourd'hui") return invTime >= todayStart;
    if (selectedFilter === "7 jours") {
      const sevenDaysStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
      return invTime >= sevenDaysStart;
    }
    if (selectedFilter === "30 jours") return invTime >= thirtyDaysStart;
    return true; // "Tout"
  });

  const filterTabs = ["Aujourd'hui", "7 jours", "30 jours", "Tout"];

  const isTotallyEmpty = invoices.length === 0;

  const handleToggleSelect = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDeleteSingle = async () => {
    if (deletingId) {
      await deleteInvoice(deletingId);
      await loadInvoices();
      setSelectedIds(new Set(Array.from(selectedIds).filter(id => id !== deletingId)));
      setDeletingId(null);
    }
  };

  const handleDeleteMultiple = async () => {
    await deleteInvoices(Array.from(selectedIds));
    await loadInvoices();
    setSelectedIds(new Set());
    setIsDeletingMultiple(false);
    setIsSelectionMode(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 animate-fade-in px-4 sm:px-0 relative">
      
      {/* Dialog: Delete Single */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Trash2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Supprimer cette vente ?</h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">Cette vente sera retirée de votre historique et de vos statistiques.</p>
            <div className="flex items-center gap-4">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-3 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">Annuler</button>
              <button onClick={handleDeleteSingle} className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-md shadow-rose-500/20 transition-all">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog: Delete Multiple */}
      {isDeletingMultiple && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Trash2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">
              Supprimer {selectedIds.size > 1 ? `les ${selectedIds.size} ventes sélectionnées` : `la vente sélectionnée`} ?
            </h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">Les ventes sélectionnées seront retirées de votre historique et de vos statistiques.</p>
            <div className="flex items-center gap-4">
              <button onClick={() => setIsDeletingMultiple(false)} className="flex-1 py-3 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">Annuler</button>
              <button onClick={handleDeleteMultiple} className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-md shadow-rose-500/20 transition-all">Supprimer</button>
            </div>
          </div>
        </div>
      )}



      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Mes ventes</h1>
          <p className="text-sm font-medium text-slate-500">
            Retrouvez simplement les ventes que vous avez enregistrées.
          </p>
        </div>
        {!isTotallyEmpty && (
          <div className="flex items-center gap-2 sm:gap-3">
            {!isSelectionMode ? (
              <>
                <Link href="/invoices/create" className="hidden sm:flex">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-base py-3.5 px-6 rounded-2xl shadow-lg shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center">
                    <Plus className="w-5 h-5 mr-1.5 stroke-[2.5]" />
                    <span>Nouvelle vente</span>
                  </button>
                </Link>
                <button 
                  onClick={() => setIsSelectionMode(true)}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm py-3 px-4 sm:px-6 rounded-xl shadow-sm transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Sélectionner
                </button>
                <button 
                  disabled
                  title="Sélectionnez des ventes pour supprimer"
                  className="p-3 bg-white border border-slate-200 rounded-xl text-slate-300 opacity-50 cursor-not-allowed transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <span className="font-bold text-slate-700 text-sm px-2">
                  {selectedIds.size} {selectedIds.size > 1 ? "sélectionnées" : "sélectionnée"}
                </span>
                <button 
                  onClick={() => setIsDeletingMultiple(true)}
                  disabled={selectedIds.size === 0}
                  className={`p-3 rounded-xl border transition-all duration-300 transform ${
                    selectedIds.size > 0 
                      ? "bg-white border-rose-200 text-rose-500 hover:bg-rose-50 hover:border-rose-300 hover:-translate-y-0.5 shadow-sm" 
                      : "bg-white border-slate-200 text-slate-300 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => {
                    setIsSelectionMode(false);
                    setSelectedIds(new Set());
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm py-3 px-4 sm:px-6 rounded-xl transition-colors"
                >
                  Annuler
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : isTotallyEmpty ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center max-w-2xl mx-auto mt-12">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">🧾</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-3">Aucune vente pour le moment</h2>
          <p className="text-base text-slate-500 mb-8">
            Enregistrez votre première vente pour la retrouver ici.
          </p>
          <Link href="/invoices/create">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-base py-4 px-8 rounded-2xl shadow-lg shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1">
              + Nouvelle vente
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Statistiques */}
          <div className="flex overflow-x-auto sm:grid sm:grid-cols-3 gap-3 sm:gap-6 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar snap-x">
            <div className="min-w-[200px] sm:min-w-0 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:-translate-y-1 hover:shadow-md hover:border-blue-500/30 transition-all duration-300 snap-start">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <span className="text-[11px] sm:text-sm font-bold text-slate-500 mb-1 sm:mb-2">Ventes aujourd'hui</span>
              <span className="text-xl sm:text-3xl font-black text-slate-900 group-hover:scale-[1.02] origin-left transition-transform duration-200">{formatOnly(todayTotal, activeCurrency).replace(',00', '')}</span>
            </div>
            <div className="min-w-[200px] sm:min-w-0 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:-translate-y-1 hover:shadow-md hover:border-blue-500/30 transition-all duration-300 snap-start">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <span className="text-[11px] sm:text-sm font-bold text-slate-500 mb-1 sm:mb-2">30 derniers jours</span>
              <span className="text-xl sm:text-3xl font-black text-slate-900 group-hover:scale-[1.02] origin-left transition-transform duration-200">{formatOnly(thirtyDaysTotal, activeCurrency).replace(',00', '')}</span>
            </div>
            <div className="min-w-[200px] sm:min-w-0 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:-translate-y-1 hover:shadow-md hover:border-blue-500/30 transition-all duration-300 snap-start">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <span className="text-[11px] sm:text-sm font-bold text-slate-500 mb-1 sm:mb-2">Nombre de ventes</span>
              <span className="text-xl sm:text-3xl font-black text-slate-900 group-hover:scale-[1.02] origin-left transition-transform duration-200">{invoices.length}</span>
            </div>
          </div>

          {/* Filtres et Recherche */}
          <div className="space-y-4">
            <div className="relative w-full">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit ou un reçu..."
                className="w-full pl-12 pr-12 py-3.5 text-sm font-medium text-slate-900 bg-white border border-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400 shadow-sm"
              />
              <button className="absolute right-2 top-2 p-1.5 bg-slate-50 rounded-full border border-slate-100 text-slate-500 hover:text-slate-700">
                <Settings2 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center justify-between px-1 overflow-x-auto no-scrollbar">
              {filterTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedFilter(tab)}
                  className={`text-[13px] font-bold px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                    selectedFilter === tab
                      ? "bg-[#F0F7FF] text-blue-600"
                      : "text-slate-500 bg-transparent hover:text-slate-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Liste */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-2 sm:p-3">
            {filteredInvoices.length === 0 ? (
              <div className="p-12 text-center text-slate-500">Aucun résultat trouvé pour ces critères.</div>
            ) : (
                <div className="flex flex-col gap-3">
                  {filteredInvoices.map((inv, idx) => {
                    const productSummary = inv.items?.map(i => `${i.description} × ${i.quantity}`).join(", ") || "Vente diverse";
                    const isSelected = selectedIds.has(inv.id);
                    
                    // Rotation des styles d'icônes
                    const iconStyles = [
                      { bg: "bg-[#F3F8FF]", color: "text-blue-500" },
                      { bg: "bg-[#F0FDF4]", color: "text-emerald-500" },
                      { bg: "bg-[#FFF7ED]", color: "text-amber-500" },
                    ];
                    const style = iconStyles[idx % iconStyles.length];

                    return (
                      <div 
                        key={inv.id} 
                        onClick={() => {
                          if (isSelectionMode) {
                            handleToggleSelect(inv.id);
                          } else {
                            router.push(`/invoices/${inv.id}`);
                          }
                        }}
                        className={`flex items-center justify-between gap-3 p-4 rounded-3xl cursor-pointer transition-all relative group
                          ${isSelected 
                            ? 'bg-blue-50/10 md:bg-blue-50/40 border-blue-500 ring-2 ring-blue-500 shadow-blue-500/20' 
                            : 'bg-white hover:bg-slate-50/50 border-slate-100'
                          } 
                          border shadow-sm active:scale-[0.98]`}
                      >
                        {/* Checkbox Overlay */}
                        {isSelectionMode && (
                          <div 
                            className="absolute top-1/2 -translate-y-1/2 -left-3 z-10 bg-white rounded-full p-1 shadow-md" 
                            onClick={(e) => handleToggleSelect(inv.id, e)}
                          >
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                              {isSelected && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${style.bg} ${style.color}`}>
                            <Package className="w-5 h-5 stroke-[2]" />
                          </div>
                          <div>
                            <p className="font-black text-[13px] text-slate-900">
                              N° {inv.number}
                            </p>
                            <p className="text-[11px] font-bold text-slate-500 mt-0.5 max-w-[120px] sm:max-w-[200px] truncate">
                              {productSummary}
                            </p>
                            <div className="flex items-center text-[10px] font-medium text-slate-400 mt-1">
                              <CalendarDays className="w-3 h-3 mr-1" />
                              {formatDate(inv.issueDate)} • {new Date(inv.issueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-black text-blue-600">
                            {convertAndFormat(inv.total, inv.currency).replace(',00', '')}
                          </span>
                          {!isSelectionMode && (
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                          )}

                          {/* Actions Menu (Desktop only) */}
                          <div className="hidden md:block menu-container relative">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === inv.id ? null : inv.id);
                              }}
                              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                            
                            {openMenuId === inv.id && (
                              <div className="absolute right-8 top-1/2 -translate-y-1/2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-10 animate-fade-in origin-right">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    router.push(`/invoices/${inv.id}`);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                                >
                                  <Eye className="w-4 h-4 text-slate-400" />
                                  <span>Voir le reçu</span>
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    setDeletingId(inv.id);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Supprimer</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
