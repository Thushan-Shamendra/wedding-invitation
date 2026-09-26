"use client";

import React, { useState } from "react";
import { ThemeConfig, HEADING_FONT_MAP } from "@/utils/theme";
import { Mail, CheckCircle2, AlertCircle, ArrowRight, Lock, Sparkles, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface RSVPInfoSectionProps {
  rsvpEnabled?: boolean;
  personalInvitationEnabled?: boolean;
  contactCoordinator?: string;
  theme: ThemeConfig;
}

export function RSVPInfoSection({
  rsvpEnabled = true,
  personalInvitationEnabled = true,
  contactCoordinator,
  theme,
}: RSVPInfoSectionProps) {
  const router = useRouter();
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [tokenError, setTokenError] = useState("");

  const headingFontFamily =
    HEADING_FONT_MAP[theme.headingFont] || "Georgia, serif";

  const handleOpenInvitation = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tokenInput.trim();
    if (!trimmed) {
      setTokenError("Please enter your invitation code.");
      return;
    }
    // Navigate to personal invitation link
    router.push(`/invite/${encodeURIComponent(trimmed)}`);
  };

  return (
    <section id="rsvp" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div
          className={`p-8 sm:p-12 bg-white/95 backdrop-blur-xs text-center border transition-all duration-200 ${
            theme.themeStyle === "luxury"
              ? "rounded-3xl shadow-md"
              : theme.themeStyle === "classic"
              ? "rounded-2xl border-2 border-double shadow-xs"
              : theme.themeStyle === "modern"
              ? "rounded-xl shadow-xs"
              : "rounded-2xl shadow-none"
          }`}
          style={{ borderColor: `${theme.secondaryColor}90` }}
        >
          {/* Top Badge */}
          <div
            className="w-14 h-14 rounded-full mx-auto mb-6 flex items-center justify-center border shadow-2xs"
            style={{
              backgroundColor: `${theme.primaryColor}15`,
              color: theme.primaryColor,
              borderColor: `${theme.secondaryColor}60`,
            }}
          >
            {rsvpEnabled ? (
              <Mail className="w-7 h-7" />
            ) : (
              <Lock className="w-7 h-7" />
            )}
          </div>

          <div
            className="text-xs uppercase tracking-widest font-semibold mb-2"
            style={{ color: theme.primaryColor }}
          >
            Celebration Attendance
          </div>

          <h2
            className="text-3xl sm:text-4xl font-medium tracking-tight mb-4"
            style={{
              fontFamily: headingFontFamily,
              color: theme.textColor,
            }}
          >
            RSVP Information
          </h2>

          <div
            className="w-12 h-0.5 mx-auto mb-6 rounded-full"
            style={{ backgroundColor: theme.primaryColor }}
          />

          {rsvpEnabled ? (
            <div className="space-y-6 max-w-lg mx-auto">
              <p
                className="text-sm sm:text-base leading-relaxed opacity-85"
                style={{ color: theme.textColor }}
              >
                Please use your personal invitation link received via WhatsApp or message to confirm your attendance, guest count, and meal preferences.
              </p>

              {!showTokenInput ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTokenInput(true)}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-medium text-sm text-white shadow-sm transition-all duration-200 hover:opacity-95 hover:shadow-md cursor-pointer flex items-center justify-center gap-2"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    <span>Open My Invitation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleOpenInvitation}
                  className="p-5 rounded-2xl bg-[#F8F6F1]/80 border space-y-3 text-left transition-all"
                  style={{ borderColor: `${theme.secondaryColor}60` }}
                >
                  <label
                    htmlFor="invitationTokenInput"
                    className="block text-xs font-medium"
                    style={{ color: theme.textColor }}
                  >
                    Enter your Invitation Code or Token:
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      id="invitationTokenInput"
                      type="text"
                      value={tokenInput}
                      onChange={(e) => {
                        setTokenInput(e.target.value);
                        setTokenError("");
                      }}
                      placeholder="e.g. inv_guest123"
                      className="flex-1 px-4 py-2.5 rounded-xl border bg-white text-sm focus:outline-hidden focus:ring-2"
                      style={{
                        borderColor: tokenError ? "#e11d48" : `${theme.secondaryColor}80`,
                        color: theme.textColor,
                      }}
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl font-medium text-xs text-white shadow-2xs transition-all hover:opacity-95 cursor-pointer shrink-0"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      View Invitation
                    </button>
                  </div>
                  {tokenError && (
                    <p className="text-xs text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{tokenError}</span>
                    </p>
                  )}
                  <p className="text-[11px] opacity-70" style={{ color: theme.textColor }}>
                    Tip: You can also click the direct link provided in your WhatsApp or SMS invitation.
                  </p>
                </form>
              )}

              {contactCoordinator && (
                <div
                  className="pt-6 border-t text-xs opacity-75 flex items-center justify-center gap-2"
                  style={{ borderColor: `${theme.secondaryColor}50`, color: theme.textColor }}
                >
                  <MessageCircle className="w-4 h-4" style={{ color: theme.primaryColor }} />
                  <span>
                    Having trouble? Contact our Wedding Coordinator at{" "}
                    <a
                      href={`tel:${contactCoordinator.replace(/[^0-9+]/g, "")}`}
                      className="font-medium underline hover:opacity-100"
                    >
                      {contactCoordinator}
                    </a>
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* RSVP is Closed */
            <div className="space-y-4 max-w-md mx-auto py-2">
              <div
                className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs sm:text-sm font-medium leading-relaxed"
              >
                RSVP is currently closed. If you need to make urgent updates to your attendance, please reach out directly to the couple or wedding coordinator.
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
