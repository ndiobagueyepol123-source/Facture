"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  ShoppingBag,
  Package,
  UserPlus,
  RefreshCw,
  Search,
  ShieldCheck,
  Activity,
  Calendar,
  LogOut,
  ChevronRight,
  Zap,
  CheckCircle2,
  DollarSign
} from "lucide-react";
import { Card } from "@/components/ui/Card";

interface AdminStatsData {
  users: {
    total: number;
    newToday: number;
    newWeek: number;
    newMonth: number;
    active: number;
    inactive: number;
  };
  business: {
    totalSales: number;
    totalRevenue: number;
    totalProducts: number;
    totalClients: number;
  };
  timeline: Array<{
    date: string;
    label: string;
    count: number;
  }>;
  recentEvents: Array<{
    id: string;
    event_type: string;
    metadata: any;
    created_at: string;
    user_email: string | null;
  }>;
  usersList: Array<{
    id: string;
    email: string;
    name: string;
    createdAt: string;
    lastSignInAt: string | null;
    isAdmin: boolean;
    salesCount: number;
    totalSalesAmount: number;
  }>;
}

interface AdminDashboardProps {
  token: string;
  adminUser: { id: string; email: string; name: string; role: string };
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ token, adminUser, onLogout }) => {
  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchUser, setSearchUser] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "events">("overview");

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Erreur chargement stats admin:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [token]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(Math.round(amount)) + " FCFA";
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Jamais";
    const d = new Date(dateString);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredUsers = stats?.usersList.filter((u) => {
    const q = searchUser.toLowerCase();
    return u.email.toLowerCase().includes(q) || u.name.toLowerCase().includes(q);
  }) || [];

  const maxTimelineCount = Math.max(...(stats?.timeline.map((t) => t.count) || [1]), 1);

  return (
    <div className="space-y-8 animate-fade-in w-full text-slate-900">
      {/* 1. HEADER DU DASHBOARD ADMIN */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 rounded-lg flex items-center gap-1.5 border border-purple-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Espace Administrateur Privé</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
            Supervision Globale Vando
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Connecté en tant que <span className="font-bold text-slate-800">{adminUser.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadStats}
            disabled={isLoading}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-all flex items-center space-x-2 transform hover:-translate-y-0.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Actualiser</span>
          </button>

          <button
            onClick={onLogout}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl border border-rose-200 shadow-2xs transition-all flex items-center space-x-2 transform hover:-translate-y-0.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Fermer l'Admin</span>
          </button>
        </div>
      </div>

      {/* 2. ONGLETS DE NAVIGATION ADMIN */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "overview"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Vue d'ensemble
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === "users"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span>Utilisateurs</span>
          <span className="px-1.5 py-0.5 text-[10px] bg-slate-200 text-slate-800 rounded-md font-extrabold">
            {stats?.users.total || 0}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === "events"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span>Flux d'activité</span>
          <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded-md font-extrabold">
            Live
          </span>
        </button>
      </div>

      {isLoading && !stats ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-500">Chargement des données de la plateforme...</p>
        </div>
      ) : stats ? (
        <>
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* SECTION A : KPI UTILISATEURS */}
              <div>
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                  Statistiques Utilisateurs
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Utilisateurs */}
                  <Card className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Total Utilisateurs</span>
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-2">
                      {stats.users.total}
                    </div>
                    <div className="mt-2 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <span>+{stats.users.newMonth} ce mois</span>
                    </div>
                  </Card>

                  {/* Nouveaux Aujourd'hui */}
                  <Card className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Aujourd'hui</span>
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <UserPlus className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-2">
                      {stats.users.newToday}
                    </div>
                    <div className="mt-2 text-[11px] font-semibold text-slate-500">
                      +{stats.users.newWeek} cette semaine
                    </div>
                  </Card>

                  {/* Utilisateurs Actifs (30j) */}
                  <Card className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Actifs (30j)</span>
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <UserCheck className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-indigo-600 mt-2">
                      {stats.users.active}
                    </div>
                    <div className="mt-2 text-[11px] font-semibold text-slate-400">
                      Sur les 30 derniers jours
                    </div>
                  </Card>

                  {/* Inactifs */}
                  <Card className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Inactifs</span>
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <UserX className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-2">
                      {stats.users.inactive}
                    </div>
                    <div className="mt-2 text-[11px] font-semibold text-slate-400">
                      Sans connexion récente
                    </div>
                  </Card>
                </div>
              </div>

              {/* SECTION B : KPI ACTIVITÉ BUSINESS */}
              <div>
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                  Activité Globale de la Plateforme
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Volume Ventes */}
                  <Card className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Total Ventes</span>
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-2">
                      {stats.business.totalSales}
                    </div>
                    <div className="mt-2 text-[11px] font-semibold text-slate-500">
                      Reçus générés
                    </div>
                  </Card>

                  {/* Chiffre d'Affaires Global */}
                  <Card className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">CA Total Cumulé</span>
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-xl font-black text-blue-600 mt-2 truncate" title={formatAmount(stats.business.totalRevenue)}>
                      {formatAmount(stats.business.totalRevenue)}
                    </div>
                    <div className="mt-2 text-[11px] font-semibold text-slate-400">
                      Toutes boutiques confondues
                    </div>
                  </Card>

                  {/* Produits Créés */}
                  <Card className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Articles / Produits</span>
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Package className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-2">
                      {stats.business.totalProducts}
                    </div>
                    <div className="mt-2 text-[11px] font-semibold text-slate-400">
                      En catalogue
                    </div>
                  </Card>

                  {/* Clients Enregistrés */}
                  <Card className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Clients Enregistrés</span>
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-2">
                      {stats.business.totalClients}
                    </div>
                    <div className="mt-2 text-[11px] font-semibold text-slate-400">
                      Dans les carnets clients
                    </div>
                  </Card>
                </div>
              </div>

              {/* SECTION C : GRAPHIQUE ÉVOLUTION INSCRIPTIONS (14 JOURS) */}
              <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Évolution des Inscriptions (14 derniers jours)</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Nombre de nouveaux comptes créés par jour.</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Derniers 14 jours</span>
                  </div>
                </div>

                <div className="h-44 w-full flex items-end justify-between gap-1.5 sm:gap-3 pt-6 pb-2 px-2">
                  {stats.timeline.map((item) => {
                    const heightPercent = Math.max((item.count / maxTimelineCount) * 100, 8);
                    return (
                      <div key={item.date} className="flex-1 flex flex-col items-center gap-2 group relative">
                        {/* Tooltip */}
                        <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg whitespace-nowrap z-20 shadow-md">
                          {item.count} inscription{item.count > 1 ? "s" : ""} le {item.label}
                        </div>
                        
                        {/* Barre */}
                        <div className="w-full flex flex-col justify-end items-center h-28">
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                              item.count > 0
                                ? "bg-gradient-to-t from-purple-600 to-indigo-500 group-hover:brightness-110 shadow-xs"
                                : "bg-slate-100 group-hover:bg-slate-200"
                            }`}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-800 transition-colors">
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          {/* ONGLETS UTILISATEURS */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    placeholder="Rechercher par e-mail ou nom..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
                <div className="text-xs font-bold text-slate-500">
                  {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? "s" : ""} trouvé{filteredUsers.length > 1 ? "s" : ""}
                </div>
              </div>

              <Card className="p-0 overflow-hidden border border-slate-200/80 shadow-md bg-white rounded-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/70">
                        <th className="py-3 px-5">Utilisateur</th>
                        <th className="py-3 px-4">Rôle</th>
                        <th className="py-3 px-4">Inscrit le</th>
                        <th className="py-3 px-4">Dernière Connexion</th>
                        <th className="py-3 px-4 text-right">Ventes</th>
                        <th className="py-3 px-5 text-right">Volume</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80 text-xs">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-purple-50/30 transition-colors">
                          <td className="py-3 px-5">
                            <div>
                              <p className="font-bold text-slate-900">{u.name}</p>
                              <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {u.isAdmin ? (
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200">
                                Admin
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                                Utilisateur
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium">
                            {formatDate(u.createdAt)}
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium">
                            {formatDate(u.lastSignInAt)}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900">
                            {u.salesCount}
                          </td>
                          <td className="py-3 px-5 text-right font-black text-slate-900">
                            {formatAmount(u.totalSalesAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ONGLET FLUX D'ACTIVITÉ */}
          {activeTab === "events" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2">
                <h3 className="text-sm font-black text-slate-900">Derniers événements analytiques</h3>
                <span className="text-xs text-slate-500 font-medium">Enregistrés en temps réel</span>
              </div>

              <div className="space-y-2">
                {stats.recentEvents.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs font-semibold">
                    Aucun événement récent enregistré.
                  </div>
                ) : (
                  stats.recentEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-4 hover:border-purple-200 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            <span className="font-mono text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded mr-2 text-[11px]">
                              {ev.event_type}
                            </span>
                            {ev.user_email ? (
                              <span className="text-slate-600">par {ev.user_email}</span>
                            ) : (
                              <span className="text-slate-400">Système / Anonyme</span>
                            )}
                          </p>
                          {ev.metadata && Object.keys(ev.metadata).length > 0 && (
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {JSON.stringify(ev.metadata)}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                        {formatDate(ev.created_at)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};
