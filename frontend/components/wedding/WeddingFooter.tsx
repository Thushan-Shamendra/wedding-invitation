"use client";

import React from "react";
import { ThemeConfig, HEADING_FONT_MAP } from "@/utils/theme";
import { formatWeddingDate } from "@/utils/formatters";
import { Heart } from "lucide-react";

interface WeddingFooterProps {
  brideName?: string;
  groomName?: string;
  weddingDate?: string;
  footerMessage?: string;
  theme: ThemeConfig;
}

export function WeddingFooter({
  brideName,
  groomName,
  weddingDate,
  footerMessage,
  theme,
}: WeddingFooterProps) {
  const headingFontFamily =
    HEADING_FONT_MAP[theme.headingFont] || "Georgia, serif";

  const coupleNames =
    brideName && groomName
      ? `${brideName} & ${groomName}`
      : brideName || groomName || "Our Wedding";

  const formattedDate = formatWeddingDate(weddingDate);

  const displayMessage =
    footerMessage?.trim() ||
    `Thank you for being part of our story. We cannot wait to celebrate with you!`;

  return (
    <footer
      className="py-16 px-4 sm:px-6 lg:px-8 border-t text-center relative overflow-hidden"
      style={{
        borderColor: `${theme.secondaryColor}60`,
        backgroundColor: "rgba(255, 255, 255, 0.4)",
      }}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Heart Icon */}
        <div className="flex items-center justify-center">
          <Heart
            className="w-6 h-6 animate-pulse"
            style={{ color: theme.primaryColor, fill: `${theme.primaryColor}30` }}
          />
        </div>

        {/* Couple Names */}
        <h3
          className="text-2xl sm:text-3xl font-medium tracking-tight"
          style={{
            fontFamily: headingFontFamily,
            color: theme.textColor,
          }}
        >
          {coupleNames}
        </h3>

        {/* Wedding Date */}
        {formattedDate && (
          <p
            className="text-xs uppercase tracking-widest font-semibold"
            style={{ color: theme.primaryColor }}
          >
            {formattedDate}
          </p>
        )}

        {/* Stored Footer Message */}
        <p
          className="text-sm italic opacity-85 leading-relaxed max-w-md mx-auto"
          style={{ color: theme.textColor }}
        >
          "{displayMessage}"
        </p>

        {/* Decorative Divider */}
        <div
          className="w-16 h-0.5 mx-auto rounded-full"
          style={{ backgroundColor: `${theme.primaryColor}40` }}
        />

        {/* Subtle Made with Love note */}
        <p className="text-[11px] opacity-60" style={{ color: theme.textColor }}>
          Celebrating Love & Togetherness ♡
        </p>
      </div>
    </footer>
  );
}
