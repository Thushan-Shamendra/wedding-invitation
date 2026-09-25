"use client";

import React, { useEffect, useState } from "react";
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
  Heart,
  Sparkles,
  Eye,
} from "lucide-react";

export default function CoupleDetailsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [formData, setFormData] = useState({
    brideName: "",
    brideDescription: "",
    groomName: "",
    groomDescription: "",
  });

  const [initialData, setInitialData] = useState<typeof formData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await weddingService.getWeddingDetails();
        const loaded = {
          brideName: data.brideName || "",
          brideDescription: data.brideDescription || "",
          groomName: data.groomName || "",
          groomDescription: data.groomDescription || "",
        };
        setFormData(loaded);
        setInitialData(loaded);
      } catch (err) {
        console.error("Failed to load couple details:", err);
        setToast({
          message: "Unable to load couple details from server.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (formData.brideName.length > 100) {
      newErrors.brideName = "Bride name cannot exceed 100 characters";
    }

    if (formData.groomName.length > 100) {
      newErrors.groomName = "Groom name cannot exceed 100 characters";
    }

    if (formData.brideDescription.length > 2000) {
      newErrors.brideDescription =
        "Bride description cannot exceed 2000 characters";
    }

    if (formData.groomDescription.length > 2000) {
      newErrors.groomDescription =
        "Groom description cannot exceed 2000 characters";
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

    setSaving(true);
    setToast(null);

    try {
      // Send ONLY couple fields to avoid erasing other wedding settings
      const result = await weddingService.updateWeddingDetails({
        brideName: formData.brideName,
        brideDescription: formData.brideDescription,
        groomName: formData.groomName,
        groomDescription: formData.groomDescription,
      });

      setInitialData(formData);
      setToast({
        message: result.message || "Couple details updated successfully.",
        type: "success",
      });
    } catch (err) {
      console.error("Failed to update couple details:", err);
      setToast({
        message: "Unable to update couple details. Please try again.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Couple Details">
      <div className="space-y-6 sm:space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#26231F] tracking-tight">
              Couple Details
            </h2>
            <p className="text-sm text-[#746E66] mt-1">
              Manage the bride and groom information shown on the wedding website.
            </p>
          </div>

          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E8E3DA] bg-white hover:bg-[#F8F6F1] text-xs sm:text-sm font-medium text-[#26231F] shadow-xs transition-colors self-start sm:self-auto"
          >
            <ExternalLink className="w-4 h-4 text-[#C9A96E]" />
            <span>Preview Website</span>
          </Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-[#E8E3DA] p-10 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#746E66]">Loading couple details...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
            {/* Form Section (Left 2 cols) */}
            <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
              {/* BRIDE CARD */}
              <div className="bg-white rounded-2xl border border-[#E8E3DA] p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex items-center gap-2.5 pb-4 border-b border-[#E8E3DA]/80">
                  <div className="w-8 h-8 rounded-lg bg-[#F8F6F1] border border-[#E8E3DA] flex items-center justify-center text-[#C9A96E]">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-semibold text-[#26231F]">
                      Bride Information
                    </h3>
                    <p className="text-xs text-[#746E66]">
                      Name and introductory profile for the bride
                    </p>
                  </div>
                </div>

                <Input
                  label="Bride Name"
                  placeholder="e.g. Amanda Silva"
                  value={formData.brideName}
                  onChange={(e) => handleChange("brideName", e.target.value)}
                  error={errors.brideName}
                  disabled={saving}
                  leftIcon={<Heart className="w-4 h-4 text-[#C9A96E]" />}
                />

                <Textarea
                  label="Bride Story / Description"
                  placeholder="A few words about the bride, her passions, or a welcoming message to your guests..."
                  value={formData.brideDescription}
                  onChange={(e) =>
                    handleChange("brideDescription", e.target.value)
                  }
                  error={errors.brideDescription}
                  rows={4}
                  disabled={saving}
                  helperText={`${formData.brideDescription.length}/2000 characters`}
                />
              </div>

              {/* GROOM CARD */}
              <div className="bg-white rounded-2xl border border-[#E8E3DA] p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex items-center gap-2.5 pb-4 border-b border-[#E8E3DA]/80">
                  <div className="w-8 h-8 rounded-lg bg-[#F8F6F1] border border-[#E8E3DA] flex items-center justify-center text-[#C9A96E]">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-semibold text-[#26231F]">
                      Groom Information
                    </h3>
                    <p className="text-xs text-[#746E66]">
                      Name and introductory profile for the groom
                    </p>
                  </div>
                </div>

                <Input
                  label="Groom Name"
                  placeholder="e.g. Daniel Perera"
                  value={formData.groomName}
                  onChange={(e) => handleChange("groomName", e.target.value)}
                  error={errors.groomName}
                  disabled={saving}
                  leftIcon={<Heart className="w-4 h-4 text-[#C9A96E]" />}
                />

                <Textarea
                  label="Groom Story / Description"
                  placeholder="A few words about the groom, his background, or his thoughts on this special journey..."
                  value={formData.groomDescription}
                  onChange={(e) =>
                    handleChange("groomDescription", e.target.value)
                  }
                  error={errors.groomDescription}
                  rows={4}
                  disabled={saving}
                  helperText={`${formData.groomDescription.length}/2000 characters`}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleReset}
                  disabled={saving}
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                >
                  Reset
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={saving}
                  loadingText="Saving..."
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Save Changes
                </Button>
              </div>
            </form>

            {/* LIVE PREVIEW (Right 1 col) */}
            <div className="space-y-4 lg:sticky lg:top-24">
              <div className="flex items-center gap-2 px-1">
                <Eye className="w-4 h-4 text-[#C9A96E]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#746E66]">
                  Live Website Preview
                </span>
              </div>

              <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8E3DA] p-6 sm:p-8 shadow-sm text-center relative overflow-hidden">
                {/* Decorative border embellishment */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent" />

                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-[#E8E3DA] text-[#C9A96E] mb-3 shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>

                <p className="text-[11px] uppercase tracking-widest font-semibold text-[#8C703E] mb-1">
                  The Bride & Groom
                </p>

                {/* Bride Block */}
                <div className="my-6 space-y-2">
                  <h4 className="text-2xl font-serif font-medium text-[#26231F] tracking-tight">
                    {formData.brideName.trim() || "Amanda"}
                  </h4>
                  <span className="inline-block text-[11px] uppercase tracking-wider text-[#746E66] border-b border-[#E8E3DA] pb-1">
                    The Bride
                  </span>
                  <p className="text-xs text-[#746E66] max-w-xs mx-auto leading-relaxed pt-2 line-clamp-4">
                    {formData.brideDescription.trim() ||
                      "Bride description will appear here as you type in the form..."}
                  </p>
                </div>

                {/* Decorative Ampersand */}
                <div className="flex items-center justify-center my-4">
                  <div className="h-[1px] w-12 bg-[#E8E3DA]" />
                  <span className="px-3 text-2xl font-serif italic text-[#C9A96E]">
                    &
                  </span>
                  <div className="h-[1px] w-12 bg-[#E8E3DA]" />
                </div>

                {/* Groom Block */}
                <div className="my-6 space-y-2">
                  <h4 className="text-2xl font-serif font-medium text-[#26231F] tracking-tight">
                    {formData.groomName.trim() || "Daniel"}
                  </h4>
                  <span className="inline-block text-[11px] uppercase tracking-wider text-[#746E66] border-b border-[#E8E3DA] pb-1">
                    The Groom
                  </span>
                  <p className="text-xs text-[#746E66] max-w-xs mx-auto leading-relaxed pt-2 line-clamp-4">
                    {formData.groomDescription.trim() ||
                      "Groom description will appear here as you type in the form..."}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E8E3DA]/80">
                  <p className="text-[11px] text-[#746E66]/70 italic">
                    Updates in real-time as you edit the couple details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

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
