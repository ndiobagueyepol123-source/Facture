"use client";

import React from "react";
import Link from "next/link";
import { 
  FileText, 
  Users, 
  AlertOctagon, 
  Plus, 
  RefreshCw,
  SearchX
} from "lucide-react";
import { Card } from "@/components/ui/Card";

/* -------------------------------------------------------------------------- */
/* 1. COMPOSANT D'ÉTAT VIDE (EMPTY STATE)                                      */
/* -------------------------------------------------------------------------- */
export interface EmptyStateProps {
  type?: "invoices" | "clients" | "search" | "general";
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = "general",
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}) => {
  const getIcon = () => {
    switch (type) {
      case "invoices":
        return <FileText className="w-10 h-10 text-blue-600 stroke-[1.5]" />;
      case "clients":
        return <Users className="w-10 h-10 text-indigo-600 stroke-[1.5]" />;
      case "search":
        return <SearchX className="w-10 h-10 text-amber-600 stroke-[1.5]" />;
      default:
        return <FileText className="w-10 h-10 text-slate-600 stroke-[1.5]" />;
    }
  };

  const getBadgeStyle = () => {
    switch (type) {
      case "invoices":
        return "bg-blue-50/80 border-blue-100 shadow-blue-500/5";
      case "clients":
        return "bg-indigo-50/80 border-indigo-100 shadow-indigo-500/5";
      case "search":
        return "bg-amber-50/80 border-amber-100 shadow-amber-500/5";
      default:
        return "bg-slate-50 border-slate-200/80";
    }
  };

  return (
    <Card className="p-8 sm:p-14 text-center flex flex-col items-center justify-center bg-white border border-slate-200/80 rounded-2xl shadow-sm max-w-2xl mx-auto my-6 animate-fade-in">
      <div
        className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 border shadow-inner transition-transform duration-300 transform hover:scale-105 ${getBadgeStyle()}`}
      >
        {getIcon()}
      </div>
      <h3 className="text-xl font-black tracking-tight text-slate-900">{title}</h3>
      <p className="text-xs sm:text-sm font-medium text-slate-500 max-w-md mt-2 leading-relaxed">
        {description}
      </p>

      {actionLabel && (
        <div className="mt-8">
          {actionHref ? (
            <Link href={actionHref}>
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs py-2.5 px-6 rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30"
              >
                <Plus className="w-4 h-4 mr-2 stroke-[3]" />
                <span>{actionLabel}</span>
              </button>
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs py-2.5 px-6 rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30"
            >
              <Plus className="w-4 h-4 mr-2 stroke-[3]" />
              <span>{actionLabel}</span>
            </button>
          )}
        </div>
      )}
    </Card>
  );
};

/* -------------------------------------------------------------------------- */
/* 2. SQUELETTE DE CHARGEMENT POUR TABLEAU (TABLE SKELETON)                   */
/* -------------------------------------------------------------------------- */
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 6,
}) => {
  return (
    <Card className="p-0 overflow-hidden border border-slate-200/80 shadow-md bg-white rounded-2xl animate-pulse">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[650px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="py-3.5 px-5">
                  <div className="h-3 w-20 bg-slate-200 rounded-md" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/80">
            {Array.from({ length: rows }).map((_, rIdx) => (
              <tr key={rIdx} className="bg-white">
                {Array.from({ length: columns }).map((_, cIdx) => (
                  <td key={cIdx} className="py-4 px-5">
                    <div
                      className={`h-3.5 bg-slate-100 rounded-lg ${
                        cIdx === 0 ? "w-24 bg-slate-200/80" : cIdx === 1 ? "w-40" : "w-16"
                      }`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
        <div className="h-3 w-28 bg-slate-200 rounded-md" />
        <div className="h-3 w-32 bg-slate-200 rounded-md" />
      </div>
    </Card>
  );
};

/* -------------------------------------------------------------------------- */
/* 3. SQUELETTE DE CHARGEMENT POUR CARTES / DASHBOARD (CARD SKELETON)         */
/* -------------------------------------------------------------------------- */
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          className="p-5 border border-slate-200/80 rounded-2xl shadow-xs bg-white space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-slate-100" />
            <div className="w-12 h-5 rounded-lg bg-slate-100" />
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-3 w-24 bg-slate-200 rounded-md" />
            <div className="h-6 w-32 bg-slate-200 rounded-lg" />
          </div>
        </Card>
      ))}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 4. MESSAGE D'ERREUR ÉLÉGANT (ERROR ALERT)                                  */
/* -------------------------------------------------------------------------- */
export interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title = "Une erreur est survenue",
  message,
  onRetry,
}) => {
  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border border-rose-200/80 text-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shadow-sm max-w-4xl mx-auto my-4 animate-fade-in">
      <div className="flex items-start sm:items-center space-x-3.5">
        <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0 shadow-2xs">
          <AlertOctagon className="w-5 h-5 stroke-[2.25] animate-pulse" />
        </div>
        <div>
          <strong className="font-black text-rose-900 text-sm block">{title}</strong>
          <p className="text-rose-700 mt-1 font-medium text-xs sm:text-sm leading-relaxed">
            {message}
          </p>
        </div>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="bg-white hover:bg-rose-600 text-rose-700 hover:text-white font-bold text-xs py-2.5 px-4 rounded-xl border border-rose-200 hover:border-transparent shadow-xs hover:shadow-md hover:shadow-rose-600/20 flex items-center flex-shrink-0 transition-all duration-200 transform hover:-translate-y-0.5"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" style={{ animationDuration: "3s" }} />
          <span>Réessayer</span>
        </button>
      )}
    </div>
  );
};
