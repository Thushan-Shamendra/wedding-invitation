"use client";

import React from "react";

export type BadgeStatus =
  | "attending"
  | "declined"
  | "pending"
  | "published"
  | "draft"
  | "active"
  | "inactive";

interface StatusBadgeProps {
  status: BadgeStatus | string;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className = "" }: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  const config: Record<
    string,
    { bg: string; text: string; dot: string; defaultLabel: string }
  > = {
    attending: {
      bg: "bg-emerald-50 border-emerald-200/80",
      text: "text-emerald-800",
      dot: "bg-emerald-500",
      defaultLabel: "Attending",
    },
    declined: {
      bg: "bg-rose-50 border-rose-200/80",
      text: "text-rose-800",
      dot: "bg-rose-500",
      defaultLabel: "Declined",
    },
    pending: {
      bg: "bg-amber-50 border-amber-200/80",
      text: "text-amber-800",
      dot: "bg-amber-500",
      defaultLabel: "Pending",
    },
    published: {
      bg: "bg-emerald-50 border-emerald-200/80",
      text: "text-emerald-800",
      dot: "bg-emerald-500",
      defaultLabel: "Published",
    },
    draft: {
      bg: "bg-stone-100 border-stone-200",
      text: "text-stone-700",
      dot: "bg-stone-400",
      defaultLabel: "Draft",
    },
  };

  const current = config[normalized] || {
    bg: "bg-gray-100 border-gray-200",
    text: "text-gray-700",
    dot: "bg-gray-400",
    defaultLabel: status,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${current.bg} ${current.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dot}`} />
      <span>{label || current.defaultLabel}</span>
    </span>
  );
}
