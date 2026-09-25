"use client";

import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  accent?: "gold" | "emerald" | "rose" | "amber";
}

export function StatCard({
  title,
  value,
  icon,
  subtitle,
  accent = "gold",
}: StatCardProps) {
  const accentStyles = {
    gold: {
      iconBg: "bg-[#F8F6F1] text-[#C9A96E] border-[#E8E3DA]",
      valueColor: "text-[#26231F]",
    },
    emerald: {
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      valueColor: "text-emerald-700",
    },
    rose: {
      iconBg: "bg-rose-50 text-rose-600 border-rose-100",
      valueColor: "text-rose-700",
    },
    amber: {
      iconBg: "bg-amber-50 text-amber-600 border-amber-100",
      valueColor: "text-amber-700",
    },
  };

  const style = accentStyles[accent] || accentStyles.gold;

  return (
    <div className="bg-white rounded-2xl border border-[#E8E3DA] p-5 sm:p-6 shadow-sm hover:shadow transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-medium tracking-wide uppercase text-[#746E66]">
            {title}
          </p>
          <div className="text-2xl sm:text-3xl font-serif font-semibold text-[#26231F] pt-1">
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-[#746E66] pt-1">{subtitle}</p>
          )}
        </div>
        <div
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border shrink-0 ${style.iconBg}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
