"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { weddingService } from "@/services/weddingService";
import { Wedding } from "@/types";
import {
  ExternalLink,
  Save,
  RotateCcw,
  Calendar,
  Clock,
  Heart,
  Phone,
  Sparkles,
} from "lucide-react";

export default function WeddingDetailsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    weddingTitle: "",
    brideName: "",
    groomName: "",
    weddingDate: "",
    startTime: "",
    endTime: "",
    dressCode: "",
    contactBride: "",
    contactGroom: "",
    contactCoordinator: "",
  });

  // Original snapshot for reset
  const [initialData, setInitialData] = useState<typeof formData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await weddingService.getWeddingDetails();
        const loaded = {
          weddingTitle: data.weddingTitle || "Our Wedding",
          brideName: data.brideName || "",
          groomName: data.groomName || "",
          weddingDate: data.weddingDate || "",
          startTime: data.startTime || "",
          endTime: data.endTime || "",
          dressCode: data.dressCode || "",
          contactBride: data.contactBride || "",
          contactGroom: data.contactGroom || "",
          contactCoordinator: data.contactCoordinator || "",
        };
        setFormData(loaded);
        setInitialData(loaded);
      } catch (err) {
        console.error("Failed to load wedding details:", err);
        setToast({
          message: "Unable to load wedding details from server.",
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

    if (!formData.weddingTitle.trim()) {
      newErrors.weddingTitle = "Wedding title is required";
    } else if (formData.weddingTitle.length > 120) {
      newErrors.weddingTitle = "Wedding title cannot exceed 120 characters";
    }

    if (formData.brideName.length > 100) {
      newErrors.brideName = "Bride name cannot exceed 100 characters";
    }

    if (formData.groomName.length > 100) {
      newErrors.groomName = "Groom name cannot exceed 100 characters";
    }

    if (formData.dressCode.length > 100) {
      newErrors.dressCode = "Dress code cannot exceed 100 characters";
    }

    if (formData.contactBride.length > 50) {
      newErrors.contactBride = "Contact bride cannot exceed 50 characters";
    }

    if (formData.contactGroom.length > 50) {
      newErrors.contactGroom = "Contact groom cannot exceed 50 characters";
    }

    if (formData.contactCoordinator.length > 50) {
      newErrors.contactCoordinator =
        "Coordinator contact cannot exceed 50 characters";
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
      const result = await weddingService.updateWeddingDetails(formData);
      setInitialData(formData);
      setToast({
        message: result.message || "Wedding details updated successfully.",
        type: "success",
      });
    } catch (err: unknown) {
      console.error("Failed to update wedding details:", err);
      setToast({
        message: "Unable to update wedding details. Please try again.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Wedding Details">
      <div className="space-y-6 sm:space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#26231F] tracking-tight">
              Wedding Details
            </h2>
            <p className="text-sm text-[#746E66] mt-1">
              Manage the core information displayed on your wedding invitation website.
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

        {/* Form Container */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-[#E8E3DA] p-10 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#746E66]">Loading wedding details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Core Titles & Names */}
            <div className="bg-white rounded-2xl border border-[#E8E3DA] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-[#E8E3DA]/80">
                <div className="w-8 h-8 rounded-lg bg-[#F8F6F1] border border-[#E8E3DA] flex items-center justify-center text-[#C9A96E]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-semibold text-[#26231F]">
                    General Information
                  </h3>
                  <p className="text-xs text-[#746E66]">
                    Main website title and primary names
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <Input
                  label="Wedding Title"
                  placeholder="e.g. Amanda & Daniel's Wedding"
                  value={formData.weddingTitle}
                  onChange={(e) => handleChange("weddingTitle", e.target.value)}
                  error={errors.weddingTitle}
                  helperText="Displayed as the primary celebration heading"
                  disabled={saving}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Bride Name"
                  placeholder="e.g. Amanda Silva"
                  value={formData.brideName}
                  onChange={(e) => handleChange("brideName", e.target.value)}
                  error={errors.brideName}
                  disabled={saving}
                  leftIcon={<Heart className="w-4 h-4 text-[#C9A96E]" />}
                />

                <Input
                  label="Groom Name"
                  placeholder="e.g. Daniel Perera"
                  value={formData.groomName}
                  onChange={(e) => handleChange("groomName", e.target.value)}
                  error={errors.groomName}
                  disabled={saving}
                  leftIcon={<Heart className="w-4 h-4 text-[#C9A96E]" />}
                />
              </div>
            </div>

            {/* Section 2: Date, Time & Dress Code */}
            <div className="bg-white rounded-2xl border border-[#E8E3DA] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-[#E8E3DA]/80">
                <div className="w-8 h-8 rounded-lg bg-[#F8F6F1] border border-[#E8E3DA] flex items-center justify-center text-[#C9A96E]">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-semibold text-[#26231F]">
                    Date & Celebration Time
                  </h3>
                  <p className="text-xs text-[#746E66]">
                    Specify the date, ceremony window, and attire guidance
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Input
                  label="Wedding Date"
                  type="date"
                  value={formData.weddingDate}
                  onChange={(e) => handleChange("weddingDate", e.target.value)}
                  error={errors.weddingDate}
                  disabled={saving}
                />

                <Input
                  label="Start Time"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleChange("startTime", e.target.value)}
                  error={errors.startTime}
                  disabled={saving}
                  leftIcon={<Clock className="w-4 h-4 text-[#746E66]" />}
                />

                <Input
                  label="End Time"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleChange("endTime", e.target.value)}
                  error={errors.endTime}
                  disabled={saving}
                  leftIcon={<Clock className="w-4 h-4 text-[#746E66]" />}
                />
              </div>

              <div className="grid grid-cols-1 gap-5">
                <Input
                  label="Dress Code"
                  placeholder="e.g. Black Tie Optional / Traditional Formal"
                  value={formData.dressCode}
                  onChange={(e) => handleChange("dressCode", e.target.value)}
                  error={errors.dressCode}
                  helperText="Optional attire instructions for your guests"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Section 3: Contact & Coordination */}
            <div className="bg-white rounded-2xl border border-[#E8E3DA] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-[#E8E3DA]/80">
                <div className="w-8 h-8 rounded-lg bg-[#F8F6F1] border border-[#E8E3DA] flex items-center justify-center text-[#C9A96E]">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-semibold text-[#26231F]">
                    Key Contacts
                  </h3>
                  <p className="text-xs text-[#746E66]">
                    Telephone numbers for guest queries or urgent coordination
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Input
                  label="Bride Contact"
                  placeholder="+94 77 123 4567"
                  value={formData.contactBride}
                  onChange={(e) => handleChange("contactBride", e.target.value)}
                  error={errors.contactBride}
                  disabled={saving}
                />

                <Input
                  label="Groom Contact"
                  placeholder="+94 71 987 6543"
                  value={formData.contactGroom}
                  onChange={(e) => handleChange("contactGroom", e.target.value)}
                  error={errors.contactGroom}
                  disabled={saving}
                />

                <Input
                  label="Coordinator Contact"
                  placeholder="+94 70 555 4321"
                  value={formData.contactCoordinator}
                  onChange={(e) =>
                    handleChange("contactCoordinator", e.target.value)
                  }
                  error={errors.contactCoordinator}
                  disabled={saving}
                />
              </div>
            </div>

            {/* Action Bar */}
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
        )}
      </div>

      {/* Toast Alert */}
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
