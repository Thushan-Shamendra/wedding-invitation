"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Toast } from "@/components/ui/Toast";
import { weddingService } from "@/services/weddingService";
import {
  ThemeStyle,
  ThemeConfig,
  DEFAULT_THEME,
  HEADING_FONTS,
  BODY_FONTS,
  HEADING_FONT_MAP,
  BODY_FONT_MAP,
  THEME_STYLE_OPTIONS,
  isValidHexColor,
} from "@/utils/theme";
import {
  Palette,
  Type,
  Layout,
  ExternalLink,
  Save,
  RotateCcw,
  Sparkles,
  Check,
  Eye,
  Heart,
  Calendar,
  AlertCircle,
} from "lucide-react";

export default function ThemeAppearancePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDefaultModalOpen, setIsDefaultModalOpen] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Form State
  const [formData, setFormData] = useState<ThemeConfig>({
    ...DEFAULT_THEME,
  });

  const [initialData, setInitialData] = useState<ThemeConfig | null>(null);

  // Wedding details for live preview context
  const [weddingMeta, setWeddingMeta] = useState({
    weddingTitle: "Amanda & Daniel's Wedding",
    brideName: "Amanda",
    groomName: "Daniel",
    weddingDate: "December 18, 2026",
    invitationHeading: "We're Getting Married",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await weddingService.getWeddingDetails();

        const loadedTheme: ThemeConfig = {
          primaryColor: data.primaryColor || DEFAULT_THEME.primaryColor,
          secondaryColor: data.secondaryColor || DEFAULT_THEME.secondaryColor,
          backgroundColor: data.backgroundColor || DEFAULT_THEME.backgroundColor,
          textColor: data.textColor || DEFAULT_THEME.textColor,
          headingFont: data.headingFont || DEFAULT_THEME.headingFont,
          bodyFont: data.bodyFont || DEFAULT_THEME.bodyFont,
          themeStyle: (data.themeStyle as ThemeStyle) || DEFAULT_THEME.themeStyle,
        };

        setFormData(loadedTheme);
        setInitialData(loadedTheme);

        setWeddingMeta({
          weddingTitle: data.weddingTitle || "Our Wedding",
          brideName: data.brideName || "Amanda",
          groomName: data.groomName || "Daniel",
          weddingDate: data.weddingDate || "December 18, 2026",
          invitationHeading: data.invitationHeading || "We're Getting Married",
        });
      } catch (err) {
        console.error("Failed to load theme settings:", err);
        setToast({
          message: "Unable to load theme settings from server.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Track unsaved changes
  const isDirty = useMemo(() => {
    if (!initialData) return false;
    return (
      formData.primaryColor !== initialData.primaryColor ||
      formData.secondaryColor !== initialData.secondaryColor ||
      formData.backgroundColor !== initialData.backgroundColor ||
      formData.textColor !== initialData.textColor ||
      formData.headingFont !== initialData.headingFont ||
      formData.bodyFont !== initialData.bodyFont ||
      formData.themeStyle !== initialData.themeStyle
    );
  }, [formData, initialData]);

  // Validation
  const colorErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (!isValidHexColor(formData.primaryColor)) {
      errors.primaryColor = "Enter a valid hex code (e.g. #C9A96E)";
    }
    if (!isValidHexColor(formData.secondaryColor)) {
      errors.secondaryColor = "Enter a valid hex code (e.g. #D8B4A0)";
    }
    if (!isValidHexColor(formData.backgroundColor)) {
      errors.backgroundColor = "Enter a valid hex code (e.g. #F8F6F1)";
    }
    if (!isValidHexColor(formData.textColor)) {
      errors.textColor = "Enter a valid hex code (e.g. #26231F)";
    }
    return errors;
  }, [
    formData.primaryColor,
    formData.secondaryColor,
    formData.backgroundColor,
    formData.textColor,
  ]);

  const hasErrors = Object.keys(colorErrors).length > 0;

  const handleColorChange = (
    field: "primaryColor" | "secondaryColor" | "backgroundColor" | "textColor",
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    if (initialData) {
      setFormData(initialData);
    }
  };

  const handleRestoreDefaults = () => {
    setFormData({ ...DEFAULT_THEME });
    setIsDefaultModalOpen(false);
    setToast({
      message: "Theme reset to default values. Click 'Save Theme' to persist changes.",
      type: "success",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasErrors) return;

    try {
      setSaving(true);

      const payload = {
        primaryColor: formData.primaryColor.trim(),
        secondaryColor: formData.secondaryColor.trim(),
        backgroundColor: formData.backgroundColor.trim(),
        textColor: formData.textColor.trim(),
        headingFont: formData.headingFont.trim(),
        bodyFont: formData.bodyFont.trim(),
        themeStyle: formData.themeStyle,
      };

      await weddingService.updateWeddingDetails(payload);

      setInitialData(payload);
      setToast({
        message: "Theme updated successfully.",
        type: "success",
      });
    } catch (err) {
      console.error("Failed to update theme:", err);
      setToast({
        message: "Unable to update theme settings. Please try again.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Preview Font Styles
  const previewHeadingFontFamily =
    HEADING_FONT_MAP[formData.headingFont] || "Georgia, serif";
  const previewBodyFontFamily =
    BODY_FONT_MAP[formData.bodyFont] || "sans-serif";

  // Couple names for preview
  const coupleDisplay = useMemo(() => {
    const b = weddingMeta.brideName.trim() || "Amanda";
    const g = weddingMeta.groomName.trim() || "Daniel";
    return `${b} & ${g}`;
  }, [weddingMeta.brideName, weddingMeta.groomName]);

  if (loading) {
    return (
      <AdminLayout title="Theme & Appearance">
        <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-9 h-9 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-[#746E66]">
            Loading Theme Settings...
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Theme & Appearance">
      <div className="space-y-6">
        {/* Top Header & Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E3DA]/80">
          <div>
            <h2 className="text-2xl font-serif font-semibold text-[#26231F] tracking-tight">
              Theme & Appearance
            </h2>
            <p className="text-xs sm:text-sm text-[#746E66] mt-0.5">
              Customize the colors, typography, and overall style of your wedding invitation website.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isDirty && (
              <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full animate-in fade-in">
                Unsaved changes
              </span>
            )}

            <button
              type="button"
              onClick={() => setIsDefaultModalOpen(true)}
              className="px-3 py-2 rounded-xl border border-[#E8E3DA] bg-white hover:bg-[#F8F6F1] text-xs font-medium text-[#746E66] hover:text-[#26231F] transition-colors cursor-pointer"
            >
              Restore Defaults
            </button>

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

        {/* 2-Column Responsive Layout: Settings on Left (7 cols), Live Preview on Right (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Theme Settings Form */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 1. COLOR SETTINGS CARD */}
              <div className="bg-white rounded-3xl border border-[#E8E3DA] p-6 sm:p-7 shadow-sm space-y-5">
                <div className="flex items-center gap-2.5 pb-4 border-b border-[#E8E3DA]/80">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#E8E3DA] flex items-center justify-center text-[#C9A96E]">
                    <Palette className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-semibold text-[#26231F]">
                      Wedding Colors
                    </h3>
                    <p className="text-xs text-[#746E66]">
                      Define the visual palette used across headers, accents, buttons, and surfaces
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Primary Color */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wider text-[#746E66] flex items-center justify-between">
                      <span>Primary Accent</span>
                      <span className="text-[10px] text-[#746E66]/60">Buttons & Highlights</span>
                    </label>
                    <div className="flex items-center gap-2.5 p-2 rounded-xl border border-[#E8E3DA] bg-white hover:border-[#D8B4A0] transition-colors">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                        className="w-9 h-9 rounded-lg border border-[#E8E3DA] cursor-pointer bg-transparent p-0.5"
                      />
                      <input
                        type="text"
                        value={formData.primaryColor}
                        maxLength={7}
                        onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                        className="flex-1 text-xs font-mono text-[#26231F] uppercase outline-none bg-transparent"
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: formData.primaryColor }}
                      />
                    </div>
                    {colorErrors.primaryColor && (
                      <p className="text-[11px] text-red-500 font-medium">
                        {colorErrors.primaryColor}
                      </p>
                    )}
                  </div>

                  {/* Secondary Color */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wider text-[#746E66] flex items-center justify-between">
                      <span>Secondary Accent</span>
                      <span className="text-[10px] text-[#746E66]/60">Borders & Accents</span>
                    </label>
                    <div className="flex items-center gap-2.5 p-2 rounded-xl border border-[#E8E3DA] bg-white hover:border-[#D8B4A0] transition-colors">
                      <input
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) => handleColorChange("secondaryColor", e.target.value)}
                        className="w-9 h-9 rounded-lg border border-[#E8E3DA] cursor-pointer bg-transparent p-0.5"
                      />
                      <input
                        type="text"
                        value={formData.secondaryColor}
                        maxLength={7}
                        onChange={(e) => handleColorChange("secondaryColor", e.target.value)}
                        className="flex-1 text-xs font-mono text-[#26231F] uppercase outline-none bg-transparent"
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: formData.secondaryColor }}
                      />
                    </div>
                    {colorErrors.secondaryColor && (
                      <p className="text-[11px] text-red-500 font-medium">
                        {colorErrors.secondaryColor}
                      </p>
                    )}
                  </div>

                  {/* Background Color */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wider text-[#746E66] flex items-center justify-between">
                      <span>Page Background</span>
                      <span className="text-[10px] text-[#746E66]/60">Main Page Canvas</span>
                    </label>
                    <div className="flex items-center gap-2.5 p-2 rounded-xl border border-[#E8E3DA] bg-white hover:border-[#D8B4A0] transition-colors">
                      <input
                        type="color"
                        value={formData.backgroundColor}
                        onChange={(e) => handleColorChange("backgroundColor", e.target.value)}
                        className="w-9 h-9 rounded-lg border border-[#E8E3DA] cursor-pointer bg-transparent p-0.5"
                      />
                      <input
                        type="text"
                        value={formData.backgroundColor}
                        maxLength={7}
                        onChange={(e) => handleColorChange("backgroundColor", e.target.value)}
                        className="flex-1 text-xs font-mono text-[#26231F] uppercase outline-none bg-transparent"
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: formData.backgroundColor }}
                      />
                    </div>
                    {colorErrors.backgroundColor && (
                      <p className="text-[11px] text-red-500 font-medium">
                        {colorErrors.backgroundColor}
                      </p>
                    )}
                  </div>

                  {/* Text Color */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wider text-[#746E66] flex items-center justify-between">
                      <span>Text Color</span>
                      <span className="text-[10px] text-[#746E66]/60">Body & Headings</span>
                    </label>
                    <div className="flex items-center gap-2.5 p-2 rounded-xl border border-[#E8E3DA] bg-white hover:border-[#D8B4A0] transition-colors">
                      <input
                        type="color"
                        value={formData.textColor}
                        onChange={(e) => handleColorChange("textColor", e.target.value)}
                        className="w-9 h-9 rounded-lg border border-[#E8E3DA] cursor-pointer bg-transparent p-0.5"
                      />
                      <input
                        type="text"
                        value={formData.textColor}
                        maxLength={7}
                        onChange={(e) => handleColorChange("textColor", e.target.value)}
                        className="flex-1 text-xs font-mono text-[#26231F] uppercase outline-none bg-transparent"
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: formData.textColor }}
                      />
                    </div>
                    {colorErrors.textColor && (
                      <p className="text-[11px] text-red-500 font-medium">
                        {colorErrors.textColor}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. TYPOGRAPHY SETTINGS CARD */}
              <div className="bg-white rounded-3xl border border-[#E8E3DA] p-6 sm:p-7 shadow-sm space-y-5">
                <div className="flex items-center gap-2.5 pb-4 border-b border-[#E8E3DA]/80">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#E8E3DA] flex items-center justify-center text-[#C9A96E]">
                    <Type className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-semibold text-[#26231F]">
                      Typography
                    </h3>
                    <p className="text-xs text-[#746E66]">
                      Choose paired Google fonts for headings and body content
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Heading Font */}
                  <div>
                    <Select
                      label="Heading Font"
                      options={HEADING_FONTS.map((font) => ({
                        label: font,
                        value: font,
                      }))}
                      value={formData.headingFont}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          headingFont: e.target.value,
                        }))
                      }
                    />
                    <div
                      className="mt-2 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E3DA] text-center"
                      style={{
                        fontFamily:
                          HEADING_FONT_MAP[formData.headingFont] || "Georgia, serif",
                      }}
                    >
                      <span className="text-base font-medium text-[#26231F]">
                        {formData.headingFont}
                      </span>
                    </div>
                  </div>

                  {/* Body Font */}
                  <div>
                    <Select
                      label="Body Font"
                      options={BODY_FONTS.map((font) => ({
                        label: font,
                        value: font,
                      }))}
                      value={formData.bodyFont}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          bodyFont: e.target.value,
                        }))
                      }
                    />
                    <div
                      className="mt-2 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E3DA] text-center"
                      style={{
                        fontFamily:
                          BODY_FONT_MAP[formData.bodyFont] || "sans-serif",
                      }}
                    >
                      <span className="text-xs text-[#746E66]">
                        {formData.bodyFont} – The quick brown fox jumps over the lazy dog.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. WEDDING STYLE CARD */}
              <div className="bg-white rounded-3xl border border-[#E8E3DA] p-6 sm:p-7 shadow-sm space-y-5">
                <div className="flex items-center gap-2.5 pb-4 border-b border-[#E8E3DA]/80">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#E8E3DA] flex items-center justify-center text-[#C9A96E]">
                    <Layout className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-semibold text-[#26231F]">
                      Invitation Style
                    </h3>
                    <p className="text-xs text-[#746E66]">
                      Choose an aesthetic theme archetype for borders, card layouts, and framing
                    </p>
                  </div>
                </div>

                <div
                  role="radiogroup"
                  aria-label="Invitation style options"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  {THEME_STYLE_OPTIONS.map((style) => {
                    const isSelected = formData.themeStyle === style.id;
                    return (
                      <div
                        key={style.id}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, themeStyle: style.id }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setFormData((prev) => ({ ...prev, themeStyle: style.id }));
                          }
                        }}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 select-none relative ${
                          isSelected
                            ? "border-[#C9A96E] bg-[#FAF8F5] ring-2 ring-[#C9A96E]/20 shadow-xs"
                            : "border-[#E8E3DA] bg-white hover:border-[#D8B4A0] hover:bg-[#FAF8F5]/30"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-sm font-semibold text-[#26231F] block">
                              {style.name}
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C703E] block mt-0.5">
                              {style.badge}
                            </span>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? "bg-[#C9A96E] border-[#C9A96E] text-white"
                                : "border-[#E8E3DA] bg-white"
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>

                        <p className="text-xs text-[#746E66] mt-2 leading-relaxed">
                          {style.description}
                        </p>

                        {/* Mini Visual Preview Cue */}
                        <div className="mt-3 pt-3 border-t border-[#E8E3DA]/60 flex items-center gap-1.5">
                          {style.id === "classic" && (
                            <span className="text-[10px] italic text-[#746E66] font-serif">
                              ❖ Symmetrical Borders & Classical Crest
                            </span>
                          )}
                          {style.id === "modern" && (
                            <span className="text-[10px] text-[#746E66] font-sans">
                              ■ Clean Minimalist Lines & Contemporary Contrast
                            </span>
                          )}
                          {style.id === "minimal" && (
                            <span className="text-[10px] text-[#746E66] font-mono">
                              — Spacious Airiness & Understated Framing
                            </span>
                          )}
                          {style.id === "luxury" && (
                            <span className="text-[10px] text-[#C9A96E] font-serif font-medium">
                              ✦ Champagne Gold Accents & Gilded Elegance
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-between pt-2">
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
                  disabled={saving || !isDirty || hasErrors}
                  isLoading={saving}
                  loadingText="Saving..."
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Save Theme
                </Button>
              </div>
            </form>
          </div>

          {/* RIGHT: Live Preview (5 cols, sticky) */}
          <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#C9A96E]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#746E66]">
                  Live Invitation Preview
                </span>
              </div>
              <span className="text-[11px] font-medium text-[#8C703E] bg-[#FAF8F5] border border-[#E8E3DA] px-2.5 py-0.5 rounded-full capitalize">
                Style: {formData.themeStyle}
              </span>
            </div>

            {/* Dynamic Live Preview Canvas */}
            <div
              className="p-6 sm:p-8 rounded-3xl transition-all duration-300 shadow-sm border"
              style={{
                backgroundColor: formData.backgroundColor,
                borderColor: formData.secondaryColor,
                color: formData.textColor,
                fontFamily: previewBodyFontFamily,
              }}
            >
              {/* Dynamic Styled Invitation Card */}
              <div
                className={`p-6 sm:p-8 rounded-2xl relative overflow-hidden text-center transition-all duration-200 ${
                  formData.themeStyle === "luxury"
                    ? "bg-white shadow-md border"
                    : formData.themeStyle === "classic"
                    ? "bg-white shadow-sm border-2 border-double"
                    : formData.themeStyle === "modern"
                    ? "bg-white shadow-sm border rounded-xl"
                    : "bg-white/80 shadow-none border"
                }`}
                style={{
                  borderColor:
                    formData.themeStyle === "luxury"
                      ? formData.secondaryColor
                      : formData.secondaryColor,
                }}
              >
                {/* Luxury Style Top Gradient Accent */}
                {formData.themeStyle === "luxury" && (
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{
                      background: `linear-gradient(to right, transparent, ${formData.primaryColor}, transparent)`,
                    }}
                  />
                )}

                {/* Classic Corner Accents */}
                {formData.themeStyle === "classic" && (
                  <div className="text-[10px] tracking-widest text-[#746E66] uppercase mb-1">
                    ❖ ❖ ❖
                  </div>
                )}

                {/* Monogram Icon */}
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 shadow-xs"
                  style={{
                    backgroundColor: `${formData.primaryColor}15`,
                    color: formData.primaryColor,
                    borderColor: formData.secondaryColor,
                    borderWidth: 1,
                  }}
                >
                  <Sparkles className="w-5 h-5" />
                </div>

                {/* Heading */}
                <span
                  className="text-[11px] uppercase tracking-widest font-semibold block mb-2"
                  style={{ color: formData.primaryColor }}
                >
                  {weddingMeta.invitationHeading}
                </span>

                {/* Couple Names */}
                <h4
                  className="text-2xl sm:text-3xl font-medium tracking-tight mb-2"
                  style={{
                    fontFamily: previewHeadingFontFamily,
                    color: formData.textColor,
                  }}
                >
                  {coupleDisplay}
                </h4>

                {/* Date */}
                <div
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full mb-5"
                  style={{
                    backgroundColor: `${formData.secondaryColor}25`,
                    color: formData.textColor,
                  }}
                >
                  <Calendar className="w-3.5 h-3.5" style={{ color: formData.primaryColor }} />
                  <span>{weddingMeta.weddingDate}</span>
                </div>

                {/* Invitation Sample Text */}
                <p
                  className="text-xs sm:text-sm leading-relaxed max-w-sm mx-auto mb-6 opacity-85"
                  style={{
                    fontFamily:
                      formData.themeStyle === "classic" || formData.themeStyle === "luxury"
                        ? previewHeadingFontFamily
                        : previewBodyFontFamily,
                    fontStyle:
                      formData.themeStyle === "classic" || formData.themeStyle === "luxury"
                        ? "italic"
                        : "normal",
                  }}
                >
                  "We would be delighted to have you celebrate our special day with us."
                </p>

                {/* Decorative Divider */}
                <div className="flex items-center justify-center my-4">
                  <div
                    className="h-[1px] w-12"
                    style={{ backgroundColor: formData.secondaryColor }}
                  />
                  <Heart
                    className="w-3.5 h-3.5 mx-3"
                    style={{ color: formData.primaryColor }}
                  />
                  <div
                    className="h-[1px] w-12"
                    style={{ backgroundColor: formData.secondaryColor }}
                  />
                </div>

                {/* RSVP Call-To-Action Preview Button */}
                <div className="pt-2">
                  <div
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-xs font-semibold text-white shadow-xs cursor-default select-none"
                    style={{ backgroundColor: formData.primaryColor }}
                  >
                    Confirm RSVP
                  </div>
                </div>

                {/* Footer Signature */}
                <p
                  className="text-[11px] mt-4 opacity-70"
                  style={{ fontFamily: previewHeadingFontFamily }}
                >
                  With Love, {coupleDisplay}
                </p>
              </div>
            </div>

            {/* Live Palette Reference Strip */}
            <div className="bg-white rounded-2xl border border-[#E8E3DA] p-4 text-xs space-y-2">
              <span className="font-semibold text-[#26231F] block text-xs">
                Active Theme Summary:
              </span>
              <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                <div className="space-y-1">
                  <div
                    className="h-6 rounded-md border border-black/10"
                    style={{ backgroundColor: formData.primaryColor }}
                  />
                  <span className="font-mono text-[#746E66]">{formData.primaryColor}</span>
                </div>
                <div className="space-y-1">
                  <div
                    className="h-6 rounded-md border border-black/10"
                    style={{ backgroundColor: formData.secondaryColor }}
                  />
                  <span className="font-mono text-[#746E66]">{formData.secondaryColor}</span>
                </div>
                <div className="space-y-1">
                  <div
                    className="h-6 rounded-md border border-black/10"
                    style={{ backgroundColor: formData.backgroundColor }}
                  />
                  <span className="font-mono text-[#746E66]">{formData.backgroundColor}</span>
                </div>
                <div className="space-y-1">
                  <div
                    className="h-6 rounded-md border border-black/10"
                    style={{ backgroundColor: formData.textColor }}
                  />
                  <span className="font-mono text-[#746E66]">{formData.textColor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RESTORE DEFAULTS CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={isDefaultModalOpen}
        onClose={() => setIsDefaultModalOpen(false)}
        onConfirm={handleRestoreDefaults}
        title="Restore Default Theme"
        message="Are you sure you want to reset all theme colors, fonts, and styles back to the original luxury champagne defaults?"
        confirmText="Reset to Defaults"
        cancelText="Keep Current"
        danger={false}
      />

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
