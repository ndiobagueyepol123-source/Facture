"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer, MessageCircle, Download, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { Invoice, CompanySettings } from "@/types";
import { getInvoiceById, deleteInvoice } from "@/lib/api/invoices";
import { getCompanySettings, defaultCompanySettings } from "@/lib/api/settings";
import { useCurrency } from "@/providers/CurrencyProvider";
import { Receipt } from "@/components/receipt/Receipt";

const formatSaleDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  
  const isToday = date.getDate() === now.getDate() && 
                  date.getMonth() === now.getMonth() && 
                  date.getFullYear() === now.getFullYear();
                  
  const isYesterday = new Date(now.getTime() - 86400000).getDate() === date.getDate() && 
                      new Date(now.getTime() - 86400000).getMonth() === date.getMonth();

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const time = `${hours}:${minutes}`;

  if (isToday) return `Aujourd'hui · ${time}`;
  if (isYesterday) return `Hier · ${time}`;
  
  return `${date.toLocaleDateString('fr-FR')} · ${time}`;
};

export const InvoiceDetailView: React.FC<{ invoiceId: string }> = ({ invoiceId }) => {
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [companySettings, setCompanySettings] = useState<CompanySettings>(defaultCompanySettings);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { formatOnly } = useCurrency();

  useEffect(() => {
    const fetchInvoice = async () => {
      setIsLoading(true);
      const [data, settings] = await Promise.all([
        getInvoiceById(invoiceId),
        getCompanySettings(),
      ]);
      if (data) {
        setInvoice(data);
      }
      if (settings) {
        setCompanySettings(settings);
      }
      setIsLoading(false);
    };
    fetchInvoice();
  }, [invoiceId]);

  const handleDelete = async () => {
    await deleteInvoice(invoiceId);
    router.push("/invoices");
  };

  if (isLoading || !invoice) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const phone = window.prompt("Numéro WhatsApp du client (ex: +221 77 123 45 67)");
    if (phone) {
      const storeName = invoice.companySettings?.name || companySettings.name || "la boutique";
      const text = encodeURIComponent(`Bonjour,\nVoici le reçu de votre achat chez ${storeName}.\nMontant total : ${formatOnly(invoice.total, invoice.currency)}\nMerci !`);
      window.open(`https://wa.me/${phone.replace(/\s+/g, '')}?text=${text}`, "_blank");
    }
  };

  const handleDownload = () => {
    alert("Pour télécharger, utilisez l'option 'Imprimer' et choisissez 'Enregistrer au format PDF'.");
  };

  if (isDeleting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in p-4 text-center">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <Trash2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Supprimer cette vente ?</h2>
        <p className="text-slate-500 mb-8 max-w-sm">Cette vente sera retirée de votre historique et de vos statistiques.</p>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsDeleting(false)}
            className="px-6 py-3 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Annuler
          </button>
          <button 
            onClick={handleDelete}
            className="px-6 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-md shadow-rose-500/20 transition-all transform hover:-translate-y-0.5"
          >
            Supprimer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-screen pt-4 sm:pt-8 pb-20 print:p-0 print:m-0 print:min-h-0 bg-slate-50 print:bg-white animate-fade-in">
      
      {/* Universal Page Header (Responsive) */}
      <div className="max-w-5xl mx-auto px-4 print:hidden mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 md:border-b border-slate-200/80 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-3">
            <Link href="/invoices" className="hidden md:flex p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                <span className="md:hidden">Reçu</span>
                <span className="hidden md:inline">Vente N° {invoice.number}</span>
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-1">
                <span className="md:hidden">Votre reçu de vente</span>
                <span className="hidden md:inline">{formatSaleDate(invoice.issueDate)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto flex flex-col md:grid md:grid-cols-12 gap-6 md:gap-10 px-4 print:block print:px-0 print:gap-0">
        
        {/* RECEIPT (Ticket) - Order 1 on mobile, Order 2 on desktop */}
        <div className="order-1 md:order-2 md:col-span-6 flex flex-col items-center print:block print:w-full print:m-0 print:p-0 w-full">
          {/* Label for Receipt */}
          <div className="w-full max-w-sm mb-4 text-center hidden md:block">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Aperçu du reçu</h3>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-lg border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0 print:rounded-none overflow-hidden flex justify-center w-full max-w-sm mx-auto">
            <Receipt settings={invoice.companySettings || companySettings} invoice={invoice} />
          </div>
        </div>
        
        {/* ACTIONS & DETAILS - Order 2 on mobile, Order 1 on desktop */}
        <div className="order-2 md:order-1 md:col-span-6 space-y-6 w-full print:hidden">
          
          {/* Product Summary (Desktop only since mobile has it in receipt) */}
          <div className="hidden md:block space-y-6">
            <div className="bg-white p-6 sm:p-8 border border-slate-200/80 shadow-sm rounded-3xl space-y-6 transition-colors">
              <div>
                <h3 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">Produits</h3>
                <div className="space-y-4">
                  {invoice.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-900 text-base">{item.description}</p>
                        <p className="text-sm text-slate-500 font-medium">{item.quantity} × {formatOnly(item.unitPrice, invoice.currency).replace(',00', '')}</p>
                      </div>
                      <span className="font-bold text-slate-900 text-base">{formatOnly(item.amount, invoice.currency).replace(',00', '')}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-slate-100 pt-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total</h3>
                  <span className="text-3xl font-black text-blue-600">{formatOnly(invoice.total, invoice.currency).replace(',00', '')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* PRIMARY ACTIONS */}
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={handlePrint}
              className="py-4 px-2 flex flex-col items-center justify-center gap-2 text-sm font-bold text-slate-700 bg-white border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 rounded-2xl shadow-sm transition-all transform hover:-translate-y-0.5 hover:shadow-md group"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs border border-slate-200">
                <Printer className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
              </div>
              <span className="text-[11px] sm:text-sm">Imprimer</span>
            </button>
            
            <button 
              onClick={handleWhatsApp}
              className="py-4 px-2 flex flex-col items-center justify-center gap-2 text-sm font-bold text-slate-700 bg-white border border-slate-200/80 hover:border-[#25D366]/40 hover:bg-[#25D366]/5 rounded-2xl shadow-sm transition-all transform hover:-translate-y-0.5 hover:shadow-md group"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-[#128C7E] to-[#25D366] text-white flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-sm shadow-[#25D366]/40 border border-[#25D366]/20">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 ml-[1px]">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <span className="text-[11px] sm:text-sm font-black text-[#128C7E]">WhatsApp</span>
            </button>

            <button 
              onClick={handleDownload}
              className="py-4 px-2 flex flex-col items-center justify-center gap-2 text-sm font-bold text-slate-700 bg-white border border-slate-200/80 hover:border-blue-200 hover:bg-blue-50/50 rounded-2xl shadow-sm transition-all transform hover:-translate-y-0.5 hover:shadow-md group"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs border border-blue-100">
                <Download className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <span className="text-[11px] sm:text-sm">Télécharger</span>
            </button>
          </div>

          {/* SECONDARY ACTIONS */}
          <div className="space-y-3 pt-4">
            <Link href="/invoices/create" className="block w-full">
              <button className="w-full py-4 flex items-center justify-center space-x-2 text-base font-black text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-md shadow-blue-500/25 transition-all transform active:scale-[0.98]">
                <span>+ Nouvelle vente</span>
              </button>
            </Link>

            <Link href="/invoices" className="block w-full">
              <button className="w-full py-4 flex items-center justify-center space-x-2 text-base font-bold text-slate-700 bg-white border border-slate-200/80 hover:bg-slate-50 rounded-2xl shadow-sm transition-all transform active:scale-[0.98]">
                <ArrowLeft className="w-5 h-5" />
                <span>Retour aux ventes</span>
              </button>
            </Link>
          </div>

          {/* DANGER ACTION */}
          <div className="pt-6 border-t border-slate-100">
            <button 
              onClick={() => setIsDeleting(true)}
              className="w-full py-4 flex items-center justify-center space-x-2 text-base font-bold text-rose-500 hover:text-rose-700 bg-transparent hover:bg-rose-50 rounded-2xl transition-all"
            >
              <Trash2 className="w-5 h-5" />
              <span>Supprimer la vente</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
