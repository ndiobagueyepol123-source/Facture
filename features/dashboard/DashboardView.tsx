"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  ShoppingCart,
  CalendarDays,
  TrendingUp,
  ChevronRight,
  Receipt,
  Search,
  Settings2,
  Package,
  Calendar,
  ChevronDown
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import { getInvoices } from "@/lib/api/invoices";
import { Invoice } from "@/types";
import { useCurrency } from "@/providers/CurrencyProvider";
import { createClient } from "@/lib/supabase/client";

export const DashboardView: React.FC = () => {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("Commerçant");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Aujourd'hui");
  const { convertAndFormat, formatOnly, getConvertedAmount, activeCurrency } = useCurrency();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Commerçant";
        setUserName(name);
      }

      const data = await getInvoices();
      setInvoices(data || []);
      setIsLoading(false);
    }

    loadData();
  }, []);

  // Calcul des statistiques réelles
  const now = new Date();
  
  // Ventes aujourd'hui
  const salesToday = invoices.filter(inv => {
    const invDate = new Date(inv.issueDate);
    return invDate.getDate() === now.getDate() && 
           invDate.getMonth() === now.getMonth() && 
           invDate.getFullYear() === now.getFullYear();
  });
  const totalToday = salesToday.reduce((sum, inv) => sum + getConvertedAmount(inv.total, inv.currency), 0);

  // Ventes des 30 derniers jours
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);
  
  const sales30Days = invoices.filter(inv => new Date(inv.issueDate) >= thirtyDaysAgo);
  const total30Days = sales30Days.reduce((sum, inv) => sum + getConvertedAmount(inv.total, inv.currency), 0);

  const statCards = [
    {
      title: "Ventes aujourd'hui",
      value: totalToday,
      icon: <TrendingUp className="w-5 h-5 text-white stroke-[2.5]" />,
      iconBg: "bg-blue-500",
      bgClass: "bg-[#F3F8FF]",
      valueColor: "text-slate-900",
      currencyColor: "text-blue-500",
    },
    {
      title: "30 derniers jours",
      value: total30Days,
      icon: <TrendingUp className="w-5 h-5 text-white stroke-[2.5]" />,
      iconBg: "bg-emerald-500",
      bgClass: "bg-[#F0FDF4]",
      valueColor: "text-slate-900",
      currencyColor: "text-emerald-500",
    },
    {
      title: "Nombre de ventes",
      value: invoices.length,
      icon: <ShoppingCart className="w-5 h-5 text-white stroke-[2.5]" />,
      iconBg: "bg-purple-400",
      bgClass: "bg-[#FAEDFF]",
      valueColor: "text-slate-900",
      currencyColor: "text-purple-400",
      isNumber: true
    }
  ];

  // Filtre des Dernières ventes
  const filteredSales = invoices.filter((inv) => {
    const productNames = inv.items?.map(i => i.description).join(" ").toLowerCase() || "";
    const matchesSearch = productNames.includes(searchQuery.toLowerCase()) ||
                          inv.number.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    const invTime = new Date(inv.issueDate).getTime();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    if (selectedFilter === "Aujourd'hui") return invTime >= todayStart;
    if (selectedFilter === "7 jours") {
      const sevenDaysStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
      return invTime >= sevenDaysStart;
    }
    if (selectedFilter === "30 jours") {
      const thirtyDaysStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).getTime();
      return invTime >= thirtyDaysStart;
    }
    return true; // "Tout"
  });

  const recentSales = filteredSales.slice(0, 5);
  const filterTabs = ["Aujourd'hui", "7 jours", "30 jours", "Tout"];

  const currentDateFormatted = now.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="space-y-8 pb-14 animate-fade-in w-full min-w-0">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-5 pt-2">
        <div>
          <h1 className="text-[22px] font-black tracking-tight text-slate-900 flex items-center capitalize">
            Bonjour, {userName} <span className="ml-1.5 text-2xl">👋</span>
          </h1>
          <p className="text-[13px] font-medium text-slate-500 mt-0.5">
            Voici le résumé de vos ventes.
          </p>
        </div>
        <div className="flex items-center">
          <div className="flex items-center space-x-1.5 bg-white border border-slate-200 shadow-xs px-3 py-1.5 rounded-full text-[12px] font-bold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{currentDateFormatted}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="flex overflow-x-auto gap-3 pb-3 -mx-5 px-5 no-scrollbar snap-x">
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            className={`shrink-0 min-w-[140px] p-4 flex flex-col border-0 shadow-xs rounded-3xl relative overflow-hidden snap-start ${stat.bgClass}`}
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-xs mb-2.5 ${stat.iconBg}`}>
              {React.cloneElement(stat.icon as React.ReactElement, { className: "w-4 h-4 text-white stroke-[2.5]" })}
            </div>
            <span className="text-[12px] font-bold text-slate-600 block mb-1 whitespace-nowrap">
              {stat.title}
            </span>
            <div className="flex items-baseline space-x-1 whitespace-nowrap">
              <span className={`text-[22px] font-black tracking-tight ${stat.valueColor}`}>
                {stat.isNumber ? stat.value : formatOnly(stat.value as number, activeCurrency).replace(',00', '')}
              </span>
              {!stat.isNumber && (
                <span className={`text-[11px] font-bold ${stat.currencyColor}`}>FCFA</span>
              )}
              {stat.isNumber && (
                <span className={`text-[11px] font-bold ${stat.currencyColor}`}>ventes</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative w-full">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un produit ou un reçu..."
            className="w-full pl-12 pr-12 py-3.5 text-sm font-medium text-slate-900 bg-white border border-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400 shadow-xs"
          />
          <button className="absolute right-2 top-2 p-1.5 bg-slate-50 rounded-full border border-slate-100 text-slate-500 hover:text-slate-700">
            <Settings2 className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center justify-between px-1">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedFilter(tab)}
              className={`text-[13px] font-bold px-3 py-1.5 rounded-full transition-all ${
                selectedFilter === tab
                  ? "bg-[#F0F7FF] text-blue-600 font-extrabold"
                  : "text-slate-500 bg-transparent hover:text-slate-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Dernières ventes */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[17px] font-black text-slate-900 tracking-tight">
            Dernières ventes
          </h2>
          <Link href="/invoices" className="text-[13px] font-bold text-blue-600 flex items-center hover:underline">
            Voir tout <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            </div>
          ) : recentSales.length === 0 ? (
            <div className="py-12 px-4 text-center bg-white rounded-3xl border border-slate-100 shadow-xs">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                <Receipt className="w-8 h-8 stroke-[2]" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-1">Aucune vente pour le moment</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                Vos nouvelles ventes enregistrées apparaîtront automatiquement ici.
              </p>
              <Link href="/invoices/create">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-md shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-1.5">
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Nouvelle vente</span>
                </button>
              </Link>
            </div>
          ) : (
            recentSales.map((inv, idx) => {
              const iconStyles = [
                { bg: "bg-[#F3F8FF]", color: "text-blue-500" },
                { bg: "bg-[#F0FDF4]", color: "text-emerald-500" },
                { bg: "bg-[#FFF7ED]", color: "text-amber-500" },
              ];
              const style = iconStyles[idx % iconStyles.length];

              return (
                <div
                  key={`dash-mob-${inv.id}`}
                  onClick={() => router.push(`/invoices/${inv.id}`)}
                  className="p-4 rounded-3xl bg-white border border-slate-100 shadow-xs active:scale-[0.98] transition-all hover:border-slate-200 cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${style.bg} ${style.color}`}>
                      <Package className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div>
                      <p className="font-black text-[13px] text-slate-900">
                        N° {inv.number}
                      </p>
                      <p className="text-[11px] font-bold text-slate-500 mt-0.5 max-w-[140px] sm:max-w-[240px] truncate">
                        {inv.items?.map(i => `${i.description} × ${i.quantity}`).join(", ") || "Vente diverse"}
                      </p>
                      <div className="flex items-center text-[10px] font-medium text-slate-400 mt-1">
                        <CalendarDays className="w-3 h-3 mr-1" />
                        {formatDate(inv.issueDate)} • {new Date(inv.issueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[15px] font-black text-blue-600">
                      {convertAndFormat(inv.total, inv.currency).replace(',00', '')}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
