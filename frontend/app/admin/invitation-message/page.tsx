"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { weddingService } from "@/services/weddingService";
import {
  ExternalLink,
  Save,
  RotateCcw,
  Sparkles,
  Eye,
  Heart,
  Calendar,
  MessageSquare,
  Users,
} from "lucide-react";

export default function InvitationMessagePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    invitationHeading: "",
    personalGuestGreeting: "",
    invitationMessage: "",
    footerMessage: "",
  });

  const [initialData, setInitialData] = useState<typeof formData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Wedding details for live preview context
  const [weddingMeta, setWeddingMeta] = useState({
    brideName: "",
    groomName: "",
    weddingDate: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await weddingService.getWeddingDetails();

        const loaded = {
          invitationHeading: data.invitationHeading || "",
          personalGuestGreeting: data.personalGuestGreeting || "Dear {{guestName}},",
          invitationMessage: data.invitationMessage || "",
          footerMessage: data.footerMessage || "",
        };

        setFormData(loaded);
        setInitialData(loaded);

        setWeddingMeta({
          brideName: data.brideName || "Amanda",
          groomName: data.groomName || "Daniel",
          weddingDate: data.weddingDate || "December 18, 2026",
        });
      } catch (err) {
        console.error("Failed to load invitation message:", err);
        setToast({
          message: "Unable to load invitation message from server.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Determine if form has unsaved changes
  const isDirty = useMemo(() => {
    if (!initialData) return false;
    return (
      formData.invitationHeading !== initialData.invitationHeading ||
      formData.personalGuestGreeting !== initialData.personalGuestGreeting ||
      formData.invitationMessage !== initialData.invitationMessage ||
      formData.footerMessage !== initialData.footerMessage
    );
  }, [formData, initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (formData.invitationHeading.length > 150) {
      newErrors.invitationHeading = "Invitation heading cannot exceed 150 characters.";
    }

    if (formData.personalGuestGreeting.length > 200) {
      newErrors.personalGuestGreeting = "Personal guest greeting cannot exceed 200 characters.";
    }

    if (formData.invitationMessage.length > 3000) {
      newErrors.invitationMessage = "Invitation message cannot exceed 3000 characters.";
    }

    if (formData.footerMessage.length > 500) {
      newErrors.footerMessage = "Footer message cannot exceed 500 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleReset = () => {
    if (initialData) {
      setFormData(initialData);
      setErrors({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSaving(true);

      // Send ONLY the invitation fields to avoid overwriting other configuration
      const payload = {
        invitationHeading: formData.invitationHeading.trim(),
        personalGuestGreeting: formData.personalGuestGreeting.trim(),
        invitationMessage: formData.invitationMessage.trim(),
        footerMessage: formData.footerMessage.trim(),
      };

      await weddingService.updateWeddingDetails(payload);

      setInitialData({
        invitationHeading: payload.invitationHeading,
        personalGuestGreeting: payload.personalGuestGreeting,
        invitationMessage: payload.invitationMessage,
        footerMessage: payload.footerMessage,
      });

      setToast({
        message: "Invitation message updated successfully.",
        type: "success",
      });
    } catch (err) {
      console.error("Failed to update invitation message:", err);
      setToast({
        message: "Unable to update invitation message. Please try again.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Preview formatted greeting with sample guest name
  const previewGreeting = useMemo(() => {
    const template = formData.personalGuestGreeting.trim() || "Dear {{guestName}},";
    return template.replace(/\{\{\s*guestName\s*\}\}/g, "Kasun Perera");
  }, [formData.personalGuestGreeting]);

  // Couple names for preview
  const coupleDisplay = useMemo(() => {
    const b = weddingMeta.brideName.trim() || "Amanda";
    const g = weddingMeta.groomName.trim() || "Daniel";
    return `${b} & ${g}`;
  }, [weddingMeta.brideName, weddingMeta.groomName]);

  if (loading) {
    return (
      <AdminLayout title="Invitation Message">
        <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-9 h-9 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-[#746E66]">
            Loading Invitation Message...
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Invitation Message">
      <div className="space-y-6">
        {/* Header / Subtitle & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E3DA]/80">
          <div>
            <h2 className="text-2xl font-serif font-semibold text-[#26231F] tracking-tight">
              Invitation Message
            </h2>
            <p className="text-xs sm:text-sm text-[#746E66] mt-0.5">
              Customize the message guests will see on your wedding invitation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isDirty && (
              <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full animate-in fade-in">
                Unsaved changes
              </span>
            )}

            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E8E3DA] bg-white hover:bg-[#F8F6F1] text-xs font-medium text-[#26231F] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#C9A96E]" />
              <span>Preview Website</span>
            </Link>
          </div>
        </div>

        {/* 2-Column Responsive Layout: Form on Left, Live Preview on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Editing Form (7 Cols) */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl border border-[#E8E3DA] p-6 sm:p-8 shadow-sm space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#E8E3DA]/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#E8E3DA] flex items-center justify-center text-[#C9A96E]">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-semibold text-[#26231F]">
                      Invitation Wording
                    </h3>
                    <p className="text-xs text-[#746E66]">
                      Set custom headings, greetings, and heartfelt messages
                    </p>
                  </div>
                </div>
              </div>

              {/* 1. Invitation Heading */}
              <div>
                <Input
                  label="Invitation Heading"
                  placeholder="e.g. We're Getting Married"
                  value={formData.invitationHeading}
                  error={errors.invitationHeading}
                  maxLength={150}
                  onChange={(e) => handleChange("invitationHeading", e.target.value)}
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[11px] text-[#746E66]/80">
                    Displays at the top of your invitation card.
                  </span>
                  <span className="text-[11px] text-[#746E66]">
                    {formData.invitationHeading.length}/150
                  </span>
                </div>
              </div>

              {/* 2. Personal Guest Greeting */}
              <div>
                <Input
                  label="Personal Guest Greeting"
                  placeholder="Dear {{guestName}},"
                  value={formData.personalGuestGreeting}
                  error={errors.personalGuestGreeting}
                  maxLength={200}
                  onChange={(e) => handleChange("personalGuestGreeting", e.target.value)}
                />
                <div className="flex justify-between items-start mt-1 gap-2">
                  <p className="text-[11px] text-[#8C703E] flex items-center gap-1 font-medium">
                    <Users className="w-3 h-3 text-[#C9A96E] shrink-0" />
                    <span>Use {"{{guestName}}"} to automatically insert each guest's name.</span>
                  </p>
                  <span className="text-[11px] text-[#746E66] shrink-0">
                    {formData.personalGuestGreeting.length}/200
                  </span>
                </div>
              </div>

              {/* 3. Invitation Message */}
              <div>
                <Textarea
                  label="Invitation Message"
                  placeholder="We would be delighted to have you celebrate our special day with us."
                  value={formData.invitationMessage}
                  error={errors.invitationMessage}
                  maxLength={3000}
                  rows={6}
                  onChange={(e) => handleChange("invitationMessage", e.target.value)}
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[11px] text-[#746E66]/80">
                    The formal body message inviting guests to the wedding ceremony & celebration.
                  </span>
                  <span className="text-[11px] text-[#746E66]">
                    {formData.invitationMessage.length} / 3000 characters
                  </span>
                </div>
              </div>

              {/* 4. Footer Message */}
              <div>
                <Input
                  label="Footer Message / Closing"
                  placeholder="With Love, Amanda & Daniel"
                  value={formData.footerMessage}
                  error={errors.footerMessage}
                  maxLength={500}
                  onChange={(e) => handleChange("footerMessage", e.target.value)}
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[11px] text-[#746E66]/80">
                    Closing signature or affectionate sign-off.
                  </span>
                  <span className="text-[11px] text-[#746E66]">
                    {formData.footerMessage.length} / 500 characters
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-[#E8E3DA]/80">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={handleReset}
                  disabled={saving || !isDirty}
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                >
                  Reset
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={saving || !isDirty}
                  isLoading={saving}
                  loadingText="Saving..."
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Save Message
                </Button>
              </div>
            </form>
          </div>

          {/* RIGHT: Live Preview Card (5 Cols, Sticky) */}
          <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#C9A96E]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#746E66]">
                  Live Invitation Preview
                </span>
              </div>
              <span className="text-[11px] font-medium text-[#8C703E] bg-[#FAF8F5] border border-[#E8E3DA] px-2 py-0.5 rounded-full">
                Sample: Kasun Perera
              </span>
            </div>

            {/* Invitation Card Mockup */}
            <div className="bg-white rounded-3xl border border-[#E8E3DA] p-8 sm:p-10 shadow-sm relative overflow-hidden text-center space-y-6 transition-all duration-200">
              {/* Top Gold Border Accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent" />

              {/* Sparkle Monogram */}
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#E8E3DA] text-[#C9A96E] shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>

              {/* Heading */}
              <div>
                <span className="text-[11px] uppercase tracking-widest font-semibold text-[#8C703E] block">
                  {formData.invitationHeading.trim() || "We're Getting Married"}
                </span>

                {/* Personalized Greeting */}
                <h4 className="text-2xl sm:text-3xl font-serif font-medium text-[#26231F] tracking-tight mt-2">
                  {previewGreeting}
                </h4>
              </div>

              {/* Main Invitation Message */}
              <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E3DA] p-5 text-sm text-[#746E66] leading-relaxed text-left font-serif italic whitespace-pre-line">
                {formData.invitationMessage.trim() ||
                  "We would be delighted to have you celebrate our special day with us."}
              </div>

              {/* Couple Names & Date */}
              <div className="space-y-1">
                <p className="text-lg font-serif font-semibold text-[#26231F]">
                  {coupleDisplay}
                </p>
                {weddingMeta.weddingDate && (
                  <p className="text-xs text-[#8C703E] font-medium flex items-center justify-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span>{weddingMeta.weddingDate}</span>
                  </p>
                )}
              </div>

              {/* Decorative Divider */}
              <div className="flex items-center justify-center my-2">
                <div className="h-[1px] w-12 bg-[#E8E3DA]" />
                <Heart className="w-3.5 h-3.5 text-[#C9A96E] mx-3" />
                <div className="h-[1px] w-12 bg-[#E8E3DA]" />
              </div>

              {/* Footer Message */}
              {formData.footerMessage.trim() ? (
                <p className="text-xs sm:text-sm font-medium text-[#746E66] font-serif">
                  {formData.footerMessage.trim()}
                </p>
              ) : (
                <p className="text-xs sm:text-sm font-medium text-[#746E66] font-serif">
                  With Love, {coupleDisplay}
                </p>
              )}
            </div>

            {/* Helper Card */}
            <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E3DA] p-4 text-xs text-[#746E66] space-y-1.5">
              <span className="font-semibold text-[#26231F] block">
                Personalized Preview Note:
              </span>
              <p>
                Guests will see their actual name in place of <code className="bg-white px-1 py-0.5 rounded border border-[#E8E3DA] text-[#8C703E]">{"{{guestName}}"}</code> when they open their personalized invitation link.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AdminLayout>
  );
}
