"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar as CalendarIcon, Clock, CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert, Sparkles, RefreshCw, Smartphone } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { useCurrency } from "@/providers/CurrencyProvider";

interface CalendarEvent {
  id: string;
  day: string;
  month: string;
  fullDate: string;
  title: string;
  client: string;
  amount: number;
  type: "échéance_facture" | "renouvellement_auto" | "déclaration_tva";
  status: "urgent" | "à_venir" | "réglé";
  link?: string;
}

const mockEvents: CalendarEvent[] = [
  { id: "ev-1", day: "12", month: "MAR", fullDate: "2026-03-12", title: "Échéance Facture #2026-0042 (En retard !)", client: "SOCIÉTÉ CIVILE SAHEL", amount: 3200000, type: "échéance_facture", status: "urgent", link: "/invoices/2" },
  { id: "ev-2", day: "15", month: "MAR", fullDate: "2026-03-15", title: "Renouvellement Contrat Assistance SI", client: "TECH AFRICA SÉNÉGAL", amount: 450000, type: "renouvellement_auto", status: "à_venir", link: "/subscriptions" },
  { id: "ev-3", day: "20", month: "MAR", fullDate: "2026-03-20", title: "Échéance Facture #2026-0050", client: "BTP GROUPE DAKAR", amount: 1850000, type: "échéance_facture", status: "à_venir", link: "/invoices/5" },
  { id: "ev-4", day: "01", month: "AVR", fullDate: "2026-04-01", title: "Génération automatique lot de 4 abonnements", client: "Portefeuille SaaS Clientèle", amount: 1380000, type: "renouvellement_auto", status: "à_venir", link: "/subscriptions" },
  { id: "ev-5", day: "30", month: "AVR", fullDate: "2026-04-30", title: "Date Limite Déclaration TVA 1er Trimestre", client: "Direction Générale des Impôts (OHADA)", amount: 3942000, type: "déclaration_tva", status: "à_venir", link: "/reports" },
];

export const CalendarView: React.FC = () => {
  const [events] = useState<CalendarEvent[]>(mockEvents);
  const [filter, setFilter] = useState("all");
  const { convertAndFormat } = useCurrency();

  const filteredEvents = events.filter(e => filter === "all" || e.type === filter);

  return (
    <div className="space-y-8 pb-16 animate-fade-in max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Calendrier & Échéancier de Trésorerie</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Anticiperez l&apos;encaissement de vos factures, l&apos;exécution de vos abonnements et vos obligations fiscales.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => alert("Synchronisation avec Google Calendar et Microsoft Outlook...")} className="font-bold text-xs rounded-xl shadow-xs">
          <CalendarIcon className="w-4 h-4 mr-1.5 text-blue-600" />
          Synchroniser Google Calendar / Outlook
        </Button>
      </div>

      {/* Quick Alerts Row */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-rose-500/15 border border-amber-300/80 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shadow-md shrink-0">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-950">1 Échéance de facture critique en attente (3.2M FCFA)</h4>
            <p className="text-xs text-slate-600 font-semibold mt-0.5">
              Le client Société Civile du Sahel a dépassé de 3 jours sa date de règlement contractuelle.
            </p>
          </div>
        </div>
        <Button size="sm" onClick={() => alert("📩 Relance SMS + Email + Lien de paiement Wave instantané envoyée au directeur financier du client !")} className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs px-4 py-2.5 rounded-xl whitespace-nowrap shadow-sm">
          Déclencher relance immédiate
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { label: "Tout l'échéancier", value: "all" },
          { label: "Factures à encaisser", value: "échéance_facture" },
          { label: "Renouvellements automatiques", value: "renouvellement_auto" },
          { label: "Fiscalité & Taxes (TVA)", value: "déclaration_tva" },
        ].map((t) => (
          <button
            key={t.value}
            onClick={() => setFilter(t.value)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
              filter === t.value
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/25 scale-105"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Events Timeline */}
      <div className="space-y-4">
        {filteredEvents.map((ev) => (
          <Card key={ev.id} className={`p-5 rounded-3xl border transition-all hover:shadow-soft-md ${
            ev.status === "urgent"
              ? "bg-rose-50/40 border-rose-300 shadow-xs"
              : "bg-white border-slate-200/80 shadow-soft-sm"
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black shrink-0 shadow-xs border ${
                  ev.status === "urgent"
                    ? "bg-rose-600 text-white border-rose-700"
                    : ev.type === "renouvellement_auto"
                    ? "bg-purple-600 text-white border-purple-700"
                    : "bg-slate-900 text-white border-slate-950"
                }`}>
                  <span className="text-lg leading-none">{ev.day}</span>
                  <span className="text-[10px] uppercase tracking-widest opacity-90 mt-0.5">{ev.month}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                      ev.type === "échéance_facture"
                        ? "bg-blue-100 text-blue-800"
                        : ev.type === "renouvellement_auto"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {ev.type.replace("_", " ")}
                    </span>
                    {ev.status === "urgent" && (
                      <span className="text-[10px] font-black uppercase bg-rose-200 text-rose-900 px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                        ⚠️ Critique
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-1.5">{ev.title}</h3>
                  <p className="text-xs text-slate-500 font-medium">Concernant : <strong className="text-slate-700 font-extrabold">{ev.client}</strong></p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end space-x-6 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 font-bold block">Montant en jeu :</span>
                  <span className="text-lg font-black text-slate-950">{convertAndFormat(ev.amount, "FCFA")}</span>
                </div>

                {ev.link ? (
                  <Link href={ev.link}>
                    <Button variant="outline" size="sm" className="font-extrabold text-xs rounded-xl group hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
                      Consulter
                      <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                ) : (
                  <Button onClick={() => alert("Action programmée")} variant="outline" size="sm" className="font-bold text-xs">
                    Gérer
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
