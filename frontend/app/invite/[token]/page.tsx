"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { guestService } from "@/services/guestService";
import { rsvpService } from "@/services/rsvpService";
import { weddingService } from "@/services/weddingService";
import { PublicGuestInvitation, PublicRSVP, Wedding } from "@/types";
import {
  Sparkles,
  Users,
  Heart,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Utensils,
  MessageSquare,
  ArrowRight,
  Check,
  Edit3,
  CalendarCheck2,
  Calendar,
} from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Toast } from "@/components/ui/Toast";
import { MusicPlayer } from "@/components/wedding/MusicPlayer";
import {
  DEFAULT_THEME,
  HEADING_FONT_MAP,
  BODY_FONT_MAP,
  ThemeStyle,
} from "@/utils/theme";

export default function PublicInvitationPage() {
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [guest, setGuest] = useState<PublicGuestInvitation | null>(null);
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Form states
  const [attendanceStatus, setAttendanceStatus] = useState<"attending" | "declined">("attending");
  const [numberOfGuests, setNumberOfGuests] = useState<number>(1);
  const [mealPreference, setMealPreference] = useState<string>("Standard");
  const [customMeal, setCustomMeal] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  // Existing response states
  const [hasPreviousRsvp, setHasPreviousRsvp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<PublicRSVP | null>(null);

  // Toast
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({ show: false, message: "", type: "info" });

  useEffect(() => {
    if (!token) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const fetchInvitationAndRsvp = async () => {
      try {
        setLoading(true);
        const [guestData, rsvpData, weddingData] = await Promise.all([
          guestService.getGuestByInvitationToken(token),
          rsvpService.getRSVPByInvitationToken(token).catch(() => null),
          weddingService.getWeddingDetails().catch(() => null),
        ]);

        setGuest(guestData);
        if (weddingData) {
          setWedding(weddingData);
        }

        if (rsvpData) {
          setHasPreviousRsvp(true);
          setAttendanceStatus(rsvpData.attendanceStatus);
          setNumberOfGuests(rsvpData.numberOfGuests || 1);
          setMessage(rsvpData.message || "");

          const standardMeals = ["Standard", "Vegetarian", "Vegan", "Halal", "Gluten-Free"];
          if (rsvpData.mealPreference && standardMeals.includes(rsvpData.mealPreference)) {
            setMealPreference(rsvpData.mealPreference);
          } else if (rsvpData.mealPreference) {
            setMealPreference("Other");
            setCustomMeal(rsvpData.mealPreference);
          } else {
            setMealPreference("Standard");
          }

          setSubmittedData(rsvpData);
        }
      } catch (err) {
        console.error("Failed to load invitation or RSVP:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitationAndRsvp();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guest) return;

    try {
      setSubmitting(true);

      const finalMealPreference =
        attendanceStatus === "attending"
          ? mealPreference === "Other"
            ? customMeal.trim() || "Other"
            : mealPreference
          : "";

      const payload = {
        attendanceStatus,
        numberOfGuests: attendanceStatus === "attending" ? numberOfGuests : 0,
        mealPreference: finalMealPreference,
        message: message.trim(),
      };

      const res = await rsvpService.submitRSVP(token, payload);

      setSubmittedData(res.data);
      setHasPreviousRsvp(true);
      setSubmittedSuccess(true);
      setToast({
        show: true,
        message: res.message || "Your RSVP has been submitted successfully!",
        type: "success",
      });
    } catch (err: any) {
      console.error("Failed to submit RSVP:", err);
      setToast({
        show: true,
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to submit your RSVP. Please try again.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#F8F6F1]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-[#746E66]">
            Loading Invitation...
          </p>
        </div>
      </div>
    );
  }

  if (notFound || !guest) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#F8F6F1] text-[#26231F]">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#E8E3DA] p-8 sm:p-10 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-serif font-semibold text-[#26231F]">
            Invitation Not Found
          </h1>

          <p className="text-sm text-[#746E66] leading-relaxed">
            The invitation link may be invalid or no longer available.
          </p>

          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[#E8E3DA] bg-[#F8F6F1] hover:bg-[#EFEAE1] text-xs font-medium text-[#26231F] transition-colors"
            >
              <span>Go to Wedding Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const guestCountOptions = Array.from(
    { length: guest.maximumGuests },
    (_, i) => ({
      label: `${i + 1} Guest${i + 1 > 1 ? "s" : ""}`,
      value: String(i + 1),
    })
  );

  // Dynamic invitation message texts from MongoDB
  const displayedGreeting = useMemo(() => {
    if (!guest) return "";
    const template =
      wedding?.personalGuestGreeting?.trim() || "Dear {{guestName}},";
    return template.replace(/\{\{\s*guestName\s*\}\}/g, guest.name);
  }, [wedding?.personalGuestGreeting, guest]);

  const displayedHeading =
    wedding?.invitationHeading?.trim() || "We're Getting Married";

  const displayedMessage =
    wedding?.invitationMessage?.trim() ||
    "You are warmly invited to celebrate our special wedding day with us.";

  const coupleNames = useMemo(() => {
    if (!wedding) return "";
    const b = wedding.brideName?.trim();
    const g = wedding.groomName?.trim();
    if (b && g) return `${b} & ${g}`;
    return b || g || "";
  }, [wedding]);

  const displayedFooterMessage = wedding?.footerMessage?.trim() || "";

  // Dynamic theme values from MongoDB
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

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-200"
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: bodyFontFamily,
      }}
    >
      <div
        className={`w-full max-w-xl bg-white p-6 sm:p-10 lg:p-12 relative overflow-hidden space-y-8 transition-all duration-200 ${
          theme.themeStyle === "luxury"
            ? "rounded-3xl border shadow-md"
            : theme.themeStyle === "classic"
            ? "rounded-2xl border-2 border-double shadow-xs"
            : theme.themeStyle === "modern"
            ? "rounded-xl border shadow-sm"
            : "rounded-2xl border shadow-none"
        }`}
        style={{ borderColor: theme.secondaryColor }}
      >
        {/* Luxury Top Gradient Accent */}
        {theme.themeStyle === "luxury" && (
          <div
            className="absolute top-0 left-0 right-0 h-1.5"
            style={{
              background: `linear-gradient(to right, transparent, ${theme.primaryColor}, transparent)`,
            }}
          />
        )}

        {/* Invitation Top Header */}
        <div className="text-center space-y-4">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-full shadow-xs"
            style={{
              backgroundColor: `${theme.primaryColor}15`,
              color: theme.primaryColor,
              borderColor: theme.secondaryColor,
              borderWidth: 1,
            }}
          >
            <Sparkles className="w-6 h-6" />
          </div>

          <div>
            <span
              className="text-[11px] uppercase tracking-widest font-semibold block"
              style={{ color: theme.primaryColor }}
            >
              {displayedHeading}
            </span>
            <h1
              className="text-3xl sm:text-4xl font-medium tracking-tight mt-1"
              style={{
                fontFamily: headingFontFamily,
                color: theme.textColor,
              }}
            >
              {displayedGreeting}
            </h1>
          </div>

          {/* Couple Names & Date */}
          {(coupleNames || wedding?.weddingDate) && (
            <div className="space-y-0.5">
              {coupleNames && (
                <p
                  className="text-base font-semibold"
                  style={{
                    fontFamily: headingFontFamily,
                    color: theme.textColor,
                  }}
                >
                  {coupleNames}
                </p>
              )}
              {wedding?.weddingDate && (
                <p
                  className="text-xs font-medium flex items-center justify-center gap-1"
                  style={{ color: theme.primaryColor }}
                >
                  <Calendar className="w-3.5 h-3.5" style={{ color: theme.primaryColor }} />
                  <span>{wedding.weddingDate}</span>
                </p>
              )}
            </div>
          )}

          {/* Formal Invitation Message from MongoDB */}
          <div
            className="rounded-2xl p-5 text-sm leading-relaxed whitespace-pre-line text-center"
            style={{
              backgroundColor: `${theme.secondaryColor}18`,
              borderColor: theme.secondaryColor,
              borderWidth: 1,
              fontFamily:
                theme.themeStyle === "classic" || theme.themeStyle === "luxury"
                  ? headingFontFamily
                  : bodyFontFamily,
              fontStyle:
                theme.themeStyle === "classic" || theme.themeStyle === "luxury"
                  ? "italic"
                  : "normal",
            }}
          >
            {displayedMessage}
          </div>

          {/* Personalized Note for this specific guest if present */}
          {guest.personalMessage && (
            <div
              className="bg-white rounded-2xl p-4 text-xs italic leading-relaxed text-left border"
              style={{ borderColor: theme.secondaryColor }}
            >
              <span
                className="text-[10px] uppercase font-bold not-italic block mb-1"
                style={{ color: theme.primaryColor }}
              >
                Personal Note from Couple:
              </span>
              "{guest.personalMessage}"
            </div>
          )}

          {/* Guest Allocation Pill */}
          <div
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border"
            style={{
              backgroundColor: `${theme.secondaryColor}15`,
              borderColor: theme.secondaryColor,
            }}
          >
            <Users className="w-4 h-4" style={{ color: theme.primaryColor }} />
            <span>
              Invitation Allowance:{" "}
              <strong style={{ color: theme.primaryColor }}>
                Up to {guest.maximumGuests} guest{guest.maximumGuests > 1 ? "s" : ""}
              </strong>
            </span>
          </div>

          {/* Footer Message / Closing */}
          {displayedFooterMessage && (
            <p
              className="text-xs font-medium italic pt-1"
              style={{
                fontFamily: headingFontFamily,
                color: theme.textColor,
                opacity: 0.8,
              }}
            >
              {displayedFooterMessage}
            </p>
          )}
        </div>

        {/* Decorative Divider */}
        <div className="flex items-center justify-center">
          <div className="h-[1px] w-20" style={{ backgroundColor: theme.secondaryColor }} />
          <Heart className="w-4 h-4 mx-4" style={{ color: theme.primaryColor }} />
          <div className="h-[1px] w-20" style={{ backgroundColor: theme.secondaryColor }} />
        </div>

        {/* SUCCESS CONFIRMATION STATE */}
        {submittedSuccess && submittedData ? (
          <div className="bg-[#FAF8F5] rounded-2xl border border-[#C9A96E]/40 p-6 sm:p-8 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-serif font-semibold text-[#26231F]">
                Thank You, {guest.name}!
              </h2>
              <p className="text-sm text-[#746E66] leading-relaxed max-w-md mx-auto">
                {submittedData.attendanceStatus === "attending"
                  ? `We are thrilled to celebrate our special day with you! Your RSVP is confirmed for ${
                      submittedData.numberOfGuests
                    } guest${submittedData.numberOfGuests > 1 ? "s" : ""}.`
                  : "Thank you for letting us know. You will be dearly missed on our special day."}
              </p>
            </div>

            {/* Response Summary Box */}
            <div className="bg-white rounded-xl border border-[#E8E3DA] p-4 text-xs text-left space-y-2 text-[#746E66]">
              <div className="flex justify-between">
                <span className="font-medium text-[#26231F]">Attendance:</span>
                <span className="capitalize font-semibold text-[#8C703E]">
                  {submittedData.attendanceStatus}
                </span>
              </div>
              {submittedData.attendanceStatus === "attending" && (
                <>
                  <div className="flex justify-between">
                    <span className="font-medium text-[#26231F]">Guests:</span>
                    <span>{submittedData.numberOfGuests}</span>
                  </div>
                  {submittedData.mealPreference && (
                    <div className="flex justify-between">
                      <span className="font-medium text-[#26231F]">Meal Preference:</span>
                      <span>{submittedData.mealPreference}</span>
                    </div>
                  )}
                </>
              )}
              {submittedData.message && (
                <div className="pt-2 border-t border-[#E8E3DA]/60">
                  <span className="font-medium text-[#26231F] block mb-1">Your Note:</span>
                  <p className="italic">{submittedData.message}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => setSubmittedSuccess(false)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[#E8E3DA] bg-white hover:bg-[#FAF8F5] text-xs font-medium text-[#26231F] transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#C9A96E]" />
                <span>Edit Your Response</span>
              </button>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium text-white transition-colors cursor-pointer"
                style={{ backgroundColor: theme.primaryColor }}
              >
                <span>Visit Wedding Website</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          /* RSVP SUBMISSION FORM */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-serif font-semibold text-[#26231F]">
                Will You Join Us?
              </h2>
              <p className="text-xs text-[#746E66]">
                Kindly respond to help us finalize arrangements for our celebration.
              </p>
            </div>

            {/* Previous Submission Alert */}
            {hasPreviousRsvp && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#C9A96E]/50 text-xs text-[#8C703E]">
                <CalendarCheck2 className="w-4 h-4 shrink-0 text-[#C9A96E]" />
                <span>
                  Your RSVP was previously recorded. You can modify your choices below and click{" "}
                  <strong>Update RSVP</strong>.
                </span>
              </div>
            )}

            {/* Attendance Choice Buttons */}
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-[#746E66]">
                Attendance Confirmation
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAttendanceStatus("attending")}
                  className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                    attendanceStatus === "attending"
                      ? "ring-2"
                      : "border-[#E8E3DA] bg-white hover:border-[#D8B4A0]"
                  }`}
                  style={
                    attendanceStatus === "attending"
                      ? {
                          borderColor: theme.primaryColor,
                          backgroundColor: `${theme.secondaryColor}15`,
                        }
                      : undefined
                  }
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      attendanceStatus === "attending"
                        ? "text-white"
                        : "bg-[#F8F6F1] text-[#746E66]"
                    }`}
                    style={
                      attendanceStatus === "attending"
                        ? { backgroundColor: theme.primaryColor }
                        : undefined
                    }
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#26231F]">
                      Yes, I'll Be There
                    </p>
                    <p className="text-[11px] text-[#746E66]">
                      Delighted to celebrate with you
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAttendanceStatus("declined")}
                  className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                    attendanceStatus === "declined"
                      ? "border-rose-400 bg-rose-50/50 ring-2 ring-rose-200"
                      : "border-[#E8E3DA] bg-white hover:border-[#D8B4A0]"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      attendanceStatus === "declined"
                        ? "bg-rose-500 text-white"
                        : "bg-[#F8F6F1] text-[#746E66]"
                    }`}
                  >
                    <XCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#26231F]">
                      Regretfully Decline
                    </p>
                    <p className="text-[11px] text-[#746E66]">
                      Will celebrate from afar
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Attendance Details (If attending) */}
            {attendanceStatus === "attending" && (
              <div className="space-y-5 p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8E3DA] animate-in fade-in duration-200">
                {/* Number of Guests */}
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#746E66] mb-1.5">
                    Number of Guests Attending
                  </label>
                  {guest.maximumGuests > 1 ? (
                    <Select
                      options={guestCountOptions}
                      value={String(numberOfGuests)}
                      onChange={(e) => setNumberOfGuests(Number(e.target.value))}
                    />
                  ) : (
                    <div className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E3DA] bg-white text-sm text-[#26231F]">
                      1 Guest (Solo Invitation)
                    </div>
                  )}
                  <p className="text-[11px] text-[#746E66] mt-1">
                    Your invitation allows up to {guest.maximumGuests} attendee
                    {guest.maximumGuests > 1 ? "s" : ""}.
                  </p>
                </div>

                {/* Meal Preference */}
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-[#746E66] flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span>Dietary / Meal Preference</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {["Standard", "Vegetarian", "Vegan", "Halal", "Gluten-Free", "Other"].map(
                      (diet) => (
                        <button
                          key={diet}
                          type="button"
                          onClick={() => setMealPreference(diet)}
                          className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer text-center ${
                            mealPreference === diet
                              ? "bg-[#C9A96E] text-white border-[#C9A96E] shadow-xs"
                              : "bg-white text-[#26231F] border-[#E8E3DA] hover:border-[#D8B4A0]"
                          }`}
                        >
                          {diet}
                        </button>
                      )
                    )}
                  </div>
                  {mealPreference === "Other" && (
                    <input
                      type="text"
                      placeholder="Please specify any allergies or dietary requirements..."
                      value={customMeal}
                      onChange={(e) => setCustomMeal(e.target.value)}
                      maxLength={100}
                      className="w-full mt-2 rounded-xl border border-[#E8E3DA] bg-white px-3.5 py-2 text-xs text-[#26231F] focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 outline-none"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Note / Message */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-[#746E66] flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#C9A96E]" />
                <span>
                  {attendanceStatus === "attending"
                    ? "Wishes for the Couple (Optional)"
                    : "Send Warm Wishes (Optional)"}
                </span>
              </label>
              <Textarea
                placeholder={
                  attendanceStatus === "attending"
                    ? "Leave a note or sweet message for the bride and groom..."
                    : "Send your warm regards or love to the happy couple..."
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                maxLength={1000}
              />
              <p className="text-[11px] text-[#746E66] text-right">
                {message.length}/1000 characters
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 rounded-xl text-white font-medium shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: theme.primaryColor }}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Response...</span>
                </>
              ) : (
                <>
                  <span>{hasPreviousRsvp ? "Update RSVP" : "Submit RSVP"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-[#E8E3DA]/80 text-center">
          <p className="text-[11px] text-[#746E66]/70">
            Personal invitation token:{" "}
            <code className="bg-[#F8F6F1] px-1.5 py-0.5 rounded text-[#26231F]">
              {guest.invitationToken}
            </code>
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />
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
