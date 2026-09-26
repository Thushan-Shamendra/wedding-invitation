"use client";

import React from "react";
import { ThemeConfig, HEADING_FONT_MAP } from "@/utils/theme";
import { formatWeddingDate } from "@/utils/formatters";
import { Sparkles, ArrowDown, MapPin, Calendar, Heart } from "lucide-react";

interface HeroSectionProps {
  weddingTitle?: string;
  invitationHeading?: string;
  invitationMessage?: string;
  brideName?: string;
  groomName?: string;
  weddingDate?: string;
  location?: string;
  theme: ThemeConfig;
}

export function HeroSection({
  weddingTitle,
  invitationHeading,
  invitationMessage,
  brideName,
  groomName,
  weddingDate,
  location,
  theme,
}: HeroSectionProps) {
  const headingFontFamily =
    HEADING_FONT_MAP[theme.headingFont] || "Georgia, serif";

  const formattedDate = formatWeddingDate(weddingDate, { includeWeekday: true });
  const displayHeading =
    invitationHeading?.trim() || "We're Getting Married";
  const displaySubtitle =
    invitationMessage?.trim() ||
    "We invite you to celebrate the beginning of our new chapter together.";

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-center overflow-hidden"
    >
      {/* Decorative luxury gradient background accent */}
      {theme.themeStyle === "luxury" && (
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${theme.primaryColor}20, transparent 70%)`,
          }}
        />
      )}

      <div className="relative max-w-3xl mx-auto w-full flex flex-col items-center">
        {/* Top Ornament */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-8 transition-transform hover:scale-105"
          style={{
            borderColor: `${theme.secondaryColor}80`,
            backgroundColor: `${theme.primaryColor}12`,
            color: theme.primaryColor,
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-[11px] sm:text-xs font-semibold tracking-widest uppercase">
            {displayHeading}
          </span>
          <Sparkles className="w-3.5 h-3.5" />
        </div>

        {/* Couple Names */}
        <div className="space-y-3 sm:space-y-4 mb-8">
          <h1
            className="text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight leading-tight"
            style={{
              fontFamily: headingFontFamily,
              color: theme.textColor,
            }}
          >
            {brideName ? (
              <span className="block">{brideName}</span>
            ) : (
              <span>Bride</span>
            )}
            <span
              className="inline-block my-1 text-2xl sm:text-4xl italic font-serif opacity-80"
              style={{ color: theme.primaryColor }}
            >
              &
            </span>
            {groomName ? (
              <span className="block">{groomName}</span>
            ) : (
              <span>Groom</span>
            )}
          </h1>
        </div>

        {/* Date and Location Badge */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-8 text-xs sm:text-sm font-medium">
          {formattedDate && (
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/70 backdrop-blur-xs border shadow-2xs"
              style={{ borderColor: `${theme.secondaryColor}60` }}
            >
              <Calendar className="w-4 h-4" style={{ color: theme.primaryColor }} />
              <span style={{ color: theme.textColor }}>{formattedDate}</span>
            </div>
          )}

          {location && (
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/70 backdrop-blur-xs border shadow-2xs"
              style={{ borderColor: `${theme.secondaryColor}60` }}
            >
              <MapPin className="w-4 h-4" style={{ color: theme.primaryColor }} />
              <span style={{ color: theme.textColor }}>{location}</span>
            </div>
          )}
        </div>

        {/* Short invitation message */}
        {displaySubtitle && (
          <p
            className="text-sm sm:text-base max-w-xl mx-auto mb-10 leading-relaxed opacity-85"
            style={{ color: theme.textColor }}
          >
            {displaySubtitle}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm sm:max-w-none">
          <a
            href="#couple"
            onClick={(e) => scrollToSection(e, "#couple")}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-medium text-sm transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer text-white hover:opacity-95 hover:shadow-md"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <span>View Our Wedding</span>
            <ArrowDown className="w-4 h-4" />
          </a>

          <a
            href="#rsvp"
            onClick={(e) => scrollToSection(e, "#rsvp")}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-medium text-sm transition-all duration-200 border flex items-center justify-center gap-2 cursor-pointer bg-white/80 hover:bg-white hover:shadow-sm"
            style={{
              borderColor: `${theme.secondaryColor}`,
              color: theme.textColor,
            }}
          >
            <Heart className="w-4 h-4" style={{ color: theme.primaryColor }} />
            <span>RSVP Information</span>
          </a>
        </div>
      </div>
    </section>
  );
}
