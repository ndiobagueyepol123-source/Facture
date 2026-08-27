"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Store, 
  Save, 
  CheckCircle, 
  MapPin, 
  Map, 
  Globe, 
  ChevronDown, 
  Loader2, 
  RotateCcw, 
  Trash2, 
  AlertTriangle, 
  ShieldAlert, 
  X, 
  AlertCircle 
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CompanySettings, Invoice } from "@/types";
import { Receipt } from "@/components/receipt/Receipt";
import { getCompanySettings, saveCompanySettings, defaultCompanySettings } from "@/lib/api/settings";
import { createClient } from "@/lib/supabase/client";

const COUNTRIES = [
  { code: 'SN', name: 'Sénégal', dialCode: '+221', flag: '🇸🇳' },
  { code: 'CI', name: 'Côte d\'Ivoire', dialCode: '+225', flag: '🇨🇮' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'ML', name: 'Mali', dialCode: '+223', flag: '🇲🇱' },
  { code: 'GN', name: 'Guinée', dialCode: '+224', flag: '🇬🇳' },
];

export const SettingsView: React.FC = () => {
  const router = useRouter();
  const [settings, setSettings] = useState<CompanySettings>(defaultCompanySettings);
  const [savedSettings, setSavedSettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>("");

  // Modal & Action states
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    setCurrentTime(new Date().toISOString());
    const timer = setInterval(() => {
      setCurrentTime(new Date().toISOString());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const loaded = await getCompanySettings();
      setSettings(loaded);
      setSavedSettings(loaded);
      setIsLoading(false);
    }
    load();
  }, []);

  const isDirty = savedSettings ? JSON.stringify(settings) !== JSON.stringify(savedSettings) : false;
  const isSaved = !isDirty && savedSettings !== null && !isLoading;

  const selectedCountry = COUNTRIES.find(c => c.code === settings.country) || COUNTRIES[0];

  const handleSave = async () => {
    setIsSaving(true);
    const updated = await saveCompanySettings(settings);
    setIsSaving(false);
    if (updated) {
      setSettings(updated);
      setSavedSettings(updated);
      setNotification({ type: 'success', message: 'Paramètres enregistrés avec succès !' });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const formatLocalPhone = (val: string, countryCode: string) => {
    let cleaned = val.replace(/\D/g, ''); 
    if (countryCode === 'SN') {
      let res = '';
      if (cleaned.length > 0) res += cleaned.substring(0, 2);
      if (cleaned.length > 2) res += ' ' + cleaned.substring(2, 5);
      if (cleaned.length > 5) res += ' ' + cleaned.substring(5, 7);
      if (cleaned.length > 7) res += ' ' + cleaned.substring(7, 9);
      return res;
    }
    return cleaned;
  };

  // Réinitialisation de toutes les données du tableau de bord (Remise à zéro)
  const handleResetData = async () => {
    try {
      setIsResetting(true);
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setNotification({ type: 'error', message: 'Session expirée. Veuillez vous reconnecter.' });
        setIsResetting(false);
        setIsResetModalOpen(false);
        return;
      }

      const res = await fetch('/api/account/reset-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const data = await res.json();
      setIsResetting(false);
      setIsResetModalOpen(false);

      if (res.ok && data.success) {
        setNotification({ 
          type: 'success', 
          message: 'Votre tableau de bord et l\'ensemble de vos données ont été remis à zéro avec succès !' 
        });
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1500);
      } else {
        setNotification({ 
          type: 'error', 
          message: data.error || 'Une erreur est survenue lors de la réinitialisation des données.' 
        });
      }
    } catch (err) {
      setIsResetting(false);
      setIsResetModalOpen(false);
      setNotification({ type: 'error', message: 'Impossible de joindre le serveur.' });
    }
  };

  // Suppression définitive du compte utilisateur
  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'SUPPRIMER') {
      return;
    }

    try {
      setIsDeleting(true);
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setNotification({ type: 'error', message: 'Session expirée. Veuillez vous reconnecter.' });
        setIsDeleting(false);
        setIsDeleteModalOpen(false);
        return;
      }

      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const data = await res.json();
      setIsDeleting(false);
      setIsDeleteModalOpen(false);

      if (res.ok && data.success) {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
      } else {
        setNotification({ 
          type: 'error', 
          message: data.error || 'Une erreur est survenue lors de la suppression du compte.' 
        });
      }
    } catch (err) {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setNotification({ type: 'error', message: 'Impossible de joindre le serveur.' });
    }
  };

  const dummyInvoice: Invoice = {
    id: "preview",
    number: "000001",
    issueDate: currentTime || new Date().toISOString(),
    dueDate: currentTime || new Date().toISOString(),
    clientId: "",
    client: {} as any,
    items: [],
    subtotal: 45000,
    vatRate: 0,
    vatAmount: 0,
    discountRate: 0,
    discountAmount: 0,
    total: 45000,
    amountPaid: 45000,
    amountDue: 0,
    status: "Payée",
    currency: "FCFA"
  };

  const receiptSettings = {
    ...settings,
    country: settings.country ? selectedCountry.name : "",
    phone: settings.phone ? `${selectedCountry.dialCode} ${settings.phone}` : "",
    phone2: settings.phone2 ? `${selectedCountry.dialCode} ${settings.phone2}` : "",
  };

  return (
    <div className="space-y-8 pb-14 animate-fade-in w-full min-w-0 max-w-6xl mx-auto">
      {/* Notifications Toast */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold border shadow-md animate-fade-in ${
          notification.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-emerald-500/10' 
            : 'bg-rose-50 text-rose-800 border-rose-200 shadow-rose-500/10'
        }`}>
          <div className="flex items-center space-x-2.5">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* En-tête de page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Paramètres
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Gérez les informations de votre boutique, vos données et la sécurité de votre compte.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Colonne Gauche : Formulaires & Zone de danger */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Section 1 : Informations de la boutique */}
          <div>
            <h2 className="text-lg font-black text-slate-900 mb-4">Informations de la boutique</h2>
            <Card className="p-6 sm:p-8 bg-white border border-slate-200/80 shadow-md rounded-2xl space-y-6 transition-colors">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Nom de la boutique
                </label>
                <div className="relative">
                  <Store className={`absolute left-3 top-3 w-5 h-5 pointer-events-none transition-colors ${isSaved ? "text-emerald-500" : "text-slate-400"}`} />
                  <input
                    type="text"
                    value={settings.name}
                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                    className={`w-full pl-10 pr-4 py-4 text-base font-semibold transition-all shadow-2xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl ${isSaved ? "bg-emerald-50/40 border border-emerald-200 text-slate-900" : "bg-white border border-slate-200 text-slate-900"}`}
                    placeholder="Ex. Boutique Diop"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Adresse / Lieu
                  </label>
                  <div className="relative">
                    <MapPin className={`absolute left-3 top-3 w-5 h-5 pointer-events-none transition-colors ${isSaved ? "text-emerald-500" : "text-slate-400"}`} />
                    <input
                      type="text"
                      value={settings.address}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      className={`w-full pl-10 pr-4 py-4 text-base font-semibold transition-all shadow-2xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl ${isSaved ? "bg-emerald-50/40 border border-emerald-200 text-slate-900" : "bg-white border border-slate-200 text-slate-900"}`}
                      placeholder="Ex. Parcelles Assainies, U6"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Ville
                  </label>
                  <div className="relative">
                    <Map className={`absolute left-3 top-3 w-5 h-5 pointer-events-none transition-colors ${isSaved ? "text-emerald-500" : "text-slate-400"}`} />
                    <input
                      type="text"
                      value={settings.city}
                      onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                      className={`w-full pl-10 pr-4 py-4 text-base font-semibold transition-all shadow-2xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl ${isSaved ? "bg-emerald-50/40 border border-emerald-200 text-slate-900" : "bg-white border border-slate-200 text-slate-900"}`}
                      placeholder="Ex. Dakar"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Pays
                </label>
                <div className="relative">
                  <Globe className={`absolute left-3 top-3 w-5 h-5 pointer-events-none z-10 transition-colors ${isSaved ? "text-emerald-500" : "text-slate-400"}`} />
                  <select
                    value={settings.country}
                    onChange={(e) => setSettings({ ...settings, country: e.target.value })}
                    className={`w-full pl-10 pr-10 py-4 text-base font-semibold transition-all shadow-2xs appearance-none relative z-0 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl ${isSaved ? "bg-emerald-50/40 border border-emerald-200 text-slate-900" : "bg-white border border-slate-200 text-slate-900"}`}
                  >
                    {COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.name} ({c.dialCode})</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100/60">
                <div className="flex flex-col justify-end">
                  <label className="block text-sm font-bold text-slate-700 mb-2 truncate">
                    Numéro principal
                  </label>
                  <div className={`flex shadow-2xs rounded-xl focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all overflow-hidden border ${isSaved ? 'bg-emerald-50/40 border-emerald-200' : 'bg-white border-slate-200'}`}>
                    <div className={`flex-shrink-0 flex items-center justify-center px-3 border-r text-sm font-bold whitespace-nowrap transition-colors ${isSaved ? 'bg-emerald-100/50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                      <span className="mr-1.5">{selectedCountry.flag}</span>
                      <span>{selectedCountry.dialCode}</span>
                    </div>
                    <input
                      type="tel"
                      value={settings.phone}
                      onChange={(e) => setSettings({ ...settings, phone: formatLocalPhone(e.target.value, selectedCountry.code) })}
                      className="w-full pl-3 pr-4 py-4 text-base font-semibold text-slate-900 bg-transparent focus:outline-none placeholder-slate-400"
                      placeholder="77 123 45 67"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col justify-end">
                  <label className="block text-sm font-bold text-slate-700 mb-2 truncate">
                    Téléphone supplémentaire <span className="text-slate-400 font-normal">(Optionnel)</span>
                  </label>
                  <div className={`flex shadow-2xs rounded-xl focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all overflow-hidden border ${isSaved ? 'bg-emerald-50/40 border-emerald-200' : 'bg-white border-slate-200'}`}>
                    <div className={`flex-shrink-0 flex items-center justify-center px-3 border-r text-sm font-bold whitespace-nowrap transition-colors ${isSaved ? 'bg-emerald-100/50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                      <span className="mr-1.5">{selectedCountry.flag}</span>
                      <span>{selectedCountry.dialCode}</span>
                    </div>
                    <input
                      type="tel"
                      value={settings.phone2 || ""}
                      onChange={(e) => setSettings({ ...settings, phone2: formatLocalPhone(e.target.value, selectedCountry.code) })}
                      className="w-full pl-3 pr-4 py-4 text-base font-semibold text-slate-900 bg-transparent focus:outline-none placeholder-slate-400"
                      placeholder="76 123 45 67"
                    />
                  </div>
                </div>
              </div>

            </Card>
          </div>

          {/* Bouton d'enregistrement */}
          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`w-full sm:w-auto py-4 px-8 flex items-center justify-center space-x-2 text-base font-black rounded-2xl shadow-md transition-all transform active:scale-[0.98] ${isSaved ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-none hover:bg-emerald-100" : "text-white bg-blue-600 hover:bg-blue-700 shadow-blue-500/25 hover:-translate-y-0.5"}`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Enregistrement en cours...</span>
                </>
              ) : isSaved ? (
                <>
                  <CheckCircle className="w-5 h-5 stroke-[2.5]" />
                  <span>Paramètres enregistrés</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 stroke-[2.5]" />
                  <span>Enregistrer les paramètres</span>
                </>
              )}
            </button>
          </div>

          {/* Section 2 : Zone de Danger & Gestion avancée des données */}
          <div className="pt-6 border-t border-slate-200/80">
            <div className="mb-4">
              <h2 className="text-lg font-black text-rose-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>Zone de Danger & Gestion des Données</span>
              </h2>
              <p className="text-xs font-medium text-slate-500 mt-1">
                Actions irréversibles de réinitialisation de votre commerce ou de suppression de compte.
              </p>
            </div>

            <Card className="p-6 bg-white border border-rose-200/80 shadow-md rounded-2xl space-y-6">
              
              {/* Option A : Remise à zéro du Dashboard */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                      <RotateCcw className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      Remettre mon tableau de bord à zéro
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 max-w-md pt-1 leading-relaxed">
                    Efface toutes les factures, reçus, clients, produits et statistiques de vente. Votre compte reste actif et vous recommencez à zéro.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(true)}
                  className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 text-xs font-black rounded-xl shadow-xs transition-all transform hover:-translate-y-0.5 active:scale-95 flex-shrink-0 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Remettre à zéro</span>
                </button>
              </div>

              {/* Option B : Suppression définitive du compte */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                      <Trash2 className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-bold text-rose-900">
                      Supprimer définitivement mon compte
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 max-w-md pt-1 leading-relaxed">
                    Supprime irréversiblement votre compte, votre accès et l&apos;ensemble de vos données associées. Cette action est définitive.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirmText("");
                    setIsDeleteModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-md shadow-rose-600/20 transition-all transform hover:-translate-y-0.5 active:scale-95 flex-shrink-0 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Supprimer le compte</span>
                </button>
              </div>

            </Card>
          </div>

        </div>

        {/* Colonne Droite : Aperçu du reçu */}
        <div className="lg:col-span-5 sticky top-6 lg:pl-6 pt-0">
          <div className="mb-4 text-center">
            <h2 className="text-lg font-black text-slate-900 flex items-center justify-center">
              Aperçu du reçu
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Mis à jour en temps réel.</p>
          </div>
          
          <div className="p-6 sm:p-8 bg-slate-100 rounded-3xl flex items-start justify-center border border-slate-200 shadow-inner overflow-hidden min-h-[400px]">
            <Receipt settings={receiptSettings} invoice={dummyInvoice} isPreview={true} />
          </div>
        </div>
        
      </div>

      {/* Modal 1 : Confirmation Remise à zéro */}
      {isResetModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6 animate-scale-up">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-100">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-slate-900">
                Remettre le tableau de bord à zéro ?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cette action va supprimer <strong className="text-slate-700">toutes vos factures, tous vos clients, tous vos produits</strong> et réinitialiser vos statistiques à 0.
              </p>
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-left text-[11px] font-semibold text-amber-900">
                ⚠️ Votre compte restera actif. Vous pourrez recommencer immédiatement votre gestion sur un tableau de bord vierge.
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isResetting}
                onClick={() => setIsResetModalOpen(false)}
                className="flex-1 py-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={handleResetData}
                className="flex-1 py-3 text-xs font-black text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Réinitialisation...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>Oui, remettre à zéro</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2 : Confirmation Suppression Définitive du Compte */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-rose-100 space-y-6 animate-scale-up">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-rose-950">
                Supprimer définitivement votre compte ?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cette action est <strong className="text-rose-600 font-black">irréversible</strong>. Votre compte, vos identifiants, vos factures et l&apos;ensemble de vos données seront définitivement effacés de nos serveurs.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">
                Veuillez taper <span className="font-mono font-black text-rose-600">SUPPRIMER</span> pour confirmer :
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="SUPPRIMER"
                className="w-full px-3.5 py-2.5 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 uppercase transition-all"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isDeleting || deleteConfirmText.trim().toUpperCase() !== 'SUPPRIMER'}
                onClick={handleDeleteAccount}
                className="flex-1 py-3 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Suppression...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Supprimer mon compte</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
