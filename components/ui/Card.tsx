import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "interactive" | "flat";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "bg-white border border-slate-200/80 rounded-2xl shadow-soft-sm",
      glass: "card-glass rounded-2xl shadow-soft-md",
      interactive: "bg-white border border-slate-200/80 rounded-2xl shadow-soft-sm transition-all duration-300 hover:shadow-soft-lg hover:border-blue-500/30 hover:-translate-y-0.5 cursor-pointer",
      flat: "bg-slate-50/70 border border-slate-200/50 rounded-2xl",
    };

    return (
      <div ref={ref} className={cn("p-6 overflow-hidden", variants[variant], className)} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 pb-4 border-b border-slate-100", className)} {...props} />
);

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-lg font-bold text-slate-900 tracking-tight", className)} {...props} />
);

export const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-xs text-slate-500 font-normal", className)} {...props} />
);

export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("py-4", className)} {...props} />
);

export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center pt-4 border-t border-slate-100", className)} {...props} />
);
