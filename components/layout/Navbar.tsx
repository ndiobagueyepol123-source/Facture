"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/providers/CurrencyProvider";
import { Logo } from "@/components/ui/Logo";
import { createClient } from "@/lib/supabase/client";
import {
  Search,
  Bell,
  ChevronDown,
  Check
} from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const { activeCurrency, setCurrency } = useCurrency();
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  
  const [userEmail, setUserEmail] = useState<string>("Chargement...");
  const [avatarUrl, setAvatarUrl] = useState<string>("https://ui-avatars.com/api/?name=?&background=F1F5F9&color=64748B");

  useEffect(() => {
    const supabase = createClient();
    
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        setUserEmail(user.email);
        const displayName = user.user_metadata?.full_name || user.email;
        setAvatarUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2563eb&color=fff&rounded=true&bold=true`);
      }
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        const displayName = session.user.user_metadata?.full_name || session.user.email;
        setAvatarUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2563eb&color=fff&rounded=true&bold=true`);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const currencies = [
    "FCFA — XOF",
    "FCFA — XAF",
    "NGN — Naira",
    "GHS — Cedi",
    "KES — Shilling kényan",
    "ZAR — Rand",
    "MAD — Dirham marocain",
    "EGP — Livre égyptienne"
  ];

  return (
    <>
      <header className="no-print sticky top-0 z-30 flex items-center justify-between h-16 pt-2 px-5 bg-white transition-all">
        <div className="flex items-center w-full max-w-xs sm:max-w-sm gap-3">
          {/* Mobile Brand Logo (< lg screens) */}
          <Link href="/" className="flex lg:hidden items-center flex-shrink-0" title="Accueil Vando">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-xs shrink-0">
              <span className="text-white font-black text-xl">V</span>
            </div>
            <div className="ml-3">
              <h1 className="text-[17px] font-black text-slate-900 leading-tight tracking-tight">Vando</h1>
              <p className="text-[10px] text-slate-500 font-medium leading-none">Votre gestion simplifiée</p>
            </div>
          </Link>

          {/* Search Field */}
          <div className="relative w-full hidden sm:flex items-center">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-8 pr-3 py-1.5 h-8 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-xs font-medium text-slate-800 rounded-lg border border-slate-200/60 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 placeholder:text-slate-400"
            />
          </div>
        </div>

      {/* Right Tools */}
      <div className="flex items-center space-x-1.5 sm:space-x-2.5 ml-2">
        {/* Currency Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
            className="flex items-center justify-between space-x-1.5 bg-slate-50 hover:bg-slate-100 text-slate-900 text-[13px] font-bold px-3 py-1.5 rounded-full border border-slate-200/60 transition-all shadow-2xs"
          >
            <span>{activeCurrency.split(' ')[0]}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
          {showCurrencyDropdown && (
            <div className="absolute right-0 mt-1.5 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 animate-fade-in">
              <p className="text-[10px] font-bold text-slate-400 uppercase px-3 py-1">Devise active</p>
              {currencies.map((curr) => (
                <button
                  key={curr}
                  onClick={() => {
                    setCurrency(curr);
                    setShowCurrencyDropdown(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-left text-xs font-medium hover:bg-slate-50 text-slate-700"
                >
                  <span>{curr}</span>
                  {curr.startsWith(activeCurrency) && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Button */}
        <Link
          href="/notifications"
          className="relative p-2 text-slate-600 hover:text-slate-900 transition-colors flex-shrink-0 ml-1"
          title="Notifications"
        >
          <Bell className="w-5 h-5 stroke-[2]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 border border-white" />
        </Link>
      </div>
    </header>
    </>
  );
};
