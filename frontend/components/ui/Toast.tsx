"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export function Toast({
  message,
  type = "success",
  onClose,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const styles = {
    success: {
      bg: "bg-white border-emerald-300 text-emerald-950 shadow-md",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    },
    error: {
      bg: "bg-white border-rose-300 text-rose-950 shadow-md",
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    },
    info: {
      bg: "bg-white border-[#E8E3DA] text-[#26231F] shadow-md",
      icon: <CheckCircle2 className="w-5 h-5 text-[#C9A96E] shrink-0" />,
    },
  };

  const current = styles[type] || styles.info;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div
        className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border ${current.bg}`}
      >
        {current.icon}
        <span className="text-sm font-medium pr-2">{message}</span>
        <button
          onClick={onClose}
          className="text-[#746E66] hover:text-[#26231F] p-1 rounded-lg transition-colors cursor-pointer ml-auto"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
