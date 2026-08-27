"use client";

import React, { useState } from "react";
import { BarChart3, TrendingUp, Download, PieChart as PieIcon, ShieldCheck, ArrowUpRight, Calendar, Landmark, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useCurrency } from "@/providers/CurrencyProvider";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const revenueByMonth = [
  { name: "Oct 25", amount: 4800000, vat: 864000 },
  { name: "Nov 25", amount: 6200000, vat: 1116000 },
  { name: "Déc 25", amount: 8900000, vat: 1602000 },
  { name: "Jan 26", amount: 5400000, vat: 972000 },
  { name: "Fév 26", amount: 7100000, vat: 1278000 },
  { name: "Mar 26 (Est.)", amount: 9400000, vat: 1692000 },
];

const revenueByClient = [
  { name: "TECH AFRICA SÉNÉGAL", total: 12400000, percentage: "35%", color: "#2563EB" },
  { name: "BTP GROUPE DAKAR", total: 8200000, percentage: "23%", color: "#059669" },
  { name: "SOCIÉTÉ CIVILE SAHEL", total: 6500000, percentage: "18%", color: "#D97706" },
  { name: "LOGISTIQUE WEST AFRICA", total: 4900000, percentage: "14%", color: "#7C3AED" },
  { name: "Autres comptes", total: 3600000, percentage: "10%", color: "#64748B" },
];

const vatDeclarations = [
  { period: "1er Trimestre 2026 (En cours)", collected: 3942000, baseHT: 21900000, status: "À déclarer (30 Avril)" },
  { period: "4eme Trimestre 2025", collected: 3582000, baseHT: 19900000, status: "Déclarée & Réglée (OHADA)" },
  { period: "3eme Trimestre 2025", collected: 2890000, baseHT: 16055000, status: "Déclarée & Réglée (OHADA)" },
];

