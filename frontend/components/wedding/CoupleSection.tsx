"use client";

import React from "react";
import { ThemeConfig, HEADING_FONT_MAP } from "@/utils/theme";
import { Heart, Sparkles } from "lucide-react";

interface CoupleSectionProps {
  brideName?: string;
  brideDescription?: string;
  groomName?: string;
  groomDescription?: string;
  theme: ThemeConfig;
}

export function CoupleSection({
  brideName,
  brideDescription,
  groomName,
  groomDescription,
  theme,
}: CoupleSectionProps) {
  const headingFontFamily =
    HEADING_FONT_MAP[theme.headingFont] || "Georgia, serif";

  const displayBrideName = brideName?.trim() || "The Bride";
  const displayGroomName = groomName?.trim() || "The Groom";

  return (
    <section id="couple" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold tracking-widest uppercase mb-3"
            style={{
              backgroundColor: `${theme.primaryColor}15`,
              color: theme.primaryColor,
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Happy Couple</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight"
            style={{
              fontFamily: headingFontFamily,
              color: theme.textColor,
            }}
          >
            Meet the Bride & Groom
          </h2>
          <div
            className="w-16 h-0.5 mx-auto mt-4 rounded-full"
            style={{ backgroundColor: theme.primaryColor }}
          />
        </div>

        {/* Couple Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 relative items-stretch">
          {/* Decorative Center Flourish on Desktop */}
          <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white border items-center justify-center shadow-sm"
            style={{ borderColor: theme.secondaryColor }}
          >
            <Heart className="w-5 h-5 fill-current" style={{ color: theme.primaryColor }} />
          </div>

          {/* Bride Card */}
          <div
            className={`p-8 sm:p-10 bg-white/90 backdrop-blur-xs flex flex-col justify-center text-center transition-all duration-200 ${
              theme.themeStyle === "luxury"
                ? "rounded-3xl border shadow-sm"
                : theme.themeStyle === "classic"
                ? "rounded-2xl border-2 border-double shadow-xs"
                : theme.themeStyle === "modern"
                ? "rounded-xl border shadow-xs"
                : "rounded-2xl border shadow-none"
            }`}
            style={{ borderColor: `${theme.secondaryColor}90` }}
          >
            <div
              className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center text-xl font-serif font-medium border"
              style={{
                backgroundColor: `${theme.primaryColor}12`,
                color: theme.primaryColor,
                borderColor: `${theme.secondaryColor}60`,
                fontFamily: headingFontFamily,
              }}
            >
              {displayBrideName.charAt(0)}
            </div>

            <div
              className="text-xs uppercase tracking-widest font-semibold mb-2"
              style={{ color: theme.primaryColor }}
            >
              The Bride
            </div>

            <h3
              className="text-2xl sm:text-3xl font-medium tracking-tight mb-4"
              style={{
                fontFamily: headingFontFamily,
                color: theme.textColor,
              }}
            >
              {displayBrideName}
            </h3>

            {brideDescription ? (
              <p
                className="text-sm leading-relaxed opacity-85 text-balance max-w-sm mx-auto"
                style={{ color: theme.textColor }}
              >
                {brideDescription}
              </p>
            ) : (
              <p
                className="text-xs italic opacity-60 max-w-xs mx-auto"
                style={{ color: theme.textColor }}
              >
                Ready to embark on this beautiful adventure of love and lifelong companionship.
              </p>
            )}
          </div>

          {/* Groom Card */}
          <div
            className={`p-8 sm:p-10 bg-white/90 backdrop-blur-xs flex flex-col justify-center text-center transition-all duration-200 ${
              theme.themeStyle === "luxury"
                ? "rounded-3xl border shadow-sm"
                : theme.themeStyle === "classic"
                ? "rounded-2xl border-2 border-double shadow-xs"
                : theme.themeStyle === "modern"
                ? "rounded-xl border shadow-xs"
                : "rounded-2xl border shadow-none"
            }`}
            style={{ borderColor: `${theme.secondaryColor}90` }}
          >
            <div
              className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center text-xl font-serif font-medium border"
              style={{
                backgroundColor: `${theme.primaryColor}12`,
                color: theme.primaryColor,
                borderColor: `${theme.secondaryColor}60`,
                fontFamily: headingFontFamily,
              }}
            >
              {displayGroomName.charAt(0)}
            </div>

            <div
              className="text-xs uppercase tracking-widest font-semibold mb-2"
              style={{ color: theme.primaryColor }}
            >
              The Groom
            </div>

            <h3
              className="text-2xl sm:text-3xl font-medium tracking-tight mb-4"
              style={{
                fontFamily: headingFontFamily,
                color: theme.textColor,
              }}
            >
              {displayGroomName}
            </h3>

            {groomDescription ? (
              <p
                className="text-sm leading-relaxed opacity-85 text-balance max-w-sm mx-auto"
                style={{ color: theme.textColor }}
              >
                {groomDescription}
              </p>
            ) : (
              <p
                className="text-xs italic opacity-60 max-w-xs mx-auto"
                style={{ color: theme.textColor }}
              >
                Eager to celebrate with family and friends and build a lifetime of cherished memories.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
