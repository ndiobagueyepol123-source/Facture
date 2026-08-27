"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CreditCard, Search, Download, CheckCircle2, Clock, Smartphone, Landmark, Banknote, ArrowUpRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { useCurrency } from "@/providers/CurrencyProvider";

interface PaymentRecord {
  id: string;
  invoiceNumber: string;
  invoiceId: string;
  clientName: string;
  company: string;
  date: string;
  amount: number;
  currency: string;
  method: "Wave" | "Orange Money" | "Virement Bancaire" | "Espèces" | "Chèque";
  reference: string;
  status: "Validé & Exécuté" | "En traitement bancaire";
}

const mockPayments: PaymentRecord[] = [
  { id: "pay-101", invoiceNumber: "FACT-2026-0034", invoiceId: "1", clientName: "Abdoulaye Wade", company: "TECH AFRICA SÉNÉGAL", date: "2026-03-09", amount: 1650000, currency: "FCFA", method: "Wave", reference: "WV-89302194-SN", status: "Validé & Exécuté" },
  { id: "pay-102", invoiceNumber: "FACT-2026-0042", invoiceId: "2", clientName: "Fatou Sow", company: "SOCIÉTÉ CIVILE DU SAHEL", date: "2026-03-07", amount: 3200000, currency: "FCFA", method: "Virement Bancaire", reference: "VIR-ECOBANK-00921", status: "Validé & Exécuté" },
  { id: "pay-103", invoiceNumber: "FACT-2026-0045", invoiceId: "3", clientName: "Moussa Traoré", company: "AGRO DISTRIBUTION DAKAR", date: "2026-03-04", amount: 450000, currency: "FCFA", method: "Orange Money", reference: "OM-559102-SN", status: "Validé & Exécuté" },
  { id: "pay-104", invoiceNumber: "FACT-2026-0048", invoiceId: "4", clientName: "Amadou Diallo", company: "LOGISTIQUE WEST AFRICA", date: "2026-03-02", amount: 890000, currency: "FCFA", method: "Wave", reference: "WV-39201948-SN", status: "Validé & Exécuté" },
  { id: "pay-105", invoiceNumber: "FACT-2026-0051", invoiceId: "5", clientName: "Cheikh Ndiaye", company: "BTP GROUPE SÉNÉGAL", date: "2026-02-28", amount: 2100000, currency: "FCFA", method: "Virement Bancaire", reference: "VIR-UBA-882193", status: "En traitement bancaire" },
  { id: "pay-106", invoiceNumber: "FACT-2026-0052", invoiceId: "6", clientName: "Aïssatou Fall", company: "DIGITAL INNOVATION ABIDJAN", date: "2026-02-25", amount: 650000, currency: "FCFA", method: "Wave", reference: "WV-20193819-CI", status: "Validé & Exécuté" },
];

