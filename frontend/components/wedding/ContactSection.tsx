"use client";

import React from "react";
import { ThemeConfig, HEADING_FONT_MAP } from "@/utils/theme";
import { Phone, Heart, Sparkles, UserCheck } from "lucide-react";

interface ContactSectionProps {
  contactBride?: string;
  contactGroom?: string;
  contactCoordinator?: string;
  brideName?: string;
  groomName?: string;
  theme: ThemeConfig;
}

export function ContactSection({
  contactBride,
  contactGroom,
  contactCoordinator,
  brideName,
  groomName,
  theme,
}: ContactSectionProps) {
  const hasBride = !!contactBride?.trim();
  const hasGroom = !!contactGroom?.trim();
  const hasCoordinator = !!contactCoordinator?.trim();

  // If no contact info exists at all, hide section gracefully
  if (!hasBride && !hasGroom && !hasCoordinator) {
    return null;
  }

  const headingFontFamily =
    HEADING_FONT_MAP[theme.headingFont] || "Georgia, serif";

  const contacts = [
    ...(hasBride
      ? [
          {
            role: "Bride",
            name: brideName || "Bride",
            phone: contactBride?.trim() || "",
          },
        ]
      : []),
    ...(hasGroom
      ? [
          {
            role: "Groom",
            name: groomName || "Groom",
            phone: contactGroom?.trim() || "",
          },
        ]
      : []),
    ...(hasCoordinator
      ? [
          {
            role: "Wedding Coordinator",
            name: "Event Logistics & Inquiries",
            phone: contactCoordinator?.trim() || "",
          },
        ]
      : []),
  ];

  return (
    <section id="contact" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
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
            <span>Questions & Inquiries</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl font-normal tracking-tight"
            style={{
              fontFamily: headingFontFamily,
              color: theme.textColor,
            }}
          >
            Need Help?
          </h2>
          <p
            className="text-xs sm:text-sm opacity-70 mt-2 max-w-md mx-auto"
            style={{ color: theme.textColor }}
          >
            Feel free to reach out to us or our wedding coordinator for any questions regarding travel, location, or schedule.
          </p>
          <div
            className="w-16 h-0.5 mx-auto mt-4 rounded-full"
            style={{ backgroundColor: theme.primaryColor }}
          />
        </div>

        {/* Contact Cards */}
        <div
          className={`grid gap-4 sm:gap-6 ${
            contacts.length === 1
              ? "grid-cols-1 max-w-md mx-auto"
              : contacts.length === 2
              ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
              : "grid-cols-1 sm:grid-cols-3"
          }`}
        >
          {contacts.map((contact, i) => (
            <div
              key={i}
              className={`p-6 bg-white/90 backdrop-blur-xs text-center border transition-all duration-200 hover:-translate-y-0.5 ${
                theme.themeStyle === "luxury"
                  ? "rounded-2xl shadow-xs"
                  : theme.themeStyle === "classic"
                  ? "rounded-xl border shadow-2xs"
                  : theme.themeStyle === "modern"
                  ? "rounded-lg shadow-2xs"
                  : "rounded-xl shadow-none"
              }`}
              style={{ borderColor: `${theme.secondaryColor}80` }}
            >
              <div
                className="w-11 h-11 rounded-full mx-auto mb-3 flex items-center justify-center border"
                style={{
                  backgroundColor: `${theme.primaryColor}12`,
                  color: theme.primaryColor,
                  borderColor: `${theme.secondaryColor}60`,
                }}
              >
                <Phone className="w-5 h-5" />
              </div>

              <div
                className="text-[11px] uppercase tracking-wider font-semibold mb-1"
                style={{ color: theme.primaryColor }}
              >
                {contact.role}
              </div>

              <div
                className="text-sm font-medium mb-3 truncate"
                style={{ color: theme.textColor }}
              >
                {contact.name}
              </div>

              <a
                href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border transition-colors hover:shadow-2xs"
                style={{
                  borderColor: theme.secondaryColor,
                  color: theme.textColor,
                  backgroundColor: `${theme.backgroundColor}60`,
                }}
              >
                <Phone className="w-3.5 h-3.5" style={{ color: theme.primaryColor }} />
                <span>{contact.phone}</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
