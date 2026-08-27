"use client";

import React, { useState, useEffect } from "react";
import { X, Shield, ShieldAlert, ShieldCheck, Lock, Loader2, LogIn, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AdminDashboard } from "@/features/admin/AdminDashboard";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [token, setToken] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string>("");

  // Login form state (pour connexion avec un autre compte admin si besoin)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);

  const verifyCurrentSession = async () => {
    setIsVerifying(true);
    setAuthError("");

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session || !session.access_token) {
        setIsAdmin(false);
        setShowLoginForm(true);
        setIsVerifying(false);
        return;
      }

      setToken(session.access_token);

      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await res.json();

      if (res.ok && data.isAdmin) {
        setIsAdmin(true);
        setAdminUser(data.user);
      } else {
        setIsAdmin(false);
        setAuthError(data.error || "Accès refusé. Ce compte ne dispose pas des privilèges administrateur.");
      }
    } catch (err) {
      console.error("Erreur vérification session admin:", err);
      setIsAdmin(false);
      setAuthError("Impossible de vérifier vos privilèges. Réessayez.");
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      verifyCurrentSession();
    }
  }, [isOpen]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    setAuthError("");

    try {
      const supabase = createClient();
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError || !signInData.session) {
        setIsSubmitting(false);
        return setAuthError("Adresse e-mail ou mot de passe incorrect.");
      }

      const newToken = signInData.session.access_token;
      setToken(newToken);

      // Vérification serveur du rôle
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${newToken}`,
        },
      });

      const data = await res.json();

      if (res.ok && data.isAdmin) {
        setIsAdmin(true);
        setAdminUser(data.user);
        setShowLoginForm(false);
      } else {
        setIsAdmin(false);
        setAuthError(data.error || "Accès refusé. Ce compte ne dispose pas des privilèges administrateur.");
      }
    } catch (err) {
      setAuthError("Erreur de connexion au serveur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoutAdmin = () => {
    setIsAdmin(false);
    setAdminUser(null);
    setToken("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      {/* Conteneur principal */}
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Barre supérieure discrète avec bouton Fermer */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse"></span>
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              Vando Admin Gateway
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-all"
            title="Fermer l'espace admin"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps de la modale */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          {isVerifying ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-slate-700">Vérification des privilèges administrateur...</p>
            </div>
          ) : isAdmin && adminUser ? (
            <AdminDashboard token={token} adminUser={adminUser} onLogout={handleLogoutAdmin} />
          ) : (
            /* ÉCRAN D'AUTHENTIFICATION OU REFUS ADMIN */
            <div className="max-w-md mx-auto py-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto shadow-sm border border-purple-200">
                <Lock className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  🔐 Accès administrateur
                </h2>
                <p className="text-xs font-medium text-slate-500 mt-1.5">
                  Espace confidentiel réservé aux administrateurs autorisés de Vando.
                </p>
              </div>

              {authError && (
                <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl flex items-start space-x-3 text-xs font-semibold border border-rose-100 text-left animate-fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Formulaire de connexion administrateur */}
              <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Adresse e-mail administrateur
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@vando.app"
                    className="w-full px-3.5 py-3 text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-3 text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 flex items-center justify-center space-x-2 text-xs font-black text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md shadow-purple-500/20 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Authentifier l'administrateur</span>
                    </>
                  )}
                </button>
              </form>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={onClose}
                  className="text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
                >
                  Annuler et retourner à Vando
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
