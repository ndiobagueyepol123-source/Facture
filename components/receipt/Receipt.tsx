import React from "react";
import { CompanySettings, Invoice } from "@/types";
import { formatLocalTime } from "@/lib/utils";
import { useCurrency } from "@/providers/CurrencyProvider";

interface ReceiptProps {
  settings: CompanySettings;
  invoice: Invoice;
  isPreview?: boolean;
}

export const Receipt: React.FC<ReceiptProps> = ({ settings, invoice, isPreview }) => {
  const { formatOnly } = useCurrency();
  const formattedDate = formatLocalTime(invoice.issueDate || new Date());
  
  const itemCount = isPreview ? 1 : (invoice.items?.length || 0);
  
  // Niveaux de compacité pour optimiser l'espace vertical sans élargir le ticket
  const isCompact = itemCount >= 5 && itemCount < 10;
  const isVeryCompact = itemCount >= 10;

  const itemTextClass = isVeryCompact ? "text-[10px] leading-tight" : isCompact ? "text-xs" : "text-sm";
  const itemPaddingClass = isVeryCompact ? "py-1" : isCompact ? "py-1.5" : "py-2";

  return (
    <div
      id="thermal-receipt"
      // Largeur strictement fixée à 320px (environ 80mm sur écran) pour éviter tout élargissement
      className="bg-white text-slate-900 p-4 sm:p-5 font-mono mx-auto border border-slate-200 shadow-sm print:shadow-none print:border-none w-[320px] min-w-[320px] max-w-[320px] print:w-[80mm] print:min-w-[80mm] print:max-w-[80mm] print:p-0 print:m-0"
    >
      {/* En-tête */}
      <div className="text-center mb-4 space-y-1">
        <h2 className="font-black text-xl uppercase tracking-wider mb-1 leading-tight">
          {settings.name ? settings.name : <span className="text-slate-300">BOUTIQUE</span>}
        </h2>
        
        {settings.address ? (
          <p className="font-medium text-xs">{settings.address}</p>
        ) : (
          <p className="text-slate-300 text-xs">Adresse</p>
        )}
        
        {settings.city || settings.country ? (
          <p className="font-medium text-xs">{[settings.city, settings.country].filter(Boolean).join(", ")}</p>
        ) : (
          <p className="text-slate-300 text-xs">Ville, Pays</p>
        )}
        
        {settings.phone ? (
          <p className="font-medium text-xs">{settings.phone}</p>
        ) : (
          <p className="text-slate-300 text-xs">Téléphone</p>
        )}
        
        {settings.phone2 && <p className="font-medium text-xs">{settings.phone2}</p>}
      </div>

      <div className="border-t-[1.5px] border-dashed border-slate-300 my-3"></div>

      {/* Informations facture */}
      <div className="mb-3 space-y-1.5 font-semibold text-xs">
        <div className="flex justify-between">
          <span>Date :</span>
          <span>{formattedDate}</span>
        </div>
        <div className="flex justify-between">
          <span>N° Reçu :</span>
          <span className="truncate ml-2">{invoice.number || "000000"}</span>
        </div>
      </div>

      <div className="border-t-[1.5px] border-dashed border-slate-300 my-3"></div>

      {/* Produits */}
      {/* Utilisation de table-fixed pour forcer la largeur des colonnes et autoriser truncate sur les longs textes */}
      <table className="w-full text-left mb-3 table-fixed">
        <thead>
          <tr className="border-b-[1.5px] border-dashed border-slate-300">
            <th className="py-1.5 font-bold uppercase tracking-wider text-[10px] w-[44%]">Produit</th>
            <th className="py-1.5 text-center font-bold uppercase tracking-wider text-[10px] w-[14%]">Qté</th>
            <th className="py-1.5 text-right font-bold uppercase tracking-wider text-[10px] w-[20%]">Prix</th>
            <th className="py-1.5 text-right font-bold uppercase tracking-wider text-[10px] w-[22%]">Total</th>
          </tr>
        </thead>
        <tbody className="font-bold">
          {isPreview ? (
            <tr className="align-middle border-b border-dashed border-slate-200 text-slate-400">
              <td className={`${itemPaddingClass} pr-1 truncate ${itemTextClass}`}>
                ???
              </td>
              <td className={`${itemPaddingClass} text-center ${itemTextClass}`}>
                ?
              </td>
              <td className={`${itemPaddingClass} text-right font-medium ${itemTextClass} truncate`}>
                ???
              </td>
              <td className={`${itemPaddingClass} text-right ${itemTextClass} truncate`}>
                ???
              </td>
            </tr>
          ) : invoice.items && invoice.items.length > 0 ? (
            invoice.items.map((item, idx) => (
              <tr key={idx} className="align-middle border-b border-dashed border-slate-200 last:border-0">
                <td className={`${itemPaddingClass} pr-1 truncate ${itemTextClass}`} title={item.description || "Article"}>
                  {item.description || "Article"}
                </td>
                <td className={`${itemPaddingClass} text-center ${itemTextClass}`}>
                  {item.quantity}
                </td>
                <td className={`${itemPaddingClass} text-right font-medium ${itemTextClass} truncate`}>
                  {formatOnly(item.unitPrice, "").replace('FCFA', '').replace(',00', '').trim()}
                </td>
                <td className={`${itemPaddingClass} text-right ${itemTextClass} truncate`}>
                  {formatOnly(item.amount, "").replace('FCFA', '').replace(',00', '').trim()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="py-4 text-center text-slate-500 font-medium text-xs">
                Aucun produit
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Séparateur au-dessus du total */}
      <div className="border-t-[1.5px] border-solid border-slate-800 my-2"></div>

      {/* Totaux */}
      <div className="flex justify-between items-baseline font-black py-2.5">
        <span className="text-sm uppercase tracking-widest flex-shrink-0">Total</span>
        <span className={`text-xl text-right truncate pl-2 ${isPreview ? "text-slate-400" : ""}`}>
          {isPreview 
            ? "???" 
            : formatOnly(invoice.total || 0, invoice.currency || settings.currency || "FCFA").replace(',00', '')
          }
        </span>
      </div>

      {/* Séparateur en-dessous du total */}
      <div className="border-t-[1.5px] border-dashed border-slate-300 my-2"></div>

      {/* Pied de page */}
      <div className="text-center mt-5 mb-2 space-y-1">
        <p className="font-black text-lg uppercase tracking-widest">MERCI !</p>
        <p className="font-medium text-slate-500 text-xs">À très bientôt</p>
      </div>
    </div>
  );
};
