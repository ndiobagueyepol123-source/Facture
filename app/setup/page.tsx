"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Phone, ArrowRight, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function SetupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ shopName: "", phone: "" });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.shopName) return setError("Veuillez entrer le nom de la boutique.");
    if (!formData.phone) return setError("Veuillez entrer le numéro de téléphone de la boutique.");

    // Simulation : Définir un flag pour indiquer un nouvel utilisateur sans vente
    if (typeof window !== "undefined") {
      localStorage.setItem("vando_is_new_user", "true");
    }

    // Redirection vers le Dashboard
    router.push("/");
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row justify-center items-center p-4 gap-8 md:gap-16 max-w-5xl mx-auto w-full">
      
      {/* Formulaire de configuration */}
      <div className="w-full max-w-md">
        <div className="text-center md:text-left mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Configurez votre boutique</h1>
          <p className="text-slate-500 font-medium">Ces informations apparaîtront sur vos reçus.</p>
        </div>

        <Card className="p-6 sm:p-8 bg-white border border-slate-200/80 shadow-xl rounded-3xl">
          {error && (
            <div className="flex items-center space-x-2 bg-rose-50 text-rose-700 py-3 px-4 rounded-xl border border-rose-100 mb-6">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-bold text-xs">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Nom de la boutique</label>
              <div className="relative">
                <Store className="absolute left-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={formData.shopName}
                  onChange={e => setFormData({ ...formData, shopName: e.target.value })}
                  placeholder="Ex: Boutique Diop"
                  className="w-full pl-10 pr-4 py-3 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Numéro de téléphone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Ex: 77 XX XX XX"
                  className="w-full pl-10 pr-4 py-3 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-2xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 flex items-center justify-center space-x-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-500/20 transform hover:-translate-y-0.5 transition-all mt-4"
            >
              <span>Continuer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </Card>
      </div>

      {/* Aperçu Live du Reçu */}
      <div className="w-full max-w-sm mt-8 md:mt-0">
        <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Aperçu de votre reçu</p>
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xl font-mono text-sm mx-auto w-full max-w-sm flex flex-col items-center text-slate-900 transform rotate-1 hover:rotate-0 transition-transform duration-300">
          
          {/* En-tête ticket */}
          <div className="text-center mb-6 w-full">
            <h2 className="text-xl font-black uppercase mb-1 truncate">
              {formData.shopName || "VOTRE BOUTIQUE"}
            </h2>
            <p className="text-xs text-slate-500 mb-4 truncate">
              {formData.phone || "+221 77 XXX XX XX"}
            </p>
            <div className="border-b-2 border-dashed border-slate-300 w-full mb-1"></div>
          </div>

          {/* Liste des produits (Démo) */}
          <div className="w-full space-y-4 mb-6">
            <div className="flex flex-col">
              <span className="font-bold">Riz 50kg</span>
              <div className="flex justify-between mt-1 text-slate-600">
                <span>2 × 15 000</span>
                <span className="font-bold text-slate-900">30 000 FCFA</span>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="w-full border-t-2 border-dashed border-slate-300 pt-4 mb-8">
            <div className="flex justify-between items-center text-lg">
              <span className="font-black">TOTAL :</span>
              <span className="font-black">30 000 FCFA</span>
            </div>
          </div>

          {/* Pied de ticket */}
          <div className="text-center w-full">
            <p className="font-bold text-base mb-2">MERCI !</p>
          </div>
        </div>
      </div>
      
    </div>
  );
}
