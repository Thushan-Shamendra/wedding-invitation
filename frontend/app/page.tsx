"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { weddingService } from "@/services/weddingService";
import { Wedding } from "@/types";
import { DEFAULT_THEME, HEADING_FONT_MAP, BODY_FONT_MAP, ThemeStyle } from "@/utils/theme";
import { Sparkles, ArrowRight, Clock, ShieldCheck } from "lucide-react";
import { MusicPlayer } from "@/components/wedding/MusicPlayer";

function HomeContent() {
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const searchParams = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const data = await weddingService.getWeddingDetails();
        setWedding(data);
      } catch (err) {
        console.error("Failed to load wedding theme settings on home page:", err);
      }
    };

    loadTheme();
  }, []);

  const theme = useMemo(() => {
    return {
      primaryColor: wedding?.primaryColor || DEFAULT_THEME.primaryColor,
      secondaryColor: wedding?.secondaryColor || DEFAULT_THEME.secondaryColor,
      backgroundColor: wedding?.backgroundColor || DEFAULT_THEME.backgroundColor,
      textColor: wedding?.textColor || DEFAULT_THEME.textColor,
      headingFont: wedding?.headingFont || DEFAULT_THEME.headingFont,
      bodyFont: wedding?.bodyFont || DEFAULT_THEME.bodyFont,
      themeStyle: (wedding?.themeStyle as ThemeStyle) || DEFAULT_THEME.themeStyle,
    };
  }, [wedding]);

  const headingFontFamily =
    HEADING_FONT_MAP[theme.headingFont] || "Georgia, serif";
  const bodyFontFamily =
    BODY_FONT_MAP[theme.bodyFont] || "sans-serif";

  const title = wedding?.weddingTitle || "Wedding Invitation";
  const isDraft = wedding?.websiteStatus === "draft" && !isPreview;

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-6 transition-colors duration-200"
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: bodyFontFamily,
      }}
    >
      {/* If Draft mode and not Admin Preview */}
      {isDraft ? (
        <div
          className="w-full max-w-lg bg-white p-8 sm:p-12 text-center relative overflow-hidden rounded-3xl border shadow-sm transition-all duration-200"
          style={{ borderColor: theme.secondaryColor }}
        >
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full border mb-6 shadow-xs"
            style={{
              backgroundColor: `${theme.primaryColor}15`,
              color: theme.primaryColor,
              borderColor: theme.secondaryColor,
            }}
          >
            <Clock className="w-8 h-8" />
          </div>

          <h1
            className="text-3xl font-medium tracking-tight mb-3"
            style={{
              fontFamily: headingFontFamily,
              color: theme.textColor,
            }}
          >
            Our Wedding Website Is Coming Soon
          </h1>

          <p className="text-sm opacity-80 mb-8 max-w-sm mx-auto leading-relaxed">
            We are currently putting together the final details for our special day. Please check back soon!
          </p>

          <div className="pt-6 border-t border-[#E8E3DA] flex items-center justify-center">
            <Link
              href="/admin/login"
              className="text-xs font-medium text-[#746E66] hover:text-[#26231F] transition-colors flex items-center gap-1.5"
            >
              <span>Administrator Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        /* Published or Admin Preview */
        <div
          className={`w-full max-w-lg bg-white p-8 sm:p-10 text-center relative overflow-hidden transition-all duration-200 ${
            theme.themeStyle === "luxury"
              ? "rounded-3xl border shadow-md"
              : theme.themeStyle === "classic"
              ? "rounded-2xl border-2 border-double shadow-sm"
              : theme.themeStyle === "modern"
              ? "rounded-xl border shadow-sm"
              : "rounded-2xl border shadow-none"
          }`}
          style={{ borderColor: theme.secondaryColor }}
        >
          {isPreview && (
            <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Admin Preview Mode</span>
            </div>
          )}

          {/* Luxury top accent */}
          {theme.themeStyle === "luxury" && (
            <div
              className="absolute top-0 left-0 right-0 h-1.5"
              style={{
                background: `linear-gradient(to right, transparent, ${theme.primaryColor}, transparent)`,
              }}
            />
          )}

          {/* Monogram / Icon */}
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full border mb-6 shadow-xs"
            style={{
              backgroundColor: `${theme.primaryColor}15`,
              color: theme.primaryColor,
              borderColor: theme.secondaryColor,
            }}
          >
            <Sparkles className="w-8 h-8" />
          </div>

          <h1
            className="text-3xl font-medium tracking-tight mb-2"
            style={{
              fontFamily: headingFontFamily,
              color: theme.textColor,
            }}
          >
            {title}
          </h1>
          <p className="text-sm opacity-80 mb-8 max-w-sm mx-auto leading-relaxed">
            Welcome to the wedding celebration invitation portal. Access the administration dashboard below.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/admin/login"
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl text-white font-medium shadow-sm transition-all duration-200"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <span>Go to Admin Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div
            className="mt-8 pt-6 border-t text-xs opacity-70"
            style={{ borderColor: theme.secondaryColor }}
          >
            <p>
              Admin URL:{" "}
              <code
                className="px-1.5 py-0.5 rounded border"
                style={{
                  backgroundColor: `${theme.secondaryColor}20`,
                  borderColor: theme.secondaryColor,
                  color: theme.textColor,
                }}
              >
                /admin/login
              </code>
            </p>
          </div>
        </div>
      )}

      {/* Floating Background Music Player */}
      {wedding?.musicEnabled && (wedding.backgroundMusicUrl || wedding.musicUrl) && (
        <MusicPlayer
          url={(wedding.backgroundMusicUrl || wedding.musicUrl) as string}
          title={wedding.musicTitle || "Wedding Music"}
          theme={theme}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F6F1]" />}>
      <HomeContent />
    </Suspense>
  );
}
