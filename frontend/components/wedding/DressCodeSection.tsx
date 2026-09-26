"use client";

import React from "react";
import { ThemeConfig, HEADING_FONT_MAP } from "@/utils/theme";
import { Sparkles, Shirt } from "lucide-react";

interface DressCodeSectionProps {
  dressCode?: string;
  theme: ThemeConfig;
}

export function DressCodeSection({ dressCode, theme }: DressCodeSectionProps) {
  // If dressCode is empty or whitespace, do not render the section
  if (!dressCode || !dressCode.trim()) {
    return null;
  }

  const headingFontFamily =
    HEADING_FONT_MAP[theme.headingFont] || "Georgia, serif";

  return (
    <section id="dresscode" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div
          className={`p-8 sm:p-10 bg-white/90 backdrop-blur-xs text-center border transition-all duration-200 ${
            theme.themeStyle === "luxury"
              ? "rounded-3xl shadow-sm"
              : theme.themeStyle === "classic"
              ? "rounded-2xl border-2 border-double shadow-xs"
              : theme.themeStyle === "modern"
              ? "rounded-xl shadow-xs"
              : "rounded-2xl shadow-none"
          }`}
          style={{ borderColor: `${theme.secondaryColor}90` }}
        >
          <div
            className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center border"
            style={{
              backgroundColor: `${theme.primaryColor}12`,
              color: theme.primaryColor,
              borderColor: `${theme.secondaryColor}60`,
            }}
          >
            <Shirt className="w-6 h-6" />
          </div>

          <div
            className="text-xs uppercase tracking-widest font-semibold mb-2"
            style={{ color: theme.primaryColor }}
          >
            Attire Guide
          </div>

          <h3
            className="text-2xl sm:text-3xl font-medium tracking-tight mb-4"
            style={{
              fontFamily: headingFontFamily,
              color: theme.textColor,
            }}
          >
            Dress Code
          </h3>

          <div
            className="text-lg sm:text-xl font-medium px-6 py-3 rounded-xl inline-block max-w-lg mx-auto"
            style={{
              backgroundColor: `${theme.backgroundColor}80`,
              color: theme.textColor,
              border: `1px solid ${theme.secondaryColor}40`,
            }}
          >
            {dressCode.trim()}
          </div>

          <p
            className="text-xs opacity-70 mt-4 max-w-sm mx-auto leading-relaxed"
            style={{ color: theme.textColor }}
          >
            We look forward to celebrating in style with our dearest family and friends.
          </p>
        </div>
      </div>
    </section>
  );
}
