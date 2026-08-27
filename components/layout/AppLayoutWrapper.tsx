"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { SecretAdminTrigger } from "@/components/admin/SecretAdminTrigger";

export const AppLayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  
  const isAuthPage = 
    pathname === "/login" || 
    pathname === "/register" || 
    pathname === "/forgot-password" || 
    pathname?.startsWith("/auth/") ||
    pathname === "/setup";

  if (isAuthPage) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <SecretAdminTrigger />
        {children}
      </main>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Secret Global Admin Trigger */}
      <SecretAdminTrigger />

      {/* Left Vertical Sidebar */}
      <Sidebar />

      {/* Main Workspace content */}
      <div className="flex-1 ml-0 lg:ml-56 flex flex-col min-h-screen transition-all duration-300 min-w-0">
        <Navbar />
        <main className="flex-1 p-3 sm:p-5 lg:p-6 pb-24 lg:pb-6 mx-auto max-w-6xl w-full min-w-0">
          {children}
        </main>
        <footer className="no-print py-6 px-8 border-t border-slate-200/60 bg-white/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© 2026 FacturAfric Solutions SARL — Tous droits réservés.</p>
          <div className="flex items-center space-x-6 mt-2 sm:mt-0 font-medium">
            <a href="#" className="hover:text-slate-600 transition-colors">Sécurité RLS & SSL</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Conditions Générales</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Support Live Dakar</a>
          </div>
        </footer>
        <BottomNav />
      </div>
    </div>
  );
};
