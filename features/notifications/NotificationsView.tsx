"use client";

import React, { useState } from "react";
import { Bell, Check, CheckCircle2, AlertCircle, Sparkles, Clock, ShieldAlert, FileText } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mockNotifications } from "@/lib/mockData";
import { AppNotification } from "@/types";

export const NotificationsView: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case "overdue":
        return <AlertCircle className="w-5 h-5 text-rose-600 animate-pulse" />;
      case "new_client":
        return <Sparkles className="w-5 h-5 text-blue-600" />;
      case "system":
        return <FileText className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center">
            Centre de Notifications
            {unreadCount > 0 && (
              <span className="ml-3 px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-extrabold text-xs">
                {unreadCount} nouveau(x)
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Suivi en direct de vos encaissements Wave, alertes de facturation en retard et mises à jour système.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="text-xs font-bold text-blue-600 border-blue-200">
            <Check className="w-4 h-4 mr-1.5" />
            Tout marquer comme lu
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((notif) => (
          <Card
            key={notif.id}
            variant="interactive"
            className={`p-5 flex items-start justify-between gap-4 transition-all ${
              !notif.read ? "bg-blue-50/50 border-l-4 border-blue-600 shadow-sm" : "bg-white"
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-2xl ${!notif.read ? "bg-white shadow-sm border border-blue-100" : "bg-slate-100"}`}>
                {getIcon(notif.type)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-black text-slate-900">{notif.title}</h3>
                  {!notif.read && <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{notif.description}</p>
                <span className="inline-block text-[11px] text-slate-400 font-bold mt-1">🕒 {notif.date}</span>
              </div>
            </div>
            <button
              onClick={() => deleteNotification(notif.id)}
              className="text-slate-300 hover:text-rose-600 text-xs font-bold px-2 py-1 rounded-lg transition-colors"
              title="Supprimer"
            >
              ✕
            </button>
          </Card>
        ))}
      </div>

      {notifications.length === 0 && (
        <Card className="py-16 text-center">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3 stroke-1" />
          <h3 className="text-base font-bold text-slate-700">Aucune notification en attente</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Votre fil d&apos;actualité et de relances de paiement est à jour !
          </p>
        </Card>
      )}
    </div>
  );
};
