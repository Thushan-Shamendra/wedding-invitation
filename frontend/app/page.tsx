"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { weddingService } from "@/services/weddingService";
import { Wedding } from "@/types";
import { DEFAULT_THEME, HEADING_FONT_MAP, BODY_FONT_MAP, ThemeStyle } from "@/utils/theme";
import { Sparkles, ArrowRight } from "lucide-react";
import { MusicPlayer } from "@/components/wedding/MusicPlayer";

export default function Home() {
  const [wedding, setWedding] = useState<Wedding | null>(null);

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

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-6 transition-colors duration-200"
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: bodyFontFamily,
      }}
    >
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
