"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, ArrowLeft, Trash2, ShoppingBag, Printer, MessageCircle, Download, RotateCcw, Loader2 } from "lucide-react";
import Link from "next/link";
import { InvoiceItem, Invoice, Client, CompanySettings } from "@/types";
import { Card } from "@/components/ui/Card";
import { useCurrency } from "@/providers/CurrencyProvider";
import { Receipt } from "@/components/receipt/Receipt";
import { getCompanySettings, defaultCompanySettings } from "@/lib/api/settings";
import { createInvoice, getInvoices } from "@/lib/api/invoices";

export const CreateInvoiceStudio: React.FC<{ isEditing?: boolean; initialInvoiceId?: string }> = ({ isEditing, initialInvoiceId }) => {
  const router = useRouter();
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "item-1", description: "", quantity: 1, unitPrice: 0, vatRate: 0, amount: 0 },
  ]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedInvoice, setSavedInvoice] = useState<Invoice | null>(null);
  const [companySettings, setCompanySettings] = useState<CompanySettings>(defaultCompanySettings);
  const { activeCurrency, formatOnly } = useCurrency();

  useEffect(() => {
    async function loadSettings() {
      const settings = await getCompanySettings();
      setCompanySettings(settings);
    }
    loadSettings();
  }, []);

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice;
          return updatedItem;
        }
        return item;
      })
    );
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      description: "",
      quantity: 1,
      unitPrice: 0,
      vatRate: 0,
      amount: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const total = items.reduce((sum, item) => sum + item.amount, 0);

  const isFormValid = items.length > 0 && items.every(i => i.description.trim() !== "" && i.quantity > 0 && i.unitPrice > 0);

  const handleFinishSale = async () => {
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);

    const dummyClient: Client = {
      id: "cli-divers",
      name: "Client",
      company: "Client Divers",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      totalInvoiced: total,
      invoiceCount: 1,
    };

    const existingInvoices = await getInvoices();
    let maxNumber = 0;
    existingInvoices.forEach(inv => {
      const num = parseInt(inv.number, 10);
      if (!isNaN(num) && num > maxNumber) {
        maxNumber = num;
      }
    });
    const nextIndex = maxNumber + 1;
    const formattedNumber = String(nextIndex).padStart(6, '0');

    const newInvoiceData: Partial<Invoice> = {
      number: formattedNumber,
      issueDate: new Date().toISOString(),
      dueDate: new Date().toISOString().split("T")[0],
      clientId: dummyClient.id,
      client: dummyClient,
      items: items,
      subtotal: total,
      vatRate: 0,
      vatAmount: 0,
      discountRate: 0,
      discountAmount: 0,
      total: total,
      amountPaid: total,
      amountDue: 0,
      status: "Payée",
      currency: activeCurrency,
      companySettings: companySettings,
    };

    const saved = await createInvoice(newInvoiceData);
    setIsSubmitting(false);

    if (saved) {
      setSavedInvoice(saved);
      setIsSubmitted(true);
    } else {
      alert("Erreur lors de l'enregistrement de la vente.");
    }
  };

  const resetSale = () => {
    setItems([{ id: `item-${Date.now()}`, description: "", quantity: 1, unitPrice: 0, vatRate: 0, amount: 0 }]);
    setIsSubmitted(false);
    setSavedInvoice(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const phone = window.prompt("Numéro WhatsApp du client (ex: 221771234567)");
    if (phone && savedInvoice) {
      const storeName = savedInvoice.companySettings?.name || "la boutique";
      const text = encodeURIComponent(`Bonjour,\nVoici le reçu de votre achat chez ${storeName}.\nMontant total : ${formatOnly(savedInvoice.total, savedInvoice.currency)}\nMerci pour votre confiance !`);
      window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
    }
  };

  const handleDownload = () => {
    alert("Pour télécharger, vous pouvez utiliser le bouton 'Imprimer' et choisir 'Enregistrer au format PDF' comme imprimante.");
  };

  // VUE APRÈS LA VENTE
  if (isSubmitted && savedInvoice) {
    return (
      <div className="w-full h-full min-h-screen pt-4 pb-20 print:p-0 print:m-0 print:min-h-0 bg-slate-50 print:bg-white animate-fade-in">
        {/* En-tête de succès (Masqué à l'impression) */}
        <div className="text-center space-y-2 mb-8 print:hidden">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Vente enregistrée <span className="text-emerald-500">✓</span></h2>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start px-4 print:block print:px-0 print:gap-0">
          
          {/* Section Aperçu du reçu */}
          <div className="lg:col-span-6 flex flex-col items-center print:block print:w-full print:m-0 print:p-0">
            <div className="w-full max-w-sm mb-4 print:hidden text-center">
              <h3 className="text-lg font-bold text-slate-700">Aperçu du reçu</h3>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0 print:rounded-none overflow-hidden">
              <Receipt settings={savedInvoice.companySettings || companySettings} invoice={savedInvoice} />
            </div>
          </div>

          {/* Section Actions (Masquée à l'impression) */}
          <div className="lg:col-span-6 space-y-6 print:hidden">
            <Card className="p-4 sm:p-6 bg-white border border-slate-200/80 shadow-md rounded-2xl space-y-4">
              <button 
                onClick={handlePrint}
                className="w-full py-4 flex items-center justify-center space-x-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl shadow-2xs transition-all transform hover:-translate-y-0.5"
              >
                <Printer className="w-5 h-5 text-slate-500" />
                <span>Imprimer</span>
              </button>
              
              <button 
                onClick={handleWhatsApp}
                className="w-full py-4 flex items-center justify-center space-x-2 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-md shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5"
              >
                <MessageCircle className="w-5 h-5" />
                <span>WhatsApp</span>
              </button>

              <button 
                onClick={handleDownload}
                className="w-full py-4 flex items-center justify-center space-x-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all transform hover:-translate-y-0.5"
              >
                <Download className="w-5 h-5" />
                <span>Télécharger</span>
              </button>
            </Card>

            <div className="space-y-3 pt-4 border-t border-slate-200">
              <button
                onClick={resetSale}
                className="w-full py-4 flex items-center justify-center space-x-2 text-sm font-black text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-500/20 transform hover:-translate-y-0.5 transition-all"
              >
                <Plus className="w-5 h-5 mr-1" />
                <span>Nouvelle vente</span>
              </button>

              <Link href="/invoices">
                <button className="w-full py-4 flex items-center justify-center space-x-2 text-sm font-bold text-slate-500 hover:text-slate-700 bg-transparent hover:bg-slate-50 rounded-xl transition-all">
                  <RotateCcw className="w-4 h-4" />
                  <span>Retour aux ventes</span>
                </button>
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    );
  }

  // VUE DU FORMULAIRE DE VENTE
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-fade-in w-full min-w-0 print:hidden">
      {/* En-tête simple */}
      <div className="flex items-center space-x-3 px-4 sm:px-0 pb-4 border-b border-slate-100">
        <Link href="/" className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Nouvelle vente</h1>
        </div>
      </div>

      <div className="bg-white sm:border border-slate-100 sm:shadow-sm sm:rounded-3xl pb-32 sm:pb-6 relative">
        {/* Lignes de produits */}
        <div className="p-4 sm:p-6 space-y-5">
          {items.map((item, index) => (
            <div key={item.id} className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-100 relative group transition-all">
              {items.length > 1 && (
                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute -top-2 -right-2 p-2 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 rounded-full shadow-sm hover:shadow-md transition-all z-10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Produit {index + 1}</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    placeholder="Ex: Riz 50kg"
                    className="w-full px-4 py-4 text-base font-semibold text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-2xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Quantité</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={item.quantity === 0 ? "" : item.quantity}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        updateItem(item.id, "quantity", val === "" ? 0 : Number(val));
                      }}
                      className="w-full px-4 py-4 text-base font-semibold text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Prix unitaire</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={item.unitPrice === 0 ? "" : item.unitPrice}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        updateItem(item.id, "unitPrice", val === "" ? 0 : Number(val));
                      }}
                      className="w-full px-4 py-4 text-base font-semibold text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-2xs"
                    />
                  </div>
                </div>

                {item.amount > 0 && (
                  <div className="pt-2 flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Sous-total :</span>
                    <span className="font-black text-slate-900">{formatOnly(item.amount, activeCurrency)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Ajouter un produit */}
        <div className="px-4 sm:px-6 mt-2">
          <button
            onClick={addItem}
            className="w-full py-4 flex items-center justify-center space-x-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-colors border border-blue-100 border-dashed active:scale-[0.98]"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Ajouter un autre produit</span>
          </button>
        </div>

        {/* Total et Validation (Sticky sur mobile) */}
        <div className="fixed bottom-0 left-0 right-0 sm:relative sm:bottom-auto sm:left-auto sm:right-auto bg-white border-t border-slate-100 p-4 sm:p-6 sm:mt-6 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] sm:shadow-none sm:rounded-b-3xl">
          <div className="flex justify-between items-end mb-4">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total</span>
            <span className="text-3xl font-black text-blue-600 leading-none">{formatOnly(total, activeCurrency)}</span>
          </div>

          <button
            onClick={handleFinishSale}
            disabled={!isFormValid || isSubmitting}
            className={`w-full py-4 flex items-center justify-center space-x-2 text-base font-black rounded-2xl shadow-md transition-all active:scale-[0.98] ${
              isFormValid && !isSubmitting
                ? "text-white bg-blue-600 hover:bg-blue-700 shadow-blue-500/25 cursor-pointer" 
                : "text-slate-400 bg-slate-100 shadow-none cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin mr-1" />
            ) : (
              <ShoppingBag className="w-5 h-5 mr-1 stroke-[2.5]" />
            )}
            <span>Terminer la vente</span>
          </button>
        </div>
      </div>
    </div>
  );
};
