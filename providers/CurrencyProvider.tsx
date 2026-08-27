"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { formatCurrency } from "@/lib/utils";

// Taux de change fictifs pour la démo, basés sur le XOF comme devise de base (1 XOF = ...)
const MOCK_EXCHANGE_RATES: Record<string, number> = {
  "XOF": 1,
  "FCFA": 1,
  "XAF": 1,
  "NGN": 2.50, // 1 XOF = 2.50 Naira (exemple)
  "GHS": 0.025, // 1 XOF = 0.025 Cedi
  "KES": 0.22, // 1 XOF = 0.22 Shilling
  "ZAR": 0.03, // 1 XOF = 0.03 Rand
  "MAD": 0.016, // 1 XOF = 0.016 Dirham
  "EGP": 0.08, // 1 XOF = 0.08 Livre égyptienne
  "EUR": 0.0015,
  "USD": 0.0016
};

interface CurrencyContextType {
  activeCurrency: string;
  setCurrency: (currency: string) => void;
  // convertAndFormat convertit de la devise d'origine vers la devise active, puis formate
  convertAndFormat: (amount: number, originalCurrency?: string) => string;
  // formatOnly formate simplement sans convertir (pour les reçus historiques)
  formatOnly: (amount: number, currency?: string) => string;
  // getConvertedAmount renvoie la valeur numérique convertie
  getConvertedAmount: (amount: number, originalCurrency?: string) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeCurrency, setActiveCurrencyState] = useState<string>("FCFA");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Restaurer la devise depuis le localStorage au chargement
    const savedCurrency = localStorage.getItem("vando_active_currency");
    if (savedCurrency) {
      setActiveCurrencyState(savedCurrency);
    }
    setMounted(true);
  }, []);

  const setCurrency = (currency: string) => {
    // Normaliser la devise pour retirer la partie entre parenthèses ou autres (ex: "FCFA — XOF" -> "XOF")
    // Le header envoie parfois le code complet, on prend le premier mot
    const code = currency.split(" ")[0].trim();
    setActiveCurrencyState(code);
    localStorage.setItem("vando_active_currency", code);
  };

  const getConvertedAmount = (amount: number, originalCurrency: string = "FCFA") => {
    // Normaliser les codes
    const fromCode = originalCurrency === "XOF" || originalCurrency === "XAF" ? "FCFA" : originalCurrency;
    const toCode = activeCurrency === "XOF" || activeCurrency === "XAF" ? "FCFA" : activeCurrency;

    if (fromCode === toCode) return amount;

    // Convertir de l'original vers le XOF de base
    const rateFrom = MOCK_EXCHANGE_RATES[fromCode] || 1;
    const baseAmountInXOF = amount / rateFrom;

    // Convertir du XOF de base vers la devise cible
    const rateTo = MOCK_EXCHANGE_RATES[toCode] || 1;
    const convertedAmount = baseAmountInXOF * rateTo;

    return Math.round(convertedAmount);
  };

  const convertAndFormat = (amount: number, originalCurrency: string = "FCFA") => {
    // Si on n'est pas encore monté, on formate dans la devise d'origine pour éviter les sauts d'hydratation (ou FCFA par défaut)
    if (!mounted) {
      return formatCurrency(amount, originalCurrency);
    }
    const converted = getConvertedAmount(amount, originalCurrency);
    return formatCurrency(converted, activeCurrency);
  };

  const formatOnly = (amount: number, currency: string = "FCFA") => {
    return formatCurrency(amount, currency);
  };

  return (
    <CurrencyContext.Provider value={{ activeCurrency, setCurrency, convertAndFormat, formatOnly, getConvertedAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
