"use client";

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className, showText = true, size = 'md' }) => {
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const sizeClasses = {
    sm: {
      container: 'w-7 h-7 rounded-lg',
      icon: 'w-3.5 h-3.5',
      brand: 'text-sm'
    },
    md: {
      container: 'w-8 h-8 rounded-xl',
      icon: 'w-4 h-4',
      brand: 'text-base'
    },
    lg: {
      container: 'w-10 h-10 rounded-2xl',
      icon: 'w-5 h-5',
      brand: 'text-xl'
    }
  };

  const { container, icon, brand } = sizeClasses[size];

  // Gestion du geste secret (5 clics rapides)
  const handleClick = (e: React.MouseEvent) => {
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      e.preventDefault();
      e.stopPropagation();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('vando:open-admin'));
      }
      return;
    }

    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 1500);
  };

  // Gestion du geste secret mobile (Appui long de 3 secondes)
  const handleTouchStart = () => {
    longPressTimerRef.current = setTimeout(() => {
      if (typeof window !== 'undefined') {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(60);
        }
        window.dispatchEvent(new CustomEvent('vando:open-admin'));
      }
    }, 3000);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  return (
    <div 
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={cn("flex items-center space-x-2.5 group cursor-pointer select-none", className)}
    >
      <div 
        className={cn(
          "relative flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-700 text-white shadow-md shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-300 transform group-hover:scale-105 overflow-hidden group-hover:-translate-y-0.5",
          container
        )}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Custom SVG for 'V' */}
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className={cn("relative z-10", icon)}
        >
          <path 
            d="M4 5L10.5 19.5C11.1 20.7 12.9 20.7 13.5 19.5L20 5" 
            stroke="currentColor" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </svg>
      </div>
      
      {showText && (
        <span className={cn("font-extrabold text-slate-900 tracking-tight", brand)}>
          Van<span className="text-blue-600">do</span>
        </span>
      )}
    </div>
  );
};
