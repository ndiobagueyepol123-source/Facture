import Link from "next/link";
import { AlertTriangle, ArrowLeft, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] text-center px-4 animate-fade-in w-full max-w-2xl mx-auto">
      <div className="w-20 h-20 rounded-2xl bg-amber-50/80 border border-amber-200/60 shadow-md shadow-amber-500/10 flex items-center justify-center text-amber-600 mb-6 transition-transform duration-300 hover:scale-105">
        <AlertTriangle className="w-10 h-10 stroke-[2] animate-pulse" />
      </div>
      <h1 className="text-3xl font-black text-slate-900 tracking-tight">Page ou ressource introuvable</h1>
      <p className="text-xs sm:text-sm font-medium text-slate-500 max-w-md mt-2 leading-relaxed">
        L&apos;adresse que vous tentez de consulter n&apos;existe pas ou a été supprimée de vos archives de facturation.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-8 w-full sm:w-auto">
        <Link
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center font-extrabold px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs shadow-md shadow-blue-600/20 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 h-10"
        >
          <Home className="w-4 h-4 mr-2 stroke-[2.5]" />
          <span>Retour au Dashboard</span>
        </Link>
        <Link
          href="/invoices"
          className="w-full sm:w-auto inline-flex items-center justify-center font-bold px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 border border-slate-200/80 text-xs shadow-2xs transition-all duration-200 transform hover:-translate-y-0.5 h-10"
        >
          <Search className="w-3.5 h-3.5 mr-2 text-slate-500" />
          <span>Rechercher une facture</span>
        </Link>
      </div>
    </div>
  );
}

