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
  MapPin,
  Calendar,
  Clock,
  Navigation,
  Globe,
  Eye,
  Sparkles,
} from "lucide-react";

interface VenueFormData {
  ceremonyVenueName: string;
  ceremonyAddress: string;
  ceremonyDate: string;
  ceremonyTime: string;
  ceremonyGoogleMapsUrl: string;
  ceremonyLatitude: string;
  ceremonyLongitude: string;
  ceremonyDescription: string;

  receptionVenueName: string;
  receptionAddress: string;
  receptionDate: string;
  receptionTime: string;
  receptionGoogleMapsUrl: string;
  receptionLatitude: string;
  receptionLongitude: string;
  receptionDescription: string;
}

export default function VenueManagementPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<"ceremony" | "reception">("ceremony");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [formData, setFormData] = useState<VenueFormData>({
    ceremonyVenueName: "",
    ceremonyAddress: "",
    ceremonyDate: "",
    ceremonyTime: "",
    ceremonyGoogleMapsUrl: "",
    ceremonyLatitude: "",
    ceremonyLongitude: "",
    ceremonyDescription: "",

    receptionVenueName: "",
    receptionAddress: "",
    receptionDate: "",
    receptionTime: "",
    receptionGoogleMapsUrl: "",
    receptionLatitude: "",
    receptionLongitude: "",
    receptionDescription: "",
  });

  const [initialData, setInitialData] = useState<VenueFormData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await weddingService.getWeddingDetails();
        const loaded: VenueFormData = {
          ceremonyVenueName: data.ceremonyVenueName || "",
          ceremonyAddress: data.ceremonyAddress || "",
          ceremonyDate: data.ceremonyDate || "",
          ceremonyTime: data.ceremonyTime || "",
          ceremonyGoogleMapsUrl: data.ceremonyGoogleMapsUrl || "",
          ceremonyLatitude:
            data.ceremonyLatitude !== null && data.ceremonyLatitude !== undefined
              ? String(data.ceremonyLatitude)
              : "",
          ceremonyLongitude:
            data.ceremonyLongitude !== null && data.ceremonyLongitude !== undefined
              ? String(data.ceremonyLongitude)
              : "",
          ceremonyDescription: data.ceremonyDescription || "",

          receptionVenueName: data.receptionVenueName || "",
          receptionAddress: data.receptionAddress || "",
          receptionDate: data.receptionDate || "",
          receptionTime: data.receptionTime || "",
          receptionGoogleMapsUrl: data.receptionGoogleMapsUrl || "",
          receptionLatitude:
            data.receptionLatitude !== null && data.receptionLatitude !== undefined
              ? String(data.receptionLatitude)
              : "",
          receptionLongitude:
            data.receptionLongitude !== null && data.receptionLongitude !== undefined
              ? String(data.receptionLongitude)
              : "",
          receptionDescription: data.receptionDescription || "",
        };
        setFormData(loaded);
        setInitialData(loaded);
      } catch (err) {
        console.error("Failed to load venue details:", err);
        setToast({
          message: "Unable to load venue details from server.",
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

    // Ceremony Validations
    if (formData.ceremonyVenueName.length > 150) {
      newErrors.ceremonyVenueName = "Venue name cannot exceed 150 characters";
    }
    if (formData.ceremonyAddress.length > 300) {
      newErrors.ceremonyAddress = "Address cannot exceed 300 characters";
    }
    if (formData.ceremonyDescription.length > 2000) {
      newErrors.ceremonyDescription = "Description cannot exceed 2000 characters";
    }

    if (formData.ceremonyLatitude.trim()) {
      const lat = Number(formData.ceremonyLatitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        newErrors.ceremonyLatitude = "Latitude must be a number between -90 and 90";
      }
    }

    if (formData.ceremonyLongitude.trim()) {
      const lng = Number(formData.ceremonyLongitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        newErrors.ceremonyLongitude = "Longitude must be a number between -180 and 180";
      }
    }

    if (formData.ceremonyGoogleMapsUrl.trim()) {
      try {
        const url = new URL(formData.ceremonyGoogleMapsUrl.trim());
        if (!url.protocol.startsWith("http")) {
          newErrors.ceremonyGoogleMapsUrl = "Must be a valid web link (http/https)";
        }
      } catch {
        newErrors.ceremonyGoogleMapsUrl = "Please enter a valid URL";
      }
    }

    // Reception Validations
    if (formData.receptionVenueName.length > 150) {
      newErrors.receptionVenueName = "Venue name cannot exceed 150 characters";
    }
    if (formData.receptionAddress.length > 300) {
      newErrors.receptionAddress = "Address cannot exceed 300 characters";
    }
    if (formData.receptionDescription.length > 2000) {
      newErrors.receptionDescription = "Description cannot exceed 2000 characters";
    }

    if (formData.receptionLatitude.trim()) {
      const lat = Number(formData.receptionLatitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        newErrors.receptionLatitude = "Latitude must be a number between -90 and 90";
      }
    }

    if (formData.receptionLongitude.trim()) {
      const lng = Number(formData.receptionLongitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        newErrors.receptionLongitude = "Longitude must be a number between -180 and 180";
      }
    }

    if (formData.receptionGoogleMapsUrl.trim()) {
      try {
        const url = new URL(formData.receptionGoogleMapsUrl.trim());
        if (!url.protocol.startsWith("http")) {
          newErrors.receptionGoogleMapsUrl = "Must be a valid web link (http/https)";
        }
      } catch {
        newErrors.receptionGoogleMapsUrl = "Please enter a valid URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof VenueFormData, value: string) => {
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
      // Send ONLY venue fields to MongoDB
      const payload = {
        ceremonyVenueName: formData.ceremonyVenueName.trim(),
        ceremonyAddress: formData.ceremonyAddress.trim(),
        ceremonyDate: formData.ceremonyDate,
        ceremonyTime: formData.ceremonyTime,
        ceremonyGoogleMapsUrl: formData.ceremonyGoogleMapsUrl.trim(),
        ceremonyLatitude: formData.ceremonyLatitude.trim()
          ? Number(formData.ceremonyLatitude)
          : null,
        ceremonyLongitude: formData.ceremonyLongitude.trim()
          ? Number(formData.ceremonyLongitude)
          : null,
        ceremonyDescription: formData.ceremonyDescription.trim(),

        receptionVenueName: formData.receptionVenueName.trim(),
        receptionAddress: formData.receptionAddress.trim(),
        receptionDate: formData.receptionDate,
        receptionTime: formData.receptionTime,
        receptionGoogleMapsUrl: formData.receptionGoogleMapsUrl.trim(),
        receptionLatitude: formData.receptionLatitude.trim()
          ? Number(formData.receptionLatitude)
          : null,
        receptionLongitude: formData.receptionLongitude.trim()
          ? Number(formData.receptionLongitude)
          : null,
        receptionDescription: formData.receptionDescription.trim(),
      };

      const result = await weddingService.updateWeddingDetails(payload);
      setInitialData(formData);
      setToast({
        message: result.message || "Venue details updated successfully.",
        type: "success",
      });
    } catch (err: unknown) {
      console.error("Failed to update venue details:", err);
      const errMsg =
        err instanceof Error ? err.message : "Unable to update venue details. Please try again.";
      setToast({
        message: errMsg,
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Helper to generate Google directions URL from coordinates
  const getDirectionsUrl = (latStr: string, lngStr: string, fallbackUrl?: string) => {
    if (latStr.trim() && lngStr.trim()) {
      const lat = Number(latStr);
      const lng = Number(lngStr);
      if (!isNaN(lat) && !isNaN(lng)) {
        return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      }
    }
    return fallbackUrl || "";
  };

  const ceremonyDirectionsUrl = getDirectionsUrl(
    formData.ceremonyLatitude,
    formData.ceremonyLongitude,
    formData.ceremonyGoogleMapsUrl
  );

  const receptionDirectionsUrl = getDirectionsUrl(
    formData.receptionLatitude,
    formData.receptionLongitude,
    formData.receptionGoogleMapsUrl
  );

  const hasCeremonyCoords =
    formData.ceremonyLatitude.trim() !== "" &&
    formData.ceremonyLongitude.trim() !== "" &&
    !isNaN(Number(formData.ceremonyLatitude)) &&
    !isNaN(Number(formData.ceremonyLongitude));

  const hasReceptionCoords =
    formData.receptionLatitude.trim() !== "" &&
    formData.receptionLongitude.trim() !== "" &&
    !isNaN(Number(formData.receptionLatitude)) &&
    !isNaN(Number(formData.receptionLongitude));

  return (
    <AdminLayout title="Venue">
      <div className="space-y-6 sm:space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#26231F] tracking-tight">
              Venue Management
            </h2>
            <p className="text-sm text-[#746E66] mt-1">
              Manage ceremony and reception locations for your wedding.
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
            <p className="text-sm text-[#746E66]">Loading venue locations...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
            {/* Left 2 Cols: Form Sections */}
            <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
              {/* CARD 1: CEREMONY VENUE */}
              <div className="bg-white rounded-2xl border border-[#E8E3DA] p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#E8E3DA]/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#F8F6F1] border border-[#E8E3DA] flex items-center justify-center text-[#C9A96E]">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-serif font-semibold text-[#26231F]">
                        Ceremony Location
                      </h3>
                      <p className="text-xs text-[#746E66]">
                        Where the vows and marriage ceremony take place
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#F8F6F1] text-[#8C703E] border border-[#E8E3DA]">
                    Ceremony
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  <Input
                    label="Venue Name"
                    placeholder="e.g. Shangri-La Colombo / Holy Mary Church"
                    value={formData.ceremonyVenueName}
                    onChange={(e) =>
                      handleChange("ceremonyVenueName", e.target.value)
                    }
                    error={errors.ceremonyVenueName}
                    disabled={saving}
                  />

                  <Input
                    label="Address"
                    placeholder="e.g. 1 Galle Face, Colombo 02, Sri Lanka"
                    value={formData.ceremonyAddress}
                    onChange={(e) =>
                      handleChange("ceremonyAddress", e.target.value)
                    }
                    error={errors.ceremonyAddress}
                    disabled={saving}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="Date"
                    type="date"
                    value={formData.ceremonyDate}
                    onChange={(e) =>
                      handleChange("ceremonyDate", e.target.value)
                    }
                    error={errors.ceremonyDate}
                    disabled={saving}
                  />

                  <Input
                    label="Time"
                    type="time"
                    value={formData.ceremonyTime}
                    onChange={(e) =>
                      handleChange("ceremonyTime", e.target.value)
                    }
                    error={errors.ceremonyTime}
                    disabled={saving}
                    leftIcon={<Clock className="w-4 h-4 text-[#746E66]" />}
                  />
                </div>

                <div className="grid grid-cols-1 gap-5">
                  <Input
                    label="Google Maps URL"
                    placeholder="https://maps.google.com/?q=..."
                    value={formData.ceremonyGoogleMapsUrl}
                    onChange={(e) =>
                      handleChange("ceremonyGoogleMapsUrl", e.target.value)
                    }
                    error={errors.ceremonyGoogleMapsUrl}
                    helperText="Paste a Google Maps sharing link for this venue."
                    disabled={saving}
                    leftIcon={<Globe className="w-4 h-4 text-[#746E66]" />}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="Latitude"
                    type="number"
                    step="any"
                    placeholder="e.g. 6.9271"
                    value={formData.ceremonyLatitude}
                    onChange={(e) =>
                      handleChange("ceremonyLatitude", e.target.value)
                    }
                    error={errors.ceremonyLatitude}
                    helperText="Between -90 and 90 (enables embed map)"
                    disabled={saving}
                  />

                  <Input
                    label="Longitude"
                    type="number"
                    step="any"
                    placeholder="e.g. 79.8441"
                    value={formData.ceremonyLongitude}
                    onChange={(e) =>
                      handleChange("ceremonyLongitude", e.target.value)
                    }
                    error={errors.ceremonyLongitude}
                    helperText="Between -180 and 180"
                    disabled={saving}
                  />
                </div>

                <Textarea
                  label="Ceremony Description & Notes"
                  placeholder="Share details regarding parking, hall entrance, dress code notes, or photography policies..."
                  value={formData.ceremonyDescription}
                  onChange={(e) =>
                    handleChange("ceremonyDescription", e.target.value)
                  }
                  error={errors.ceremonyDescription}
                  rows={3}
                  disabled={saving}
                  helperText={`${formData.ceremonyDescription.length}/2000 characters`}
                />

                {/* Direct Action Link Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href={formData.ceremonyGoogleMapsUrl.trim() || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border border-[#E8E3DA] transition-colors ${
                      formData.ceremonyGoogleMapsUrl.trim()
                        ? "bg-white hover:bg-[#F8F6F1] text-[#26231F] cursor-pointer"
                        : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed pointer-events-none"
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span>Open in Google Maps</span>
                  </a>

                  <a
                    href={ceremonyDirectionsUrl || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border border-[#E8E3DA] transition-colors ${
                      ceremonyDirectionsUrl
                        ? "bg-[#F8F6F1] hover:bg-[#EFEAE1] text-[#8C703E] cursor-pointer"
                        : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed pointer-events-none"
                    }`}
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span>Get Directions</span>
                  </a>
                </div>
              </div>

              {/* CARD 2: RECEPTION VENUE */}
              <div className="bg-white rounded-2xl border border-[#E8E3DA] p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#E8E3DA]/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#F8F6F1] border border-[#E8E3DA] flex items-center justify-center text-[#C9A96E]">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-serif font-semibold text-[#26231F]">
                        Reception Location
                      </h3>
                      <p className="text-xs text-[#746E66]">
                        Where the celebratory dinner, party, and toasts occur
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#F8F6F1] text-[#8C703E] border border-[#E8E3DA]">
                    Reception
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  <Input
                    label="Venue Name"
                    placeholder="e.g. Galle Face Hotel / Grand Ballroom"
                    value={formData.receptionVenueName}
                    onChange={(e) =>
                      handleChange("receptionVenueName", e.target.value)
                    }
                    error={errors.receptionVenueName}
                    disabled={saving}
                  />

                  <Input
                    label="Address"
                    placeholder="e.g. 2 Galle Road, Colombo 03, Sri Lanka"
                    value={formData.receptionAddress}
                    onChange={(e) =>
                      handleChange("receptionAddress", e.target.value)
                    }
                    error={errors.receptionAddress}
                    disabled={saving}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="Date"
                    type="date"
                    value={formData.receptionDate}
                    onChange={(e) =>
                      handleChange("receptionDate", e.target.value)
                    }
                    error={errors.receptionDate}
                    disabled={saving}
                  />

                  <Input
                    label="Time"
                    type="time"
                    value={formData.receptionTime}
                    onChange={(e) =>
                      handleChange("receptionTime", e.target.value)
                    }
                    error={errors.receptionTime}
                    disabled={saving}
                    leftIcon={<Clock className="w-4 h-4 text-[#746E66]" />}
                  />
                </div>

                <div className="grid grid-cols-1 gap-5">
                  <Input
                    label="Google Maps URL"
                    placeholder="https://maps.google.com/?q=..."
                    value={formData.receptionGoogleMapsUrl}
                    onChange={(e) =>
                      handleChange("receptionGoogleMapsUrl", e.target.value)
                    }
                    error={errors.receptionGoogleMapsUrl}
                    helperText="Paste a Google Maps sharing link for this venue."
                    disabled={saving}
                    leftIcon={<Globe className="w-4 h-4 text-[#746E66]" />}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="Latitude"
                    type="number"
                    step="any"
                    placeholder="e.g. 6.9197"
                    value={formData.receptionLatitude}
                    onChange={(e) =>
                      handleChange("receptionLatitude", e.target.value)
                    }
                    error={errors.receptionLatitude}
                    helperText="Between -90 and 90 (enables embed map)"
                    disabled={saving}
                  />

                  <Input
                    label="Longitude"
                    type="number"
                    step="any"
                    placeholder="e.g. 79.8453"
                    value={formData.receptionLongitude}
                    onChange={(e) =>
                      handleChange("receptionLongitude", e.target.value)
                    }
                    error={errors.receptionLongitude}
                    helperText="Between -180 and 180"
                    disabled={saving}
                  />
                </div>

                <Textarea
                  label="Reception Description & Notes"
                  placeholder="Share details on welcome drinks, dinner format, parking facilities, or entertainment..."
                  value={formData.receptionDescription}
                  onChange={(e) =>
                    handleChange("receptionDescription", e.target.value)
                  }
                  error={errors.receptionDescription}
                  rows={3}
                  disabled={saving}
                  helperText={`${formData.receptionDescription.length}/2000 characters`}
                />

                {/* Direct Action Link Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href={formData.receptionGoogleMapsUrl.trim() || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border border-[#E8E3DA] transition-colors ${
                      formData.receptionGoogleMapsUrl.trim()
                        ? "bg-white hover:bg-[#F8F6F1] text-[#26231F] cursor-pointer"
                        : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed pointer-events-none"
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span>Open in Google Maps</span>
                  </a>

                  <a
                    href={receptionDirectionsUrl || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border border-[#E8E3DA] transition-colors ${
                      receptionDirectionsUrl
                        ? "bg-[#F8F6F1] hover:bg-[#EFEAE1] text-[#8C703E] cursor-pointer"
                        : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed pointer-events-none"
                    }`}
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span>Get Directions</span>
                  </a>
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
                  Save Venue Details
                </Button>
              </div>
            </form>

            {/* Right 1 Col: Live Venue & Map Preview */}
            <div className="space-y-4 lg:sticky lg:top-24">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#C9A96E]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#746E66]">
                    Venue Preview
                  </span>
                </div>

                {/* Tabs */}
                <div className="flex items-center bg-white rounded-xl border border-[#E8E3DA] p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setActivePreviewTab("ceremony")}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      activePreviewTab === "ceremony"
                        ? "bg-[#C9A96E] text-white shadow-xs"
                        : "text-[#746E66] hover:text-[#26231F]"
                    }`}
                  >
                    Ceremony
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePreviewTab("reception")}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      activePreviewTab === "reception"
                        ? "bg-[#C9A96E] text-white shadow-xs"
                        : "text-[#746E66] hover:text-[#26231F]"
                    }`}
                  >
                    Reception
                  </button>
                </div>
              </div>

              {/* Preview Card */}
              <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8E3DA] p-6 shadow-sm space-y-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent" />

                {activePreviewTab === "ceremony" ? (
                  <>
                    <div>
                      <span className="text-[10px] uppercase font-semibold tracking-widest text-[#8C703E]">
                        Ceremony Location
                      </span>
                      <h4 className="text-xl font-serif font-semibold text-[#26231F] mt-1">
                        {formData.ceremonyVenueName.trim() || "Ceremony Venue Name"}
                      </h4>
                      <p className="text-xs text-[#746E66] mt-1 flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C9A96E] shrink-0 mt-0.5" />
                        <span>
                          {formData.ceremonyAddress.trim() ||
                            "Venue street address will appear here..."}
                        </span>
                      </p>
                    </div>

                    {/* Date / Time summary */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {formData.ceremonyDate && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#E8E3DA] text-[#26231F]">
                          <Calendar className="w-3 h-3 text-[#C9A96E]" />
                          <span>{formData.ceremonyDate}</span>
                        </span>
                      )}
                      {formData.ceremonyTime && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#E8E3DA] text-[#26231F]">
                          <Clock className="w-3 h-3 text-[#C9A96E]" />
                          <span>{formData.ceremonyTime}</span>
                        </span>
                      )}
                    </div>

                    {/* Map Embed or Placeholder */}
                    <div className="w-full h-48 rounded-2xl overflow-hidden border border-[#E8E3DA] bg-white relative">
                      {hasCeremonyCoords ? (
                        <iframe
                          title="Ceremony Location Map"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          src={`https://maps.google.com/maps?q=${formData.ceremonyLatitude.trim()},${formData.ceremonyLongitude.trim()}&hl=en&z=15&output=embed`}
                        />
                      ) : formData.ceremonyAddress.trim() ? (
                        <iframe
                          title="Ceremony Location Address"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(
                            formData.ceremonyAddress.trim()
                          )}&hl=en&z=15&output=embed`}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-[#746E66]">
                          <MapPin className="w-8 h-8 text-[#C9A96E]/60 mb-2" />
                          <p className="text-xs font-medium">Interactive Map Preview</p>
                          <p className="text-[11px] text-[#746E66]/80 mt-1 max-w-[200px]">
                            Add coordinates or venue address to view embed map
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Description excerpt */}
                    {formData.ceremonyDescription.trim() && (
                      <p className="text-xs text-[#746E66] italic leading-relaxed line-clamp-3">
                        "{formData.ceremonyDescription.trim()}"
                      </p>
                    )}

                    {/* Direct Links */}
                    <div className="pt-2 border-t border-[#E8E3DA]/80 flex flex-col gap-2">
                      <a
                        href={formData.ceremonyGoogleMapsUrl.trim() || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-[#E8E3DA] transition-colors ${
                          formData.ceremonyGoogleMapsUrl.trim()
                            ? "bg-white hover:bg-[#F8F6F1] text-[#26231F]"
                            : "bg-gray-100 text-gray-400 border-gray-200 pointer-events-none"
                        }`}
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#C9A96E]" />
                        <span>Open in Google Maps</span>
                      </a>

                      <a
                        href={ceremonyDirectionsUrl || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-[#E8E3DA] transition-colors ${
                          ceremonyDirectionsUrl
                            ? "bg-[#F8F6F1] hover:bg-[#ECE6DC] text-[#8C703E]"
                            : "bg-gray-100 text-gray-400 border-gray-200 pointer-events-none"
                        }`}
                      >
                        <Navigation className="w-3.5 h-3.5 text-[#C9A96E]" />
                        <span>Get Directions</span>
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-[10px] uppercase font-semibold tracking-widest text-[#8C703E]">
                        Reception Location
                      </span>
                      <h4 className="text-xl font-serif font-semibold text-[#26231F] mt-1">
                        {formData.receptionVenueName.trim() || "Reception Venue Name"}
                      </h4>
                      <p className="text-xs text-[#746E66] mt-1 flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C9A96E] shrink-0 mt-0.5" />
                        <span>
                          {formData.receptionAddress.trim() ||
                            "Venue street address will appear here..."}
                        </span>
                      </p>
                    </div>

                    {/* Date / Time summary */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {formData.receptionDate && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#E8E3DA] text-[#26231F]">
                          <Calendar className="w-3 h-3 text-[#C9A96E]" />
                          <span>{formData.receptionDate}</span>
                        </span>
                      )}
                      {formData.receptionTime && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#E8E3DA] text-[#26231F]">
                          <Clock className="w-3 h-3 text-[#C9A96E]" />
                          <span>{formData.receptionTime}</span>
                        </span>
                      )}
                    </div>

                    {/* Map Embed or Placeholder */}
                    <div className="w-full h-48 rounded-2xl overflow-hidden border border-[#E8E3DA] bg-white relative">
                      {hasReceptionCoords ? (
                        <iframe
                          title="Reception Location Map"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          src={`https://maps.google.com/maps?q=${formData.receptionLatitude.trim()},${formData.receptionLongitude.trim()}&hl=en&z=15&output=embed`}
                        />
                      ) : formData.receptionAddress.trim() ? (
                        <iframe
                          title="Reception Location Address"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(
                            formData.receptionAddress.trim()
                          )}&hl=en&z=15&output=embed`}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-[#746E66]">
                          <MapPin className="w-8 h-8 text-[#C9A96E]/60 mb-2" />
                          <p className="text-xs font-medium">Interactive Map Preview</p>
                          <p className="text-[11px] text-[#746E66]/80 mt-1 max-w-[200px]">
                            Add coordinates or venue address to view embed map
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Description excerpt */}
                    {formData.receptionDescription.trim() && (
                      <p className="text-xs text-[#746E66] italic leading-relaxed line-clamp-3">
                        "{formData.receptionDescription.trim()}"
                      </p>
                    )}

                    {/* Direct Links */}
                    <div className="pt-2 border-t border-[#E8E3DA]/80 flex flex-col gap-2">
                      <a
                        href={formData.receptionGoogleMapsUrl.trim() || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-[#E8E3DA] transition-colors ${
                          formData.receptionGoogleMapsUrl.trim()
                            ? "bg-white hover:bg-[#F8F6F1] text-[#26231F]"
                            : "bg-gray-100 text-gray-400 border-gray-200 pointer-events-none"
                        }`}
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#C9A96E]" />
                        <span>Open in Google Maps</span>
                      </a>

                      <a
                        href={receptionDirectionsUrl || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-[#E8E3DA] transition-colors ${
                          receptionDirectionsUrl
                            ? "bg-[#F8F6F1] hover:bg-[#ECE6DC] text-[#8C703E]"
                            : "bg-gray-100 text-gray-400 border-gray-200 pointer-events-none"
                        }`}
                      >
                        <Navigation className="w-3.5 h-3.5 text-[#C9A96E]" />
                        <span>Get Directions</span>
                      </a>
                    </div>
                  </>
                )}
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
