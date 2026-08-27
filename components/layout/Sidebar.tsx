"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import {
  LayoutDashboard,
  FileText,
  Package,
  Settings,
  Plus,
  LogOut
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const desktopNavItems = [
  { label: "Accueil", icon: LayoutDashboard, href: "/" },
  { label: "Ventes", icon: FileText, href: "/invoices" },
  { label: "Articles & Produits", icon: Package, href: "/products" },
  { label: "Paramètres", icon: Settings, href: "/settings" },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("Chargement...");
  const [userName, setUserName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("https://ui-avatars.com/api/?name=?&background=F1F5F9&color=64748B");

  useEffect(() => {
    const supabase = createClient();
    
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        setUserEmail(user.email);
        const name = user.user_metadata?.full_name || user.email.split("@")[0];
        setUserName(name);
        setAvatarUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff&rounded=true&bold=true`);
      }
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        const name = session.user.user_metadata?.full_name || session.user.email.split("@")[0];
        setUserName(name);
        setAvatarUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff&rounded=true&bold=true`);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      {/* 1. DESKTOP VERTICAL SIDEBAR */}
      <aside className="no-print hidden lg:flex flex-col fixed top-0 left-0 bottom-0 z-40 w-56 bg-white border-r border-slate-200/80 transition-all duration-300">
        {/* Brand Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-slate-100">
          <Link href="/" className="flex items-center space-x-2.5 group hover:opacity-90 transition-opacity">
            <Logo size="md" />
          </Link>
        </div>

        {/* Quick Action Button */}
        <div className="p-3">
          <Link href="/invoices/create">
            <button
              type="button"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow-2xs transition-all flex items-center justify-center space-x-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nouvelle vente</span>
            </button>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="flex-1 px-2.5 space-y-1 py-1">
          {desktopNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all group",
                  isActive
                    ? "bg-slate-100/90 text-slate-950 font-extrabold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors flex-shrink-0",
                    isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                  )}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile / Workspace */}
        <div className="p-3 border-t border-slate-100/80">
          <div className="flex items-center space-x-2.5 p-1.5 rounded-lg bg-slate-50/70 border border-slate-200/60">
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover border border-white shadow-2xs flex-shrink-0 bg-white"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate" title={userName || userEmail}>
                {userName || userEmail.split('@')[0]}
              </p>
              <p className="text-[10px] font-medium text-slate-500 truncate" title={userEmail}>
                {userEmail}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
