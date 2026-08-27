import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { InvoiceStatus } from '@/types';

/**
 * Combines Tailwind class names cleanly
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats numbers into currency string (defaulting to African FCFA / XOF)
 */
export function formatCurrency(amount: number, currency: string = 'FCFA'): string {
  // Remplace les espaces classiques par des espaces insécables (\u00A0)
  const formattedNumber = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount).replace(/\s+/g, '\u00A0');

  switch (currency) {
    case 'FCFA':
    case 'XOF':
    case 'XAF':
      return `${formattedNumber}\u00A0FCFA`;
    case 'NGN':
      return `₦\u00A0${formattedNumber}`;
    case 'GHS':
      return `GH₵\u00A0${formattedNumber}`;
    case 'KES':
      return `KSh\u00A0${formattedNumber}`;
    case 'ZAR':
      return `R\u00A0${formattedNumber}`;
    case 'MAD':
      return `${formattedNumber}\u00A0MAD`;
    case 'EGP':
      return `E£\u00A0${formattedNumber}`;
    case 'EUR':
      return `${formattedNumber}\u00A0€`;
    case 'USD':
      return `$${formattedNumber}`;
    default:
      return `${formattedNumber}\u00A0${currency}`;
  }
}

/**
 * Formats an ISO date string into readable French format (e.g. 15 Fév 2026)
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Formats an ISO date string into readable French format with time (e.g. 14/08/2026 — 19:52)
 * It takes the local device time exactly.
 */
export function formatLocalTime(dateString: string | Date): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return String(dateString);
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} — ${hours}:${minutes}`;
  } catch {
    return String(dateString);
  }
}

/**
 * Calculates subtotal, VAT, discount and grand total from items
 */
export function calculateInvoiceTotals(
  items: { quantity: number; unitPrice: number }[],
  vatRate: number = 18,
  discountRate: number = 0,
  amountPaid: number = 0
) {
  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const discountAmount = Math.round((subtotal * discountRate) / 100);
  const taxableAmount = subtotal - discountAmount;
  const vatAmount = Math.round((taxableAmount * vatRate) / 100);
  const total = taxableAmount + vatAmount;
  const amountDue = Math.max(0, total - amountPaid);

  return {
    subtotal,
    discountAmount,
    vatAmount,
    total,
    amountDue,
  };
}

/**
 * Returns aesthetic styling tokens for Invoice Status badges
 */
export function getStatusStyle(status: InvoiceStatus) {
  switch (status) {
    case 'Payée':
      return {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-500/10 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50',
        dot: 'bg-emerald-500 animate-pulse',
        icon: 'CheckCircle2',
      };
    case 'En retard':
      return {
        badge: 'bg-rose-50 text-rose-700 border-rose-200 shadow-rose-500/10 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/50',
        dot: 'bg-rose-600 animate-bounce',
        icon: 'AlertCircle',
      };
    case 'Envoyée':
      return {
        badge: 'bg-blue-50 text-blue-700 border-blue-200 shadow-blue-500/10 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/50',
        dot: 'bg-blue-500',
        icon: 'Send',
      };
    case 'Partiellement payée':
      return {
        badge: 'bg-amber-50 text-amber-700 border-amber-200 shadow-amber-500/10 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50',
        dot: 'bg-amber-500',
        icon: 'Clock',
      };
    case 'Brouillon':
      return {
        badge: 'bg-slate-100 text-slate-700 border-slate-200 shadow-slate-500/5 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        dot: 'bg-slate-400',
        icon: 'FileText',
      };
    case 'Annulée':
      return {
        badge: 'bg-gray-100 text-gray-500 border-gray-200 line-through dark:bg-gray-900 dark:text-gray-500 dark:border-gray-800',
        dot: 'bg-gray-400',
        icon: 'XCircle',
      };
    default:
      return {
        badge: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
        icon: 'HelpCircle',
      };
  }
}