export const ReportsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState("revenue");
  const { convertAndFormat } = useCurrency();

  return (
    <div className="space-y-8 pb-16 animate-fade-in max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Rapports Financiers & Audit Fiscal</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Visualisez la croissance de votre entreprise en Afrique, la concentration de votre portefeuille client et vos déclarations TVA.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => alert("Génération du Grand Livre Comptable au format PDF et CSV...")} className="font-bold text-xs rounded-xl">
            <Download className="w-4 h-4 mr-1.5 text-slate-600" />
            Exporter Grand Livre (Comptabilité)
          </Button>
          <Button variant="primary" size="sm" onClick={() => alert("Génération du bilan synthétique OHADA...")} className="font-black text-xs px-4 py-2.5 rounded-xl shadow-md bg-blue-600">
            <ShieldCheck className="w-4 h-4 mr-1.5" />
            Bilan OHADA (PDF)
          </Button>
        </div>
      </div>

      {/* Tabs / Selector */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        {[
          { id: "revenue", label: "📈 Croissance & Chiffre d'Affaires", icon: TrendingUp },
          { id: "clients", label: "🏢 Répartition Clientèle & Portefeuille", icon: PieIcon },
          { id: "tax", label: "⚖️ TVA & Fiscalité (UEMOA / CEMAC)", icon: ShieldCheck },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
              activeTab === t.id
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/25 scale-105"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: REVENUE GROWTH */}
      {activeTab === "revenue" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Card className="p-5 bg-gradient-to-br from-slate-950 to-indigo-950 text-white rounded-3xl border border-slate-800 shadow-xl shadow-slate-950/15">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider block mb-1">Chiffre d&apos;Affaires (6 mois)</span>
              <h3 className="text-3xl font-black text-white">{convertAndFormat(41800000, "FCFA")}</h3>
              <p className="text-xs text-emerald-400 font-extrabold mt-2 flex items-center">
                <ArrowUpRight className="w-4 h-4 mr-1" /> +24.8% vs période précédente
              </p>
            </Card>
            <Card className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-soft-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1">Moyenne mensuelle</span>
                <h3 className="text-2xl font-black text-slate-900">{convertAndFormat(6966666, "FCFA")}</h3>
              </div>
              <p className="text-xs text-slate-500 font-bold mt-2">Stabilité des encaissements garantie par Wave & OM</p>
            </Card>
            <Card className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-soft-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1">Délai moyen de règlement (DSO)</span>
                <h3 className="text-2xl font-black text-emerald-600">4.2 Jours</h3>
              </div>
              <p className="text-xs text-emerald-700 font-bold bg-emerald-50 p-2 rounded-xl mt-2 border border-emerald-200">
                🚀 -11 jours de gain depuis l&apos;intégration des liens de paiement mobile !
              </p>
            </Card>
          </div>

          <Card className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-soft-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">Évolution de la Facturation Mensuelle (HT & TTC)</h3>
                <p className="text-xs text-slate-400 font-semibold">Analyse du CA généré mois par mois sur la période en cours</p>
              </div>
              <span className="text-xs font-black bg-blue-50 text-blue-700 px-3 py-1 rounded-xl border border-blue-100">
                Devise : FCFA (XOF)
              </span>
            </div>
            <div className="h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByMonth}>
                  <XAxis dataKey="name" stroke="#64748B" fontSize={12} fontWeight={700} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={12} fontWeight={700} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(val: number) => convertAndFormat(val, "FCFA")} labelStyle={{ fontWeight: 900, color: "#0F172A" }} contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "1rem", border: "1px solid #E2E8F0", padding: "12px", fontWeight: "bold" }} />
                  <Bar dataKey="amount" fill="#2563EB" name="Chiffre d'Affaires HT" radius={[10, 10, 0, 0]} />
                  <Bar dataKey="vat" fill="#10B981" name="TVA Collectée (18%)" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: CLIENT PORTFOLIO CONCENTRATION */}
      {activeTab === "clients" && (
        <Card className="p-6 md:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-soft-md space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 pb-5">
            <h3 className="text-lg font-black text-slate-900">Répartition des Revenus par Grands Comptes</h3>
            <p className="text-xs text-slate-500 font-medium">Identifiez vos clients stratégiques et surveillez le risque de dépendance économique.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              {revenueByClient.map((client, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex items-center justify-between hover:bg-blue-50/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: client.color }} />
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{client.name}</h4>
                      <p className="text-[11px] text-slate-400 font-bold">Part du chiffre d&apos;affaires : <strong className="text-slate-700">{client.percentage}</strong></p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-slate-900">{convertAndFormat(client.total, "FCFA")}</span>
                </div>
              ))}
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByClient}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={5}
                  >
                    {revenueByClient.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => convertAndFormat(val, "FCFA")} contentStyle={{ borderRadius: "12px", fontWeight: "bold" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 3: TAXES & OHADA AUDIT */}
      {activeTab === "tax" && (
        <div className="space-y-6 animate-fade-in">
          <Card className="p-6 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-emerald-950 text-white shadow-xl shadow-slate-950/20 border border-slate-800">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center text-emerald-400 text-[10px] font-black uppercase tracking-widest gap-1 bg-emerald-400/10 px-2.5 py-1 rounded-full mb-2">
                  <Sparkles className="w-3 h-3 text-emerald-400" /> Conformité Fiscale OHADA / UEMOA
                </span>
                <h3 className="text-lg font-black text-white">Registre de la TVA Collectée (Taux standard 18%)</h3>
                <p className="text-xs text-slate-300 font-medium max-w-2xl mt-1 leading-relaxed">
                  Ce tableau récapitule les montants exacts à déclarer aux services des impôts. Le calcul s&apos;appuie exclusivement sur les factures dûment validées et payées par vos clients.
                </p>
              </div>
              <Button size="sm" onClick={() => alert("📥 Téléchargement de la déclaration TVA (Format DGI / Impôts Sénégal)")} className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-5 py-3 rounded-xl shadow-md whitespace-nowrap">
                Télécharger Déclaration DGI
              </Button>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden border border-slate-200/80 shadow-soft-md rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/80">
                  <th className="py-4 px-6">Période Fiscale</th>
                  <th className="py-4 px-6">Base Imposable (Total HT)</th>
                  <th className="py-4 px-6">TVA Collectée (18%)</th>
                  <th className="py-4 px-6">Statut Déclaration</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {vatDeclarations.map((v, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/25 transition-colors">
                    <td className="py-4 px-6 font-black text-slate-900 text-xs">{v.period}</td>
                    <td className="py-4 px-6 font-black text-slate-800 text-xs">{convertAndFormat(v.baseHT, "FCFA")}</td>
                    <td className="py-4 px-6 font-black text-emerald-600 text-base">{convertAndFormat(v.collected, "FCFA")}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-xl text-xs font-black ${
                        v.status.includes("À déclarer")
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button variant="outline" size="sm" onClick={() => alert(`Téléchargement de l'attestation fiscale pour : ${v.period}`)} className="text-xs font-extrabold rounded-xl">
                        Aperçu Fiscal PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
};
