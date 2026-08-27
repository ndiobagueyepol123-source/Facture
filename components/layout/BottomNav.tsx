"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 pointer-events-none">
      {/* Background layer with safe area and border */}
      <div 
        className="absolute inset-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 pointer-events-auto shadow-[0_-4px_10px_rgba(0,0,0,0.02)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      />
      
      {/* Content wrapper */}
      <div 
        className="relative flex items-center justify-between px-10 h-[72px] pointer-events-auto"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Left: Home */}
        <Link 
          href="/"
          className={cn(
            "flex flex-col items-center justify-center w-16 h-full transition-colors active:scale-95 group relative",
            pathname === "/" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
          )}
        >
          <div className="p-1.5 transition-all duration-300">
            <LayoutDashboard className={cn("w-6 h-6", pathname === "/" ? "stroke-[2.5]" : "stroke-[1.5]")} />
          </div>
          <span className="text-[10px] font-bold tracking-wide">Accueil</span>
          {pathname === "/" && (
            <div className="absolute -bottom-1 w-1.5 h-1.5 bg-blue-600 rounded-full" />
          )}
        </Link>

        {/* Center: Floating Action Button (+) */}
        <div className="relative -top-7">
          <Link href="/invoices/create" className="group block active:scale-95 transition-transform">
            <div className="w-[64px] h-[64px] rounded-full bg-blue-600 flex items-center justify-center shadow-[0_8px_20px_rgba(37,99,235,0.4)] border-4 border-[#ffffff] group-hover:bg-blue-700 transition-colors">
              <Plus className="w-8 h-8 text-white stroke-[2.5]" />
            </div>
          </Link>
        </div>

        {/* Right: Invoices */}
        <Link 
          href="/invoices"
          className={cn(
            "flex flex-col items-center justify-center w-16 h-full transition-colors active:scale-95 group relative",
            pathname?.startsWith("/invoices") && pathname !== "/invoices/create" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
          )}
        >
          <div className="p-1.5 transition-all duration-300">
            <FileText className={cn("w-6 h-6", pathname?.startsWith("/invoices") && pathname !== "/invoices/create" ? "stroke-[2.5]" : "stroke-[1.5]")} />
          </div>
          <span className="text-[10px] font-bold tracking-wide">Ventes</span>
          {pathname?.startsWith("/invoices") && pathname !== "/invoices/create" && (
            <div className="absolute -bottom-1 w-1.5 h-1.5 bg-blue-600 rounded-full" />
          )}
        </Link>
      </div>
    </div>
  );
};
