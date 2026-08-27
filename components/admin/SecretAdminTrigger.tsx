"use client";

import React, { useEffect, useState } from "react";
import { AdminModal } from "@/features/admin/AdminModal";

export const SecretAdminTrigger: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 1. Raccourcis clavier secrets (Desktop)
    // Combinaison : Ctrl + Shift + Alt + A OU Ctrl + Shift + V
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.shiftKey && e.altKey && (e.key === "A" || e.key === "a")) ||
        (e.ctrlKey && e.shiftKey && (e.key === "V" || e.key === "v"))
      ) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    // 2. Événement secret personnalisé déclenché par le geste (Mobile appui long / 5 clics logo)
    const handleSecretEvent = () => {
      setIsOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("vando:open-admin", handleSecretEvent);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("vando:open-admin", handleSecretEvent);
    };
  }, []);

  if (!isOpen) return null;

  return <AdminModal isOpen={isOpen} onClose={() => setIsOpen(false)} />;
};
