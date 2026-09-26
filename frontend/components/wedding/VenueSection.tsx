"use client";

import React, { useState } from "react";
import { Wedding } from "@/types";
import { ThemeConfig, HEADING_FONT_MAP } from "@/utils/theme";
import { formatWeddingTime } from "@/utils/formatters";
import { MapPin, Navigation, ExternalLink, Sparkles, Church, GlassWater } from "lucide-react";

interface VenueSectionProps {
  wedding: Wedding;
  theme: ThemeConfig;
}

export function VenueSection({ wedding, theme }: VenueSectionProps) {
  const headingFontFamily =
    HEADING_FONT_MAP[theme.headingFont] || "Georgia, serif";

  const ceremonyName =
    wedding.ceremonyVenueName || wedding.ceremonyVenue?.name;
  const ceremonyAddress =
    wedding.ceremonyAddress || wedding.ceremonyVenue?.address;
  const ceremonyTime =
    wedding.ceremonyTime || wedding.ceremonyVenue?.time || wedding.startTime;
  const ceremonyMapUrl =
    wedding.ceremonyGoogleMapsUrl || wedding.ceremonyVenue?.googleMapsUrl;
  const ceremonyLat = wedding.ceremonyLatitude;
  const ceremonyLng = wedding.ceremonyLongitude;

  const receptionName =
    wedding.receptionVenueName || wedding.receptionVenue?.name;
  const receptionAddress =
    wedding.receptionAddress || wedding.receptionVenue?.address;
  const receptionTime =
    wedding.receptionTime || wedding.receptionVenue?.time || wedding.endTime;
  const receptionMapUrl =
    wedding.receptionGoogleMapsUrl || wedding.receptionVenue?.googleMapsUrl;
  const receptionLat = wedding.receptionLatitude;
  const receptionLng = wedding.receptionLongitude;

  const hasCeremony = !!(ceremonyName || ceremonyAddress);
  const hasReception = !!(receptionName || receptionAddress);

  const [activeTab, setActiveTab] = useState<"ceremony" | "reception">(
    hasCeremony ? "ceremony" : "reception"
  );

  if (!hasCeremony && !hasReception) return null;

  // Active venue data based on tab
  const isCeremony = activeTab === "ceremony";
  const currentName = isCeremony ? ceremonyName : receptionName;
  const currentAddress = isCeremony ? ceremonyAddress : receptionAddress;
  const currentTime = isCeremony ? ceremonyTime : receptionTime;
  const currentLat = isCeremony ? ceremonyLat : receptionLat;
  const currentLng = isCeremony ? ceremonyLng : receptionLng;
  const currentDirectMapUrl = isCeremony ? ceremonyMapUrl : receptionMapUrl;

  // Generate zero-key Google Maps embed URL
  let embedUrl = "";
  if (currentLat && currentLng) {
    embedUrl = `https://maps.google.com/maps?q=${currentLat},${currentLng}&hl=en&z=15&output=embed`;
  } else if (currentAddress || currentName) {
    const query = encodeURIComponent(
      [currentName, currentAddress].filter(Boolean).join(", ")
    );
    embedUrl = `https://maps.google.com/maps?q=${query}&hl=en&z=15&output=embed`;
  }

  // External direct maps URL
  const googleMapsLink =
    currentDirectMapUrl?.trim() ||
    (currentLat && currentLng
      ? `https://www.google.com/maps/search/?api=1&query=${currentLat},${currentLng}`
      : currentAddress || currentName
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          [currentName, currentAddress].filter(Boolean).join(", ")
        )}`
      : "#");

  const directionsLink =
    currentLat && currentLng
      ? `https://www.google.com/maps/dir/?api=1&destination=${currentLat},${currentLng}`
      : currentAddress || currentName
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
          [currentName, currentAddress].filter(Boolean).join(", ")
        )}`
      : googleMapsLink;

  return (
    <section id="venue" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold tracking-widest uppercase mb-3"
            style={{
              backgroundColor: `${theme.primaryColor}15`,
              color: theme.primaryColor,
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Locations & Directions</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight"
            style={{
              fontFamily: headingFontFamily,
              color: theme.textColor,
            }}
          >
            Venues & Maps
          </h2>
          <div
            className="w-16 h-0.5 mx-auto mt-4 rounded-full"
            style={{ backgroundColor: theme.primaryColor }}
          />
        </div>

        {/* Tab Switcher if both exist */}
        {hasCeremony && hasReception && (
          <div className="flex items-center justify-center gap-3 mb-10">
            <button
              type="button"
              onClick={() => setActiveTab("ceremony")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-2 border ${
                activeTab === "ceremony"
                  ? "text-white shadow-sm"
                  : "bg-white/80 opacity-75 hover:opacity-100"
              }`}
              style={{
                backgroundColor:
                  activeTab === "ceremony" ? theme.primaryColor : undefined,
                borderColor: `${theme.secondaryColor}80`,
                color: activeTab === "ceremony" ? "#FFFFFF" : theme.textColor,
              }}
            >
              <Church className="w-4 h-4" />
              <span>Ceremony Venue</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("reception")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-2 border ${
                activeTab === "reception"
                  ? "text-white shadow-sm"
                  : "bg-white/80 opacity-75 hover:opacity-100"
              }`}
              style={{
                backgroundColor:
                  activeTab === "reception" ? theme.primaryColor : undefined,
                borderColor: `${theme.secondaryColor}80`,
                color: activeTab === "reception" ? "#FFFFFF" : theme.textColor,
              }}
            >
              <GlassWater className="w-4 h-4" />
              <span>Reception Venue</span>
            </button>
          </div>
        )}

        {/* Venue Information and Map Container */}
        <div
          className={`bg-white/95 backdrop-blur-xs overflow-hidden border transition-all duration-200 ${
            theme.themeStyle === "luxury"
              ? "rounded-3xl shadow-md"
              : theme.themeStyle === "classic"
              ? "rounded-2xl border-2 shadow-xs"
              : theme.themeStyle === "modern"
              ? "rounded-xl shadow-xs"
              : "rounded-2xl shadow-none"
          }`}
          style={{ borderColor: `${theme.secondaryColor}90` }}
        >
          <div className="p-8 sm:p-10 border-b" style={{ borderColor: `${theme.secondaryColor}40` }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div
                  className="text-xs uppercase tracking-widest font-semibold mb-1"
                  style={{ color: theme.primaryColor }}
                >
                  {isCeremony ? "Ceremony Location" : "Reception Location"}
                </div>

                <h3
                  className="text-2xl sm:text-3xl font-medium tracking-tight mb-2"
                  style={{
                    fontFamily: headingFontFamily,
                    color: theme.textColor,
                  }}
                >
                  {currentName || "Venue"}
                </h3>

                {currentAddress && (
                  <p className="text-sm opacity-80 flex items-center gap-2 max-w-xl" style={{ color: theme.textColor }}>
                    <MapPin className="w-4 h-4 shrink-0" style={{ color: theme.primaryColor }} />
                    <span>{currentAddress}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <a
                  href={googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-2 bg-white hover:bg-zinc-50 shadow-2xs cursor-pointer"
                  style={{
                    borderColor: theme.secondaryColor,
                    color: theme.textColor,
                  }}
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href={directionsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-2 text-white shadow-2xs hover:opacity-90 cursor-pointer"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Directions</span>
                </a>
              </div>
            </div>
          </div>

          {/* Zero-Key Embedded Google Maps iframe */}
          <div className="w-full h-72 sm:h-96 bg-zinc-100 relative">
            {embedUrl ? (
              <iframe
                title={`${currentName || "Venue"} Location Map`}
                src={embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-zinc-500">
                <MapPin className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">Location coordinates or address not specified yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
