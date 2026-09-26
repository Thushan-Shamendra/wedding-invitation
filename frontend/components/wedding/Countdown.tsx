"use client";

import React, { useState, useEffect } from "react";
import { ThemeConfig, HEADING_FONT_MAP } from "@/utils/theme";
import { Sparkles, Heart } from "lucide-react";

interface CountdownProps {
  weddingDate?: string;
  theme: ThemeConfig;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  isToday: boolean;
}

export function Countdown({ weddingDate, theme }: CountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);

  useEffect(() => {
    if (!weddingDate) return;

    const calculateTime = (): TimeRemaining => {
      // Parse wedding date target
      let targetTime: number;
      const match = weddingDate.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1;
        const day = parseInt(match[3], 10);
        targetTime = new Date(year, month, day, 0, 0, 0).getTime();
      } else {
        targetTime = new Date(weddingDate).getTime();
      }

      const now = new Date().getTime();
      const difference = targetTime - now;

      // Check if it's the wedding day today (within 24 hours of target)
      const oneDayMs = 24 * 60 * 60 * 1000;
      const isToday = difference <= 0 && Math.abs(difference) < oneDayMs;
      const isPast = difference < 0 && !isToday;

      if (isPast) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, isToday: false };
      }

      if (isToday) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false, isToday: true };
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor(
        (difference % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds, isPast: false, isToday: false };
    };

    // Initial calculation
    setTimeRemaining(calculateTime());

    // Update every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [weddingDate]);

  if (!weddingDate || !timeRemaining) return null;

  const headingFontFamily =
    HEADING_FONT_MAP[theme.headingFont] || "Georgia, serif";

  const timeBlocks = [
    { label: "Days", value: timeRemaining.days },
    { label: "Hours", value: timeRemaining.hours },
    { label: "Minutes", value: timeRemaining.minutes },
    { label: "Seconds", value: timeRemaining.seconds },
  ];

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2
          className="text-2xl sm:text-3xl font-medium tracking-tight mb-2"
          style={{
            fontFamily: headingFontFamily,
            color: theme.textColor,
          }}
        >
          Counting Down To Our Special Day
        </h2>

        <p
          className="text-xs sm:text-sm opacity-70 mb-8 max-w-md mx-auto"
          style={{ color: theme.textColor }}
        >
          Every moment brings us closer to celebrating with the people we cherish most.
        </p>

        {timeRemaining.isToday ? (
          <div
            className="inline-flex items-center gap-3 px-8 py-5 rounded-2xl bg-white/90 border shadow-sm"
            style={{ borderColor: theme.secondaryColor }}
          >
            <Sparkles className="w-6 h-6 animate-pulse" style={{ color: theme.primaryColor }} />
            <span
              className="text-xl sm:text-2xl font-serif font-medium"
              style={{ color: theme.textColor, fontFamily: headingFontFamily }}
            >
              Today Is Our Special Day!
            </span>
            <Sparkles className="w-6 h-6 animate-pulse" style={{ color: theme.primaryColor }} />
          </div>
        ) : timeRemaining.isPast ? (
          <div
            className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/90 border shadow-sm"
            style={{ borderColor: theme.secondaryColor }}
          >
            <Heart className="w-5 h-5 fill-current" style={{ color: theme.primaryColor }} />
            <span
              className="text-base sm:text-lg font-serif font-medium"
              style={{ color: theme.textColor, fontFamily: headingFontFamily }}
            >
              Thank you for celebrating our love with us
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto">
            {timeBlocks.map((block) => (
              <div
                key={block.label}
                className="bg-white/85 backdrop-blur-xs rounded-2xl p-4 sm:p-5 border shadow-2xs transition-transform hover:-translate-y-0.5"
                style={{
                  borderColor: `${theme.secondaryColor}80`,
                }}
              >
                <div
                  className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight mb-1"
                  style={{
                    fontFamily: headingFontFamily,
                    color: theme.textColor,
                  }}
                >
                  {String(block.value).padStart(2, "0")}
                </div>
                <div
                  className="text-[11px] sm:text-xs uppercase tracking-wider font-medium opacity-75"
                  style={{ color: theme.primaryColor }}
                >
                  {block.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
