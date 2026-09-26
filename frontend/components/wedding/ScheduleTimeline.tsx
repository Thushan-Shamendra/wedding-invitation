"use client";

import React from "react";
import { ScheduleEvent } from "@/types";
import { ThemeConfig, HEADING_FONT_MAP } from "@/utils/theme";
import { formatWeddingTime } from "@/utils/formatters";
import { Clock, Calendar, Sparkles } from "lucide-react";

interface ScheduleTimelineProps {
  events: ScheduleEvent[];
  theme: ThemeConfig;
}

export function ScheduleTimeline({ events, theme }: ScheduleTimelineProps) {
  // If no schedule events, gracefully hide section completely
  if (!events || events.length === 0) {
    return null;
  }

  const headingFontFamily =
    HEADING_FONT_MAP[theme.headingFont] || "Georgia, serif";

  return (
    <section id="schedule" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
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
            <span>Itinerary & Flow</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight"
            style={{
              fontFamily: headingFontFamily,
              color: theme.textColor,
            }}
          >
            Wedding Schedule
          </h2>
          <div
            className="w-16 h-0.5 mx-auto mt-4 rounded-full"
            style={{ backgroundColor: theme.primaryColor }}
          />
        </div>

        {/* Vertical Timeline */}
        <div className="relative pl-6 sm:pl-8 border-l-2 ml-4 sm:mx-auto max-w-2xl space-y-8"
          style={{ borderColor: `${theme.secondaryColor}60` }}
        >
          {events.map((event, idx) => (
            <div key={event._id || idx} className="relative group">
              {/* Timeline Bullet Node */}
              <div
                className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 bg-white transition-transform group-hover:scale-125"
                style={{
                  borderColor: theme.primaryColor,
                  backgroundColor: `${theme.primaryColor}20`,
                }}
              />

              {/* Event Card */}
              <div
                className={`p-5 sm:p-6 bg-white/90 backdrop-blur-xs transition-all duration-200 ${
                  theme.themeStyle === "luxury"
                    ? "rounded-2xl border shadow-sm"
                    : theme.themeStyle === "classic"
                    ? "rounded-xl border shadow-xs"
                    : theme.themeStyle === "modern"
                    ? "rounded-lg border shadow-xs"
                    : "rounded-xl border shadow-none"
                }`}
                style={{ borderColor: `${theme.secondaryColor}80` }}
              >
                {/* Event Time */}
                {event.startTime && (
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold tracking-wide uppercase mb-2"
                    style={{
                      backgroundColor: `${theme.primaryColor}15`,
                      color: theme.primaryColor,
                    }}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{formatWeddingTime(event.startTime)}</span>
                  </div>
                )}

                {/* Event Title */}
                <h3
                  className="text-xl sm:text-2xl font-medium tracking-tight mb-2"
                  style={{
                    fontFamily: headingFontFamily,
                    color: theme.textColor,
                  }}
                >
                  {event.eventName}
                </h3>

                {/* Event Description */}
                {event.description && (
                  <p
                    className="text-sm leading-relaxed opacity-80"
                    style={{ color: theme.textColor }}
                  >
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
