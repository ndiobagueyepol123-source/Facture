import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "glass" | "success";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed select-none btn-magnetic";
    
    const variants = {
      primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-soft-md hover:shadow-blue-600/30",
      secondary: "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/60",
      outline: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-soft-sm",
      ghost: "hover:bg-slate-100 text-slate-600 hover:text-slate-900 shadow-none hover:translate-y-0 hover:scale-100",
      destructive: "bg-rose-600 hover:bg-rose-700 text-white shadow-soft-md hover:shadow-rose-600/20",
      glass: "bg-white/80 hover:bg-white text-slate-900 border border-white/60 shadow-glass backdrop-blur-md",
      success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-soft-md hover:shadow-emerald-600/30",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 gap-1.5 rounded-lg",
      md: "text-sm px-4 py-2.5 gap-2 rounded-xl",
      lg: "text-base px-6 py-3.5 gap-2.5 rounded-xl font-semibold",
      icon: "p-2.5 rounded-xl w-10 h-10 flex items-center justify-center",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