export const PaymentListView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [payments] = useState<PaymentRecord[]>(mockPayments);
  const { convertAndFormat, getConvertedAmount, activeCurrency, formatOnly } = useCurrency();

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = methodFilter === "all" || p.method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const totalCollected = payments.filter(p => p.status === "Validé & Exécuté").reduce((a, b) => a + getConvertedAmount(b.amount, b.currency), 0);

  const renderMethodBadge = (method: PaymentRecord["method"]) => {
    switch (method) {
      case "Wave":
        return (
          <span className="inline-flex items-center text-xs font-black text-blue-700 bg-blue-100 px-3 py-1 rounded-xl border border-blue-300 shadow-2xs">
            <Smartphone className="w-3.5 h-3.5 mr-1.5 text-blue-600 animate-bounce-short" />
            Wave Mobile Money
          </span>
        );
      case "Orange Money":
        return (
          <span className="inline-flex items-center text-xs font-black text-orange-800 bg-orange-100 px-3 py-1 rounded-xl border border-orange-300 shadow-2xs">
            <Smartphone className="w-3.5 h-3.5 mr-1.5 text-orange-600" />
            Orange Money (OM)
          </span>
        );
      case "Virement Bancaire":
        return (
          <span className="inline-flex items-center text-xs font-black text-purple-700 bg-purple-100 px-3 py-1 rounded-xl border border-purple-300">
            <Landmark className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
            Virement Bancaire
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-xs font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-xl border border-slate-300">
            <Banknote className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
            {method}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Registre des Encaissements & Paiements</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Suivez en temps réel l&apos;arrivée de vos fonds sur vos comptes Wave, Orange Money et de virements bancaires en Afrique.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => alert("Exportation du relevé bancaire et de réconciliation au format Excel / CSV...")} className="font-bold text-xs rounded-xl shadow-xs">
          <Download className="w-4 h-4 mr-1.5 text-slate-600" />
          Exporter Réconciliation (Excel)
        </Button>
      </div>

      {/* Breakdown Channels Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl shadow-lg shadow-slate-950/20 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Total Encaissé (30j)
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-black text-white mt-3 tracking-tight">{formatOnly(totalCollected, activeCurrency)}</p>
            <p className="text-[10px] text-slate-400 font-bold mt-1">100% rapproché avec vos factures</p>
          </div>
        </Card>

        <Card className="p-5 bg-blue-50/70 border border-blue-200 rounded-3xl flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between text-blue-900 font-black text-xs uppercase tracking-wider">
            <span>Canal Wave Business</span>
            <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full">64% volume</span>
          </div>
          <div>
            <p className="text-xl font-black text-slate-950 mt-3">{convertAndFormat(3190000, "FCFA")}</p>
            <p className="text-xs text-blue-700 font-bold mt-1">Virements instantanés (0% frais)</p>
          </div>
        </Card>

        <Card className="p-5 bg-orange-50/70 border border-orange-200 rounded-3xl flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between text-orange-950 font-black text-xs uppercase tracking-wider">
            <span>Orange Money (OM)</span>
            <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full">18% volume</span>
          </div>
          <div>
            <p className="text-xl font-black text-slate-950 mt-3">{convertAndFormat(890000, "FCFA")}</p>
            <p className="text-xs text-orange-800 font-bold mt-1">Encaissements QR Code</p>
          </div>
        </Card>

        <Card className="p-5 bg-purple-50/70 border border-purple-200 rounded-3xl flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between text-purple-950 font-black text-xs uppercase tracking-wider">
            <span>Virements Bancaires</span>
            <span className="bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full">18% volume</span>
          </div>
          <div>
            <p className="text-xl font-black text-slate-950 mt-3">{convertAndFormat(5300000, "FCFA")}</p>
            <p className="text-xs text-purple-800 font-bold mt-1">Grands comptes & Administrations</p>
          </div>
        </Card>
      </div>

      {/* Toolbar */}
      <Card className="p-4 bg-white shadow-soft-sm border border-slate-200/80 rounded-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par référence, facture ou client..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs font-bold text-slate-900 rounded-xl border border-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {[
              { label: "Tous les canaux", value: "all" },
              { label: "Wave Mobile Money", value: "Wave" },
              { label: "Orange Money", value: "Orange Money" },
              { label: "Virements Bancaires", value: "Virement Bancaire" },
            ].map((m) => (
              <button
                key={m.value}
                onClick={() => setMethodFilter(m.value)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                  methodFilter === m.value
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/25 scale-105"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100/90 border border-slate-150"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <Card className="p-0 overflow-hidden border border-slate-200/80 shadow-soft-md rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/80">
                <th className="py-4 px-6">Référence Transaction</th>
                <th className="py-4 px-6">Canal d&apos;Encaissement</th>
                <th className="py-4 px-6">Client & Entreprise</th>
                <th className="py-4 px-6">Facture Associée</th>
                <th className="py-4 px-6">Date du paiement</th>
                <th className="py-4 px-6">Montant Encaissé</th>
                <th className="py-4 px-6 text-right">Statut Réconcilié</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="py-4 px-6 font-mono text-xs font-extrabold text-slate-700 whitespace-nowrap">
                      {p.reference}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {renderMethodBadge(p.method)}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <p className="font-black text-slate-900">{p.company}</p>
                      <p className="text-xs text-slate-400 font-medium">{p.clientName}</p>
                    </td>
                    <td className="py-4 px-6 font-black text-blue-600 whitespace-nowrap">
                      <Link href={`/invoices/${p.invoiceId}`} className="hover:underline flex items-center">
                        {p.invoiceNumber}
                        <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-xs font-bold text-slate-600 whitespace-nowrap">
                      {formatDate(p.date)}
                    </td>
                    <td className="py-4 px-6 font-black text-slate-900 text-base whitespace-nowrap">
                      {convertAndFormat(p.amount, p.currency)}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      {p.status === "Validé & Exécuté" ? (
                        <span className="inline-flex items-center text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          Validé & Exécuté
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                          <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
                          En traitement bancaire
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <CreditCard className="w-12 h-12 mx-auto mb-3 text-slate-300 stroke-1" />
                    <h3 className="text-base font-black text-slate-900">Aucune transaction trouvée</h3>
                    <p className="text-xs text-slate-400 mt-1">Modifiez vos critères ou réinitialisez le filtre par mode de paiement.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 font-bold">
          <span>Affichage de <strong className="text-blue-600">{filteredPayments.length}</strong> transactions d&apos;encaissement.</span>
          <span className="bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
            Volume affiché : <strong className="text-slate-950 font-black text-sm ml-1">{formatOnly(filteredPayments.reduce((a, b) => a + getConvertedAmount(b.amount, b.currency), 0), activeCurrency)}</strong>
          </span>
        </div>
      </Card>
    </div>
  );
};
