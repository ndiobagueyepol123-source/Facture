import * as React from "react";
import { cn, getStatusStyle } from "@/lib/utils";
import { InvoiceStatus } from "@/types";
import { CheckCircle2, AlertCircle, Clock, Send, FileText, XCircle, HelpCircle } from "lucide-react";

export interface StatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className, showIcon = true }) => {
  const styles = getStatusStyle(status);

  const getIcon = () => {
    switch (status) {
      case "Payée":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />;
      case "En retard":
        return <AlertCircle className="w-3.5 h-3.5 text-rose-600 mr-1.5" />;
      case "Envoyée":
        return <Send className="w-3.5 h-3.5 text-blue-600 mr-1.5" />;
      case "Partiellement payée":
        return <Clock className="w-3.5 h-3.5 text-amber-600 mr-1.5" />;
      case "Brouillon":
        return <FileText className="w-3.5 h-3.5 text-slate-500 mr-1.5" />;
      case "Annulée":
        return <XCircle className="w-3.5 h-3.5 text-gray-400 mr-1.5" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-slate-400 mr-1.5" />;
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-200 select-none",
        styles.badge,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", styles.dot)} />
      {showIcon && getIcon()}
      {status}
    </span>
  );
};
