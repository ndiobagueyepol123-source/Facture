"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Rocket, Sparkles, Wrench } from "lucide-react";

interface UnderConstructionProps {
  title?: string;
  description?: string;
}

export const UnderConstruction: React.FC<UnderConstructionProps> = ({
  title = "Module",
  description = "Nous préparons une nouvelle version ultra-moderne et interactive pour cet espace. Restez connectés, les prochaines mises à jour arriveront très bientôt !"
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] py-12 px-4 text-center animate-fade-in">
      <div className="relative mb-8 group">
        {/* Animated Background Glow */}
        <div className="absolute -inset-2 bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition-all duration-700 animate-pulse" />
        
        {/* Icon Card */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white border border-slate-200/80 shadow-2xl flex items-center justify-center transform group-hover:-translate-y-2 group-hover:rotate-2 transition-all duration-500 cursor-pointer">
          <Rocket className="w-12 h-12 text-blue-600 group-hover:scale-110 transition-transform duration-500 stroke-[2]" />
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-slate-900 border-2 border-white shadow-lg flex items-center justify-center text-amber-400">
            <Wrench className="w-5 h-5 animate-bounce stroke-[2.25]" />
          </div>
          <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-emerald-500 border-2 border-white shadow-md flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/60 text-amber-800 font-extrabold text-[11px] uppercase tracking-wider shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <span>En cours de construction</span>
        </span>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {title} — <span className="text-blue-600">Bientôt disponible !</span>
        </h1>

        <p className="text-xs sm:text-sm font-medium text-slate-500 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-8">
        <Link href="/">
          <button
            type="button"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-slate-900 hover:bg-blue-600 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-1 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Retourner au Dashboard</span>
          </button>
        </Link>
      </div>
    </div>
  );
};
