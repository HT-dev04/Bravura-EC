"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function Dialog({ open, onClose, children, title, className }: DialogProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div
        className={cn(
          "relative bg-brand-black-2 border border-brand-border rounded-sm w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl my-auto",
          className
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 sm:p-5 border-b border-brand-border sticky top-0 bg-brand-black-2 z-10">
          <h3 className="font-display uppercase text-base sm:text-lg tracking-wide">{title}</h3>
          <button
            onClick={onClose}
            className="text-brand-gray hover:text-white transition-colors ml-2 shrink-0"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}
