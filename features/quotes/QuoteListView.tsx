"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ClipboardList, Search, Plus, CheckCircle2, XCircle, Clock, FileInput, Trash2, Send, Download } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import { useCurrency } from "@/providers/CurrencyProvider";
import { mockQuotes } from "@/lib/mockData";
import { Quote } from "@/types";

export const QuoteListView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [quotes, setQuotes] = useState<Quote[]>(mockQuotes);
  const { convertAndFormat, getConvertedAmount, activeCurrency, formatOnly } = useCurrency();

  const statuses = [
    { label: "Tous", value: "all" },
    { label: "Acceptés", value: "Accepté" },
    { label: "En attente", value: "Envoyé" },
    { label: "Brouillons", value: "Brouillon" },
    { label: "Refusés", value: "Refusé" },
  ];

  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      q.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || q.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleConvertToInvoice = (id: string, number: string, clientName: string) => {
    setQuotes(
      quotes.map((q) => (q.id === id ? { ...q, status: "Accepté" } : q))
    );
    alert(`Le devis ${number} (${clientName}) est converti en facture.`);
  };

  const handleDelete = (id: string, number: string) => {
    if (confirm(`Supprimer le devis ${number} ?`)) {
      setQuotes(quotes.filter((q) => q.id !== id));
    }
  };

  const renderStatusBadge = (status: Quote["status"]) => {
    switch (status) {
      case "Accepté":
        return (
          <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
            Accepté
          </span>
        );
      case "Envoyé":
        return (
          <span className="inline-flex items-center text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
            <Clock className="w-3 h-3 mr-1 text-amber-600" />
            En attente
          </span>
        );
      case "Refusé":
        return (
          <span className="inline-flex items-center text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
            <XCircle className="w-3 h-3 mr-1 text-rose-600" />
            Refusé
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
            Brouillon
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in w-full min-w-0">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Devis & Projets</h1>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Gérez vos propositions commerciales et convertissez-les en factures rapidement.
          </p>
        </div>
        <Link href="/invoices/create" className="flex-shrink-0">
          <button type="button" className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-3.5 h-9 rounded-lg shadow-2xs flex items-center transition-all">
            <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            <span>Nouveau Devis</span>
          </button>
        </Link>
      </div>

      {/* Unboxed Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex items-center space-x-1 p-1 bg-slate-100/80 rounded-lg w-fit overflow-x-auto text-xs">
          {statuses.map((s) => {
            const isActive = selectedStatus === s.value;
            return (
              <button
                key={s.value}
                onClick={() => setSelectedStatus(s.value)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Compact Search Box */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par N° devis, client..."
            className="w-full pl-8 pr-3 py-1.5 h-8 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-xs font-medium text-slate-800 rounded-lg border border-slate-200/60 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Ultra-Compact Table */}
      <Card className="p-0 overflow-hidden border border-slate-200/80 shadow-2xs rounded-xl bg-white w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 bg-slate-50/70 uppercase tracking-wider">
                <th className="py-2.5 px-4">Devis & Objet</th>
                <th className="py-2.5 px-4">Client</th>
                <th className="py-2.5 px-4">Date / Validité</th>
                <th className="py-2.5 px-4">Montant TTC</th>
                <th className="py-2.5 px-4">Statut</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredQuotes.length > 0 ? (
                filteredQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="py-2.5 px-4 font-semibold text-slate-800 max-w-[200px] truncate whitespace-nowrap">
                      <span className="font-bold text-blue-600 block text-xs">{q.number}</span>
                      <span className="text-[11px] text-slate-500 font-normal truncate block">{q.title}</span>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-slate-900 block text-[13px]">{q.client.company}</span>
                      <span className="text-[11px] text-slate-400">{q.client.city}</span>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap text-slate-600">
                      <span className="block">{formatDate(q.date)}</span>
                      <span className="text-[10px] text-slate-400">Valide au {formatDate(q.validUntil)}</span>
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900 text-xs whitespace-nowrap">
                      {convertAndFormat(q.total, q.currency)}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      {renderStatusBadge(q.status)}
                    </td>
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end space-x-1.5">
                        {q.status !== "Accepté" && (
                          <button
                            type="button"
                            onClick={() => handleConvertToInvoice(q.id, q.number, q.client.company)}
                            className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 rounded border border-emerald-200/60 transition-colors whitespace-nowrap flex items-center gap-1"
                          >
                            <FileInput className="w-3 h-3 stroke-[2.5]" />
                            <span>Convertir</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => alert(`Téléchargement du Devis PDF pour ${q.number}`)}
                          title="Télécharger PDF"
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => alert(`Envoi par email à ${q.client.company}`)}
                          title="Envoyer par email"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(q.id, q.number)}
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
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium text-xs">
                    Aucune proposition commerciale ne correspond aux critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="py-2.5 px-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 font-medium">
          <span>Affichage de <strong className="text-slate-800 font-bold">{filteredQuotes.length}</strong> devis et propositions.</span>
          <span>
            Volume potentiel : <strong className="text-slate-900 font-bold ml-1">{formatOnly(filteredQuotes.reduce((a, b) => a + getConvertedAmount(b.total, b.currency), 0), activeCurrency)}</strong>
          </span>
        </div>
      </Card>
    </div>
  );
};
