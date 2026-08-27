"use client";

import React, { useState } from "react";
import { RefreshCw, Plus, Calendar, Play, Pause, XCircle, ArrowRight, CheckCircle, Sparkles, Zap, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { useCurrency } from "@/providers/CurrencyProvider";
import { mockSubscriptions } from "@/lib/mockData";
import { Subscription } from "@/types";

export const SubscriptionListView: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockSubscriptions);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { convertAndFormat, getConvertedAmount, activeCurrency, formatOnly } = useCurrency();

  const filteredSubs = subscriptions.filter((sub) =>
    filterStatus === "all" ? true : sub.status === filterStatus
  );

  const togglePause = (id: string, currentStatus: Subscription["status"], name: string) => {
    const next = currentStatus === "Actif" ? "En pause" : "Actif";
    setSubscriptions(
      subscriptions.map((s) => (s.id === id ? { ...s, status: next as Subscription["status"] } : s))
    );
    alert(`🔄 Abonnement "${name}" changé en statut : ${next} !`);
  };

  const handleGenerateInvoiceNow = (title: string, amount: number, client: string, currency: string) => {
    alert(`🚀 Exécution manuelle déclenchée !\nUne nouvelle facture a été émise et envoyée par email & lien Wave à "${client}" pour l'abonnement "${title}" (${convertAndFormat(amount, currency)}).`);
  };

  const totalMonthlyRecurringRevenue = subscriptions
    .filter((s) => s.status === "Actif")
    .reduce((acc, curr) => {
    const monthlyAmount = curr.frequency === "Mensuel" ? curr.amount : curr.frequency === "Trimestriel" ? curr.amount / 3 : curr.amount / 12;
    return acc + getConvertedAmount(monthlyAmount, curr.currency);
  }, 0);

  const renderStatusBadge = (status: Subscription["status"]) => {
    switch (status) {
      case "Actif":
        return (
          <span className="inline-flex items-center text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            Actif & Auto-facture
          </span>
        );
      case "En pause":
        return (
          <span className="inline-flex items-center text-xs font-black text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            <Pause className="w-3.5 h-3.5 mr-1" />
            En pause
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-xs font-black text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Annulé
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Abonnements & Facturation Récurrente</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Automatisez la génération et l&apos;envoi par Wave / Orange Money de vos contrats d&apos;assistance, SaaS ou loyers.
          </p>
        </div>
        <Button onClick={() => alert("Simuler la création d'un nouveau profil récurrent...")} variant="primary" size="sm" className="font-black text-xs px-4 py-3 rounded-xl shadow-md shadow-blue-600/20 btn-magnetic">
          <Plus className="w-4 h-4 mr-1.5 stroke-[3]" />
          Nouvel Abonnement
        </Button>
      </div>

      {/* MRR Banner & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="md:col-span-2 p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-blue-950 to-slate-950 text-white shadow-xl shadow-blue-950/20 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center text-amber-400 text-[10px] font-black uppercase tracking-widest gap-1 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Moteur Récurrent Africain Actif
            </span>
            <span className="text-xs text-slate-400 font-extrabold">0% d&apos;oubli de facturation</span>
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Revenu Récurrent Mensuel Estimé (MRR)</h3>
            <p className="text-3xl font-black text-amber-400 tracking-tight mt-1">
              {formatOnly(Math.round(totalMonthlyRecurringRevenue), activeCurrency)} <span className="text-xs text-slate-300 font-bold uppercase">/ mois garanti</span>
            </p>
            <p className="text-xs text-slate-300 mt-2 font-medium leading-relaxed max-w-xl">
              Le système génère automatiquement les factures à 00:01 le jour d&apos;exécution et notifie le client par SMS / Email avec lien de règlement immédiat.
            </p>
          </div>
        </Card>

        <Card className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-1">État de votre portefeuille</span>
            <h4 className="text-2xl font-black text-slate-900">{subscriptions.length} contrats actifs</h4>
            <div className="space-y-2.5 mt-5 text-xs font-bold text-slate-700">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span>Mensuels (SaaS & Services)</span>
                <span className="font-black text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
                  {subscriptions.filter((s) => s.frequency === "Mensuel").length}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span>Trimestriels / Maintenance</span>
                <span className="font-black text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-md">
                  {subscriptions.filter((s) => s.frequency === "Trimestriel").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Annuels / Hébergement</span>
                <span className="font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                  {subscriptions.filter((s) => s.frequency === "Annuel").length}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200/80 pb-3 text-xs font-bold">
        {[
          { label: "Tous les abonnements", value: "all" },
          { label: "Actifs uniquement", value: "Actif" },
          { label: "En pause", value: "En pause" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterStatus(tab.value)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              filterStatus === tab.value
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSubs.map((sub) => (
          <Card key={sub.id} className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-soft-sm hover:shadow-soft-md transition-all flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    Fréquence : {sub.frequency}
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-2">{sub.title}</h3>
                  <p className="text-xs text-slate-500 font-medium">{sub.clientName}</p>
                </div>
                {renderStatusBadge(sub.status)}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">Montant par cycle :</span>
                  <span className="text-lg font-black text-slate-950">{convertAndFormat(sub.amount, sub.currency)} TTC</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 font-bold block">Prochaine échéance :</span>
                  <span className="text-xs font-black text-blue-600 flex items-center justify-end gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(sub.nextBillingDate)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => togglePause(sub.id, sub.status, sub.title)}
                className="text-xs font-black rounded-xl"
              >
                {sub.status === "Actif" ? (
                  <>
                    <Pause className="w-3.5 h-3.5 mr-1 text-amber-600" /> Mettre en pause
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Réactiver le contrat
                  </>
                )}
              </Button>

              <Button
                size="sm"
                variant="primary"
                onClick={() => handleGenerateInvoiceNow(sub.title, sub.amount, sub.clientName, sub.currency)}
                className="text-xs font-black rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              >
                Générer Facture maintenant
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
