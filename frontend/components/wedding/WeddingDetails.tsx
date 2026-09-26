"use client";

import React from "react";
import { Wedding } from "@/types";
import { ThemeConfig, HEADING_FONT_MAP } from "@/utils/theme";
import { formatWeddingDate, formatWeddingTime } from "@/utils/formatters";
import { Church, GlassWater, Calendar, Clock, MapPin, Sparkles } from "lucide-react";

interface WeddingDetailsProps {
  wedding: Wedding;
  theme: ThemeConfig;
}

export function WeddingDetails({ wedding, theme }: WeddingDetailsProps) {
  const headingFontFamily =
    HEADING_FONT_MAP[theme.headingFont] || "Georgia, serif";

  // Ceremony details (support both direct and nested venue objects)
  const ceremonyName =
    wedding.ceremonyVenueName || wedding.ceremonyVenue?.name;
  const ceremonyAddress =
    wedding.ceremonyAddress || wedding.ceremonyVenue?.address;
  const ceremonyDate =
    wedding.ceremonyDate || wedding.ceremonyVenue?.date || wedding.weddingDate;
  const ceremonyTime =
    wedding.ceremonyTime || wedding.ceremonyVenue?.time || wedding.startTime;
  const ceremonyDesc =
    wedding.ceremonyDescription || wedding.ceremonyVenue?.description;

  // Reception details
  const receptionName =
    wedding.receptionVenueName || wedding.receptionVenue?.name;
  const receptionAddress =
    wedding.receptionAddress || wedding.receptionVenue?.address;
  const receptionDate =
    wedding.receptionDate || wedding.receptionVenue?.date || wedding.weddingDate;
  const receptionTime =
    wedding.receptionTime || wedding.receptionVenue?.time || wedding.endTime;
  const receptionDesc =
    wedding.receptionDescription || wedding.receptionVenue?.description;

  const hasCeremony = !!(ceremonyName || ceremonyAddress || ceremonyTime);
  const hasReception = !!(receptionName || receptionAddress || receptionTime);

  if (!hasCeremony && !hasReception) return null;

  return (
    <section id="details" className="py-20 px-4 sm:px-6 lg:px-8">
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
            <span>Celebration Information</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight"
            style={{
              fontFamily: headingFontFamily,
              color: theme.textColor,
            }}
          >
            Wedding Details
          </h2>
          <div
            className="w-16 h-0.5 mx-auto mt-4 rounded-full"
            style={{ backgroundColor: theme.primaryColor }}
          />
        </div>

        {/* Ceremony & Reception Cards Grid */}
        <div
          className={`grid gap-8 ${
            hasCeremony && hasReception ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 max-w-2xl mx-auto"
          }`}
        >
          {/* Ceremony Card */}
          {hasCeremony && (
            <div
              className={`p-8 sm:p-10 bg-white/90 backdrop-blur-xs flex flex-col justify-between transition-all duration-200 ${
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
              <div>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-2xs"
                  style={{
                    backgroundColor: `${theme.primaryColor}15`,
                    color: theme.primaryColor,
                  }}
                >
                  <Church className="w-6 h-6" />
                </div>

                <div
                  className="text-xs uppercase tracking-widest font-semibold mb-2"
                  style={{ color: theme.primaryColor }}
                >
                  Holy Matrimony
                </div>

                <h3
                  className="text-2xl sm:text-3xl font-medium tracking-tight mb-4"
                  style={{
                    fontFamily: headingFontFamily,
                    color: theme.textColor,
                  }}
                >
                  The Ceremony
                </h3>

                {ceremonyDesc && (
                  <p
                    className="text-sm leading-relaxed opacity-80 mb-6"
                    style={{ color: theme.textColor }}
                  >
                    {ceremonyDesc}
                  </p>
                )}

                <div className="space-y-3 pt-2 text-sm">
                  {ceremonyDate && (
                    <div className="flex items-start gap-3">
                      <Calendar
                        className="w-4 h-4 mt-0.5 shrink-0"
                        style={{ color: theme.primaryColor }}
                      />
                      <span style={{ color: theme.textColor }}>
                        {formatWeddingDate(ceremonyDate, { includeWeekday: true })}
                      </span>
                    </div>
                  )}

                  {ceremonyTime && (
                    <div className="flex items-start gap-3">
                      <Clock
                        className="w-4 h-4 mt-0.5 shrink-0"
                        style={{ color: theme.primaryColor }}
                      />
                      <span style={{ color: theme.textColor }}>
                        {formatWeddingTime(ceremonyTime)}
                      </span>
                    </div>
                  )}

                  {ceremonyName && (
                    <div className="flex items-start gap-3 font-medium">
                      <MapPin
                        className="w-4 h-4 mt-0.5 shrink-0"
                        style={{ color: theme.primaryColor }}
                      />
                      <span style={{ color: theme.textColor }}>
                        {ceremonyName}
                      </span>
                    </div>
                  )}

                  {ceremonyAddress && (
                    <div className="pl-7 text-xs opacity-75 leading-relaxed" style={{ color: theme.textColor }}>
                      {ceremonyAddress}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Reception Card */}
          {hasReception && (
            <div
              className={`p-8 sm:p-10 bg-white/90 backdrop-blur-xs flex flex-col justify-between transition-all duration-200 ${
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
              <div>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-2xs"
                  style={{
                    backgroundColor: `${theme.primaryColor}15`,
                    color: theme.primaryColor,
                  }}
                >
                  <GlassWater className="w-6 h-6" />
                </div>

                <div
                  className="text-xs uppercase tracking-widest font-semibold mb-2"
                  style={{ color: theme.primaryColor }}
                >
                  Dinner & Festivities
                </div>

                <h3
                  className="text-2xl sm:text-3xl font-medium tracking-tight mb-4"
                  style={{
                    fontFamily: headingFontFamily,
                    color: theme.textColor,
                  }}
                >
                  The Reception
                </h3>

                {receptionDesc && (
                  <p
                    className="text-sm leading-relaxed opacity-80 mb-6"
                    style={{ color: theme.textColor }}
                  >
                    {receptionDesc}
                  </p>
                )}

                <div className="space-y-3 pt-2 text-sm">
                  {receptionDate && (
                    <div className="flex items-start gap-3">
                      <Calendar
                        className="w-4 h-4 mt-0.5 shrink-0"
                        style={{ color: theme.primaryColor }}
                      />
                      <span style={{ color: theme.textColor }}>
                        {formatWeddingDate(receptionDate, { includeWeekday: true })}
                      </span>
                    </div>
                  )}

                  {receptionTime && (
                    <div className="flex items-start gap-3">
                      <Clock
                        className="w-4 h-4 mt-0.5 shrink-0"
                        style={{ color: theme.primaryColor }}
                      />
                      <span style={{ color: theme.textColor }}>
                        {formatWeddingTime(receptionTime)}
                      </span>
                    </div>
                  )}

                  {receptionName && (
                    <div className="flex items-start gap-3 font-medium">
                      <MapPin
                        className="w-4 h-4 mt-0.5 shrink-0"
                        style={{ color: theme.primaryColor }}
                      />
                      <span style={{ color: theme.textColor }}>
                        {receptionName}
                      </span>
                    </div>
                  )}

                  {receptionAddress && (
                    <div className="pl-7 text-xs opacity-75 leading-relaxed" style={{ color: theme.textColor }}>
                      {receptionAddress}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
