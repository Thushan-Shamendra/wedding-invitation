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
  MapPin,
  Calendar,
  Clock,
  Navigation,
  Globe,
  Eye,
  Sparkles,
  ChevronDown,
  Sliders,
  AlertCircle,
  Building2,
  Check,
} from "lucide-react";

interface VenueFormData {
  ceremonyVenueName: string;
  ceremonyHallName: string;
  ceremonyAddress: string;
  ceremonyDate: string;
  ceremonyTime: string;
  ceremonyGoogleMapsUrl: string;
  ceremonyLatitude: string;
  ceremonyLongitude: string;
  ceremonyDescription: string;

  receptionEnabled: boolean;
  receptionVenueName: string;
  receptionHallName: string;
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
  const [showCeremonyAdvanced, setShowCeremonyAdvanced] = useState(false);
  const [showReceptionAdvanced, setShowReceptionAdvanced] = useState(false);

  // Address basis for coordinate warning
  const [ceremonyCoordsBasis, setCeremonyCoordsBasis] = useState("");
  const [receptionCoordsBasis, setReceptionCoordsBasis] = useState("");

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [formData, setFormData] = useState<VenueFormData>({
    ceremonyVenueName: "",
    ceremonyHallName: "",
    ceremonyAddress: "",
    ceremonyDate: "",
    ceremonyTime: "",
    ceremonyGoogleMapsUrl: "",
    ceremonyLatitude: "",
    ceremonyLongitude: "",
    ceremonyDescription: "",

    receptionEnabled: false,
    receptionVenueName: "",
    receptionHallName: "",
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
          ceremonyHallName: data.ceremonyHallName || "",
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

          receptionEnabled: data.receptionEnabled ?? false,
          receptionVenueName: data.receptionVenueName || "",
          receptionHallName: data.receptionHallName || "",
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

        // Store basis for coordinates to detect changes
        const cerBasis = [loaded.ceremonyVenueName, loaded.ceremonyHallName, loaded.ceremonyAddress].join("::");
        setCeremonyCoordsBasis(cerBasis);
        if (loaded.ceremonyLatitude || loaded.ceremonyLongitude) {
          setShowCeremonyAdvanced(true);
        }

        const recBasis = [loaded.receptionVenueName, loaded.receptionHallName, loaded.receptionAddress].join("::");
        setReceptionCoordsBasis(recBasis);
        if (loaded.receptionLatitude || loaded.receptionLongitude) {
          setShowReceptionAdvanced(true);
        }
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

  // Ensure active preview tab is valid
  useEffect(() => {
    if (!formData.receptionEnabled && activePreviewTab === "reception") {
      setActivePreviewTab("ceremony");
    }
  }, [formData.receptionEnabled, activePreviewTab]);

  // Check if address changed while coordinates exist
  const currentCeremonyAddressKey = [
    formData.ceremonyVenueName.trim(),
    formData.ceremonyHallName.trim(),
    formData.ceremonyAddress.trim(),
  ].join("::");

  const hasCeremonyCoords =
    formData.ceremonyLatitude.trim() !== "" || formData.ceremonyLongitude.trim() !== "";

  const showCeremonyCoordsWarning =
    hasCeremonyCoords &&
    ceremonyCoordsBasis !== "" &&
    currentCeremonyAddressKey !== ceremonyCoordsBasis;

  const currentReceptionAddressKey = [
    formData.receptionVenueName.trim(),
    formData.receptionHallName.trim(),
    formData.receptionAddress.trim(),
  ].join("::");

  const hasReceptionCoords =
    formData.receptionLatitude.trim() !== "" || formData.receptionLongitude.trim() !== "";

  const showReceptionCoordsWarning =
    formData.receptionEnabled &&
    hasReceptionCoords &&
    receptionCoordsBasis !== "" &&
    currentReceptionAddressKey !== receptionCoordsBasis;

  const handleClearCeremonyCoords = () => {
    setFormData((prev) => ({
      ...prev,
      ceremonyLatitude: "",
      ceremonyLongitude: "",
    }));
    setCeremonyCoordsBasis(currentCeremonyAddressKey);
  };

  const handleClearReceptionCoords = () => {
    setFormData((prev) => ({
      ...prev,
      receptionLatitude: "",
      receptionLongitude: "",
    }));
    setReceptionCoordsBasis(currentReceptionAddressKey);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Ceremony Validations
    if (formData.ceremonyVenueName.length > 150) {
      newErrors.ceremonyVenueName = "Venue name cannot exceed 150 characters";
    }
    if (formData.ceremonyHallName.length > 150) {
      newErrors.ceremonyHallName = "Hall name cannot exceed 150 characters";
    }
    if (formData.ceremonyAddress.length > 300) {
      newErrors.ceremonyAddress = "Address cannot exceed 300 characters";
    }
    if (formData.ceremonyDescription.length > 2000) {
      newErrors.ceremonyDescription = "Description cannot exceed 2000 characters";
    }

    const cerLatTrim = formData.ceremonyLatitude.trim();
    const cerLngTrim = formData.ceremonyLongitude.trim();
    const hasCerLat = cerLatTrim !== "";
    const hasCerLng = cerLngTrim !== "";

    if (hasCerLat !== hasCerLng) {
      if (!hasCerLat) newErrors.ceremonyLatitude = "Both latitude and longitude are required";
      if (!hasCerLng) newErrors.ceremonyLongitude = "Both latitude and longitude are required";
    }

    if (hasCerLat) {
      const lat = Number(cerLatTrim);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        newErrors.ceremonyLatitude = "Latitude must be a number between -90 and 90";
      }
    }

    if (hasCerLng) {
      const lng = Number(cerLngTrim);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        newErrors.ceremonyLongitude = "Longitude must be a number between -180 and 180";
      }
    }

    if (formData.ceremonyGoogleMapsUrl.trim()) {
      const trimmedUrl = formData.ceremonyGoogleMapsUrl.trim();
      if (/^(javascript|data|vbscript):/i.test(trimmedUrl)) {
        newErrors.ceremonyGoogleMapsUrl = "Invalid link protocol";
      } else {
        try {
          const url = new URL(trimmedUrl);
          if (url.protocol !== "http:" && url.protocol !== "https:") {
            newErrors.ceremonyGoogleMapsUrl = "Must be a valid web link (http/https)";
          }
        } catch {
          newErrors.ceremonyGoogleMapsUrl = "Please enter a valid URL";
        }
      }
    }

    // Reception Validations (ONLY if reception is enabled)
    if (formData.receptionEnabled) {
      if (formData.receptionVenueName.length > 150) {
        newErrors.receptionVenueName = "Venue name cannot exceed 150 characters";
      }
      if (formData.receptionHallName.length > 150) {
        newErrors.receptionHallName = "Hall name cannot exceed 150 characters";
      }
      if (formData.receptionAddress.length > 300) {
        newErrors.receptionAddress = "Address cannot exceed 300 characters";
      }
      if (formData.receptionDescription.length > 2000) {
        newErrors.receptionDescription = "Description cannot exceed 2000 characters";
      }

      const recLatTrim = formData.receptionLatitude.trim();
      const recLngTrim = formData.receptionLongitude.trim();
      const hasRecLat = recLatTrim !== "";
      const hasRecLng = recLngTrim !== "";

      if (hasRecLat !== hasRecLng) {
        if (!hasRecLat) newErrors.receptionLatitude = "Both latitude and longitude are required";
        if (!hasRecLng) newErrors.receptionLongitude = "Both latitude and longitude are required";
      }

      if (hasRecLat) {
        const lat = Number(recLatTrim);
        if (isNaN(lat) || lat < -90 || lat > 90) {
          newErrors.receptionLatitude = "Latitude must be a number between -90 and 90";
        }
      }

      if (hasRecLng) {
        const lng = Number(recLngTrim);
        if (isNaN(lng) || lng < -180 || lng > 180) {
          newErrors.receptionLongitude = "Longitude must be a number between -180 and 180";
        }
      }

      if (formData.receptionGoogleMapsUrl.trim()) {
        const trimmedUrl = formData.receptionGoogleMapsUrl.trim();
        if (/^(javascript|data|vbscript):/i.test(trimmedUrl)) {
          newErrors.receptionGoogleMapsUrl = "Invalid link protocol";
        } else {
          try {
            const url = new URL(trimmedUrl);
            if (url.protocol !== "http:" && url.protocol !== "https:") {
              newErrors.receptionGoogleMapsUrl = "Must be a valid web link (http/https)";
            }
          } catch {
            newErrors.receptionGoogleMapsUrl = "Please enter a valid URL";
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof VenueFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // If setting coordinates manually, update basis to current address
    if (field === "ceremonyLatitude" || field === "ceremonyLongitude") {
      setCeremonyCoordsBasis(currentCeremonyAddressKey);
    }
    if (field === "receptionLatitude" || field === "receptionLongitude") {
      setReceptionCoordsBasis(currentReceptionAddressKey);
    }
  };

  const handleReset = () => {
    if (initialData) {
      setFormData(initialData);
      setErrors({});
      setCeremonyCoordsBasis(
        [initialData.ceremonyVenueName, initialData.ceremonyHallName, initialData.ceremonyAddress].join("::")
      );
      setReceptionCoordsBasis(
        [initialData.receptionVenueName, initialData.receptionHallName, initialData.receptionAddress].join("::")
      );
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
      const payload = {
        ceremonyVenueName: formData.ceremonyVenueName.trim(),
        ceremonyHallName: formData.ceremonyHallName.trim(),
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

        receptionEnabled: formData.receptionEnabled,
        receptionVenueName: formData.receptionVenueName.trim(),
        receptionHallName: formData.receptionHallName.trim(),
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
      setCeremonyCoordsBasis(currentCeremonyAddressKey);
      setReceptionCoordsBasis(currentReceptionAddressKey);
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

  // Helper: Build map embed URL using priority:
  // 1. If valid lat AND lng exist -> use coordinates
  // 2. Otherwise -> build query from Venue Name + Hall Name + Address
  const buildMapEmbedUrl = (
    latStr: string,
    lngStr: string,
    venueName: string,
    hallName: string,
    address: string
  ) => {
    const latTrim = latStr.trim();
    const lngTrim = lngStr.trim();
    if (latTrim !== "" && lngTrim !== "") {
      const lat = Number(latTrim);
      const lng = Number(lngTrim);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=15&output=embed`;
      }
    }

    const queryParts = [venueName.trim(), hallName.trim(), address.trim()].filter(Boolean);
    if (queryParts.length > 0) {
      const query = queryParts.join(" ");
      return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&hl=en&z=15&output=embed`;
    }

    return "";
  };

  // Helper: Build directions URL using priority:
  // 1. If lat AND lng exist -> destination=LAT,LNG
  // 2. Otherwise -> destination=encoded(Venue Name + Hall Name + Address)
  const buildDirectionsUrl = (
    latStr: string,
    lngStr: string,
    venueName: string,
    hallName: string,
    address: string
  ) => {
    const latTrim = latStr.trim();
    const lngTrim = lngStr.trim();
    if (latTrim !== "" && lngTrim !== "") {
      const lat = Number(latTrim);
      const lng = Number(lngTrim);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      }
    }

    const queryParts = [venueName.trim(), hallName.trim(), address.trim()].filter(Boolean);
    if (queryParts.length > 0) {
      const query = queryParts.join(" ");
      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
    }

    return "";
  };

  // Helper: Open in Google Maps URL:
  // 1. If Google Maps URL exists -> use that URL
  // 2. If coordinates exist -> search/?api=1&query=LAT,LNG
  // 3. Otherwise -> search/?api=1&query=encoded(Venue Name + Hall Name + Address)
  const buildOpenInGoogleMapsUrl = (
    googleMapsUrl: string,
    latStr: string,
    lngStr: string,
    venueName: string,
    hallName: string,
    address: string
  ) => {
    if (googleMapsUrl.trim()) {
      return googleMapsUrl.trim();
    }
    const latTrim = latStr.trim();
    const lngTrim = lngStr.trim();
    if (latTrim !== "" && lngTrim !== "") {
      const lat = Number(latTrim);
      const lng = Number(lngTrim);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      }
    }
    const queryParts = [venueName.trim(), hallName.trim(), address.trim()].filter(Boolean);
    if (queryParts.length > 0) {
      const query = queryParts.join(" ");
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    }
    return "";
  };

  // Ceremony URLs
  const ceremonyEmbedUrl = useMemo(
    () =>
      buildMapEmbedUrl(
        formData.ceremonyLatitude,
        formData.ceremonyLongitude,
        formData.ceremonyVenueName,
        formData.ceremonyHallName,
        formData.ceremonyAddress
      ),
    [
      formData.ceremonyLatitude,
      formData.ceremonyLongitude,
      formData.ceremonyVenueName,
      formData.ceremonyHallName,
      formData.ceremonyAddress,
    ]
  );

  const ceremonyDirectionsUrl = useMemo(
    () =>
      buildDirectionsUrl(
        formData.ceremonyLatitude,
        formData.ceremonyLongitude,
        formData.ceremonyVenueName,
        formData.ceremonyHallName,
        formData.ceremonyAddress
      ),
    [
      formData.ceremonyLatitude,
      formData.ceremonyLongitude,
      formData.ceremonyVenueName,
      formData.ceremonyHallName,
      formData.ceremonyAddress,
    ]
  );

  const ceremonyOpenMapsUrl = useMemo(
    () =>
      buildOpenInGoogleMapsUrl(
        formData.ceremonyGoogleMapsUrl,
        formData.ceremonyLatitude,
        formData.ceremonyLongitude,
        formData.ceremonyVenueName,
        formData.ceremonyHallName,
        formData.ceremonyAddress
      ),
    [
      formData.ceremonyGoogleMapsUrl,
      formData.ceremonyLatitude,
      formData.ceremonyLongitude,
      formData.ceremonyVenueName,
      formData.ceremonyHallName,
      formData.ceremonyAddress,
    ]
  );

  // Reception URLs
  const receptionEmbedUrl = useMemo(
    () =>
      buildMapEmbedUrl(
        formData.receptionLatitude,
        formData.receptionLongitude,
        formData.receptionVenueName,
        formData.receptionHallName,
        formData.receptionAddress
      ),
    [
      formData.receptionLatitude,
      formData.receptionLongitude,
      formData.receptionVenueName,
      formData.receptionHallName,
      formData.receptionAddress,
    ]
  );

  const receptionDirectionsUrl = useMemo(
    () =>
      buildDirectionsUrl(
        formData.receptionLatitude,
        formData.receptionLongitude,
        formData.receptionVenueName,
        formData.receptionHallName,
        formData.receptionAddress
      ),
    [
      formData.receptionLatitude,
      formData.receptionLongitude,
      formData.receptionVenueName,
      formData.receptionHallName,
      formData.receptionAddress,
    ]
  );

  const receptionOpenMapsUrl = useMemo(
    () =>
      buildOpenInGoogleMapsUrl(
        formData.receptionGoogleMapsUrl,
        formData.receptionLatitude,
        formData.receptionLongitude,
        formData.receptionVenueName,
        formData.receptionHallName,
        formData.receptionAddress
      ),
    [
      formData.receptionGoogleMapsUrl,
      formData.receptionLatitude,
      formData.receptionLongitude,
      formData.receptionVenueName,
      formData.receptionHallName,
      formData.receptionAddress,
    ]
  );

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
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E8E3DA] bg-white hover:bg-[#F8F6F1] text-xs sm:text-sm font-medium text-[#26231F] shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
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

                {/* Coordinate UX Warning Banner */}
                {showCeremonyCoordsWarning && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
                    <div className="flex items-start sm:items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                      <span>
                        Map is currently using saved coordinates. Clear coordinates to preview using the new address.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearCeremonyCoords}
                      className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 font-medium text-xs hover:bg-amber-100 transition-colors shadow-2xs shrink-0 self-start sm:self-auto cursor-pointer"
                    >
                      Use Address Instead
                    </button>
                  </div>
                )}

                {/* 1. Venue Name */}
                <Input
                  label="Venue Name"
                  placeholder="e.g. Cinnamon Lakeside Colombo"
                  value={formData.ceremonyVenueName}
                  onChange={(e) =>
                    handleChange("ceremonyVenueName", e.target.value)
                  }
                  error={errors.ceremonyVenueName}
                  disabled={saving}
                />

                {/* 2. Hall / Ballroom Name (Optional) */}
                <Input
                  label="Hall / Ballroom Name (Optional)"
                  placeholder="e.g. Lotus Ballroom"
                  value={formData.ceremonyHallName}
                  onChange={(e) =>
                    handleChange("ceremonyHallName", e.target.value)
                  }
                  error={errors.ceremonyHallName}
                  helperText="Optional specific room or hall within the venue."
                  disabled={saving}
                  leftIcon={<Building2 className="w-4 h-4 text-[#746E66]" />}
                />

                {/* 3. Address */}
                <Input
                  label="Address"
                  placeholder="e.g. 115 Sir Chittampalam A Gardiner Mawatha, Colombo 02"
                  value={formData.ceremonyAddress}
                  onChange={(e) =>
                    handleChange("ceremonyAddress", e.target.value)
                  }
                  error={errors.ceremonyAddress}
                  disabled={saving}
                />

                {/* 4. Date & Time */}
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

                {/* 5. Google Maps Link (Optional) */}
                <Input
                  label="Google Maps Link (Optional)"
                  placeholder="https://maps.app.goo.gl/... or https://maps.google.com/..."
                  value={formData.ceremonyGoogleMapsUrl}
                  onChange={(e) =>
                    handleChange("ceremonyGoogleMapsUrl", e.target.value)
                  }
                  error={errors.ceremonyGoogleMapsUrl}
                  helperText="Optional link used for the 'Open in Google Maps' button."
                  disabled={saving}
                  leftIcon={<Globe className="w-4 h-4 text-[#746E66]" />}
                />

                {/* 6. Advanced Map Settings (Collapsible) */}
                <div className="border border-[#E8E3DA] rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowCeremonyAdvanced(!showCeremonyAdvanced)}
                    className="w-full flex items-center justify-between p-3.5 bg-[#FAF8F5] text-xs font-medium text-[#26231F] hover:bg-[#F3EFEA] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Sliders className="w-3.5 h-3.5 text-[#C9A96E]" />
                      <span>Advanced Map Settings</span>
                      {(formData.ceremonyLatitude.trim() || formData.ceremonyLongitude.trim()) && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFEAE1] text-[#8C703E] font-medium">
                          Coordinates Active
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-[#746E66] transition-transform duration-200 ${
                        showCeremonyAdvanced ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showCeremonyAdvanced && (
                    <div className="p-4 space-y-4 bg-white border-t border-[#E8E3DA]">
                      <p className="text-xs text-[#746E66]">
                        Optional. Use coordinates only when you need an exact map pin.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          helperText="Between -90 and 90"
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
                    </div>
                  )}
                </div>

                {/* 7. Description & Notes */}
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
                    href={ceremonyOpenMapsUrl || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border border-[#E8E3DA] transition-colors ${
                      ceremonyOpenMapsUrl
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

              {/* CARD 2: RECEPTION VENUE (OPTIONAL TOGGLE) */}
              <div className="bg-white rounded-2xl border border-[#E8E3DA] p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E3DA]/80">
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

                  {/* Toggle Switch */}
                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <span className="text-xs font-medium text-[#26231F]">
                      Enable Reception Location
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={formData.receptionEnabled}
                      onClick={() =>
                        handleChange("receptionEnabled", !formData.receptionEnabled)
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        formData.receptionEnabled ? "bg-[#C9A96E]" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          formData.receptionEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {!formData.receptionEnabled ? (
                  <div className="p-4 rounded-xl bg-[#FAF8F5] border border-dashed border-[#E8E3DA] text-center text-xs text-[#746E66]">
                    Reception location is currently disabled. Toggle &quot;Enable Reception Location&quot; above to configure a separate dinner or reception hall.
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    {/* Coordinate UX Warning Banner */}
                    {showReceptionCoordsWarning && (
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
                        <div className="flex items-start sm:items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                          <span>
                            Map is currently using saved coordinates. Clear coordinates to preview using the new address.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleClearReceptionCoords}
                          className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 font-medium text-xs hover:bg-amber-100 transition-colors shadow-2xs shrink-0 self-start sm:self-auto cursor-pointer"
                        >
                          Use Address Instead
                        </button>
                      </div>
                    )}

                    {/* 1. Reception Venue Name */}
                    <Input
                      label="Venue Name"
                      placeholder="e.g. Galle Face Hotel"
                      value={formData.receptionVenueName}
                      onChange={(e) =>
                        handleChange("receptionVenueName", e.target.value)
                      }
                      error={errors.receptionVenueName}
                      disabled={saving}
                    />

                    {/* 2. Reception Hall Name (Optional) */}
                    <Input
                      label="Hall / Ballroom Name (Optional)"
                      placeholder="e.g. Grand Ballroom / Jubilee Room"
                      value={formData.receptionHallName}
                      onChange={(e) =>
                        handleChange("receptionHallName", e.target.value)
                      }
                      error={errors.receptionHallName}
                      helperText="Optional specific room or ballroom within the venue."
                      disabled={saving}
                      leftIcon={<Building2 className="w-4 h-4 text-[#746E66]" />}
                    />

                    {/* 3. Address */}
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

                    {/* 4. Date & Time */}
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

                    {/* 5. Google Maps Link (Optional) */}
                    <Input
                      label="Google Maps Link (Optional)"
                      placeholder="https://maps.app.goo.gl/... or https://maps.google.com/..."
                      value={formData.receptionGoogleMapsUrl}
                      onChange={(e) =>
                        handleChange("receptionGoogleMapsUrl", e.target.value)
                      }
                      error={errors.receptionGoogleMapsUrl}
                      helperText="Optional link used for the 'Open in Google Maps' button."
                      disabled={saving}
                      leftIcon={<Globe className="w-4 h-4 text-[#746E66]" />}
                    />

                    {/* 6. Advanced Map Settings (Collapsible) */}
                    <div className="border border-[#E8E3DA] rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setShowReceptionAdvanced(!showReceptionAdvanced)}
                        className="w-full flex items-center justify-between p-3.5 bg-[#FAF8F5] text-xs font-medium text-[#26231F] hover:bg-[#F3EFEA] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Sliders className="w-3.5 h-3.5 text-[#C9A96E]" />
                          <span>Advanced Map Settings</span>
                          {(formData.receptionLatitude.trim() || formData.receptionLongitude.trim()) && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFEAE1] text-[#8C703E] font-medium">
                              Coordinates Active
                            </span>
                          )}
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-[#746E66] transition-transform duration-200 ${
                            showReceptionAdvanced ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {showReceptionAdvanced && (
                        <div className="p-4 space-y-4 bg-white border-t border-[#E8E3DA]">
                          <p className="text-xs text-[#746E66]">
                            Optional. Use coordinates only when you need an exact map pin.
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                              helperText="Between -90 and 90"
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
                        </div>
                      )}
                    </div>

                    {/* 7. Description & Notes */}
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
                        href={receptionOpenMapsUrl || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border border-[#E8E3DA] transition-colors ${
                          receptionOpenMapsUrl
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
                )}
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

            {/* Right 1 Col: Live Venue & Map Preview Card */}
            <div className="space-y-4 lg:sticky lg:top-24">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#C9A96E]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#746E66]">
                    Venue Preview
                  </span>
                </div>

                {/* Only show tab switcher if receptionEnabled is true */}
                {formData.receptionEnabled && (
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
                )}
              </div>

              {/* Preview Card */}
              <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8E3DA] p-6 shadow-sm space-y-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent" />

                {activePreviewTab === "ceremony" ? (
                  <>
                    <div>
                      <span className="text-[10px] uppercase font-semibold tracking-widest text-[#8C703E]">
                        CEREMONY LOCATION
                      </span>
                      <h4 className="text-xl font-serif font-semibold text-[#26231F] mt-1">
                        {formData.ceremonyVenueName.trim() || "Ceremony Venue Name"}
                      </h4>

                      {/* Hall Name - Only render if available */}
                      {formData.ceremonyHallName.trim() && (
                        <p className="text-xs font-medium text-[#8C703E] mt-0.5">
                          {formData.ceremonyHallName.trim()}
                        </p>
                      )}

                      <p className="text-xs text-[#746E66] mt-1.5 flex items-start gap-1.5">
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
                      {ceremonyEmbedUrl ? (
                        <iframe
                          title="Ceremony Location Map"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                          src={ceremonyEmbedUrl}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-[#746E66]">
                          <MapPin className="w-8 h-8 text-[#C9A96E]/60 mb-2" />
                          <p className="text-xs font-medium">Interactive Map Preview</p>
                          <p className="text-[11px] text-[#746E66]/80 mt-1 max-w-[200px]">
                            Enter venue name, address, or coordinates to view live map
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Description excerpt */}
                    {formData.ceremonyDescription.trim() && (
                      <p className="text-xs text-[#746E66] italic leading-relaxed line-clamp-3">
                        &quot;{formData.ceremonyDescription.trim()}&quot;
                      </p>
                    )}

                    {/* Direct Links */}
                    <div className="pt-2 border-t border-[#E8E3DA]/80 flex flex-col gap-2">
                      <a
                        href={ceremonyOpenMapsUrl || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-[#E8E3DA] transition-colors ${
                          ceremonyOpenMapsUrl
                            ? "bg-white hover:bg-[#F8F6F1] text-[#26231F] cursor-pointer"
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
                            ? "bg-[#F8F6F1] hover:bg-[#ECE6DC] text-[#8C703E] cursor-pointer"
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
                        RECEPTION LOCATION
                      </span>
                      <h4 className="text-xl font-serif font-semibold text-[#26231F] mt-1">
                        {formData.receptionVenueName.trim() || "Reception Venue Name"}
                      </h4>

                      {/* Hall Name - Only render if available */}
                      {formData.receptionHallName.trim() && (
                        <p className="text-xs font-medium text-[#8C703E] mt-0.5">
                          {formData.receptionHallName.trim()}
                        </p>
                      )}

                      <p className="text-xs text-[#746E66] mt-1.5 flex items-start gap-1.5">
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
                      {receptionEmbedUrl ? (
                        <iframe
                          title="Reception Location Map"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                          src={receptionEmbedUrl}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-[#746E66]">
                          <MapPin className="w-8 h-8 text-[#C9A96E]/60 mb-2" />
                          <p className="text-xs font-medium">Interactive Map Preview</p>
                          <p className="text-[11px] text-[#746E66]/80 mt-1 max-w-[200px]">
                            Enter venue name, address, or coordinates to view live map
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Description excerpt */}
                    {formData.receptionDescription.trim() && (
                      <p className="text-xs text-[#746E66] italic leading-relaxed line-clamp-3">
                        &quot;{formData.receptionDescription.trim()}&quot;
                      </p>
                    )}

                    {/* Direct Links */}
                    <div className="pt-2 border-t border-[#E8E3DA]/80 flex flex-col gap-2">
                      <a
                        href={receptionOpenMapsUrl || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-[#E8E3DA] transition-colors ${
                          receptionOpenMapsUrl
                            ? "bg-white hover:bg-[#F8F6F1] text-[#26231F] cursor-pointer"
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
