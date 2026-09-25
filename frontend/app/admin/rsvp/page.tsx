"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Toast } from "@/components/ui/Toast";
import { rsvpService } from "@/services/rsvpService";
import { getInvitationUrl } from "@/utils/invitation";
import { RSVP, RSVPStats } from "@/types";
import {
  MailCheck,
  UserCheck,
  UserX,
  Users,
  Search,
  ExternalLink,
  Pencil,
  Trash2,
  Eye,
  Filter,
  Utensils,
  MessageSquare,
  Calendar,
  Phone,
  Mail,
  RefreshCw,
} from "lucide-react";

export default function RSVPAdminPage() {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [stats, setStats] = useState<RSVPStats>({
    totalResponses: 0,
    attendingResponses: 0,
    declinedResponses: 0,
    totalGuestsAttending: 0,
    pendingGuests: 0,
  });
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals State
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRsvp, setSelectedRsvp] = useState<RSVP | null>(null);
  const [rsvpToDelete, setRsvpToDelete] = useState<RSVP | null>(null);

  // Action Loading States
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Edit Form State
  const [editFormData, setEditFormData] = useState({
    attendanceStatus: "attending" as "attending" | "declined",
    numberOfGuests: 1,
    mealPreference: "",
    message: "",
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rsvpList, rsvpStats] = await Promise.all([
        rsvpService.getRSVPResponses({
          search: searchTerm,
          status: statusFilter,
        }),
        rsvpService.getRSVPStats(),
      ]);
      setRsvps(rsvpList);
      setStats(rsvpStats);
    } catch (err) {
      console.error("Failed to load RSVP data:", err);
      setToast({
        message: "Unable to load RSVP responses.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const handleOpenView = (rsvp: RSVP) => {
    setSelectedRsvp(rsvp);
    setIsViewModalOpen(true);
  };

  const handleOpenEdit = (rsvp: RSVP) => {
    setSelectedRsvp(rsvp);
    setEditFormData({
      attendanceStatus: rsvp.attendanceStatus,
      numberOfGuests: rsvp.numberOfGuests || 1,
      mealPreference: rsvp.mealPreference || "",
      message: rsvp.message || "",
    });
    setEditErrors({});
    setIsEditModalOpen(true);
  };

  const handleUpdateRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRsvp) return;

    const errors: Record<string, string> = {};
    const maxAllowed = selectedRsvp.guest?.maximumGuests || 20;

    if (editFormData.attendanceStatus === "attending") {
      if (
        !editFormData.numberOfGuests ||
        editFormData.numberOfGuests < 1 ||
        editFormData.numberOfGuests > maxAllowed
      ) {
        errors.numberOfGuests = `Number of guests must be between 1 and ${maxAllowed}.`;
      }
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      await rsvpService.updateRSVP(selectedRsvp._id, {
        attendanceStatus: editFormData.attendanceStatus,
        numberOfGuests:
          editFormData.attendanceStatus === "attending"
            ? editFormData.numberOfGuests
            : 0,
        mealPreference: editFormData.mealPreference,
        message: editFormData.message,
      });

      setToast({
        message: "RSVP response updated successfully.",
        type: "success",
      });
      setIsEditModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error("Failed to update RSVP:", err);
      setToast({
        message: err.response?.data?.message || "Failed to update RSVP response.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRSVP = async () => {
    if (!rsvpToDelete) return;

    try {
      setDeleting(true);
      await rsvpService.deleteRSVP(rsvpToDelete._id);
      setToast({
        message: "RSVP response deleted. Guest status reset to Pending.",
        type: "success",
      });
      setRsvpToDelete(null);
      fetchData();
    } catch (err: any) {
      console.error("Failed to delete RSVP:", err);
      setToast({
        message: err.response?.data?.message || "Failed to delete RSVP response.",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <AdminLayout title="RSVP Responses">
      <div className="space-y-8">
        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Total Responses"
            value={stats.totalResponses}
            subtitle="RSVP confirmations received"
            icon={<MailCheck className="w-5 h-5 text-[#C9A96E]" />}
            accent="gold"
          />
          <StatCard
            title="Attending"
            value={stats.attendingResponses}
            subtitle="Confirmed attending parties"
            icon={<UserCheck className="w-5 h-5 text-emerald-600" />}
            accent="emerald"
          />
          <StatCard
            title="Declined"
            value={stats.declinedResponses}
            subtitle="Parties unable to attend"
            icon={<UserX className="w-5 h-5 text-rose-600" />}
            accent="rose"
          />
          <StatCard
            title="Guests Attending"
            value={stats.totalGuestsAttending}
            subtitle="Total headcount attending"
            icon={<Users className="w-5 h-5 text-[#8C703E]" />}
            accent="gold"
          />
        </div>

        {/* Search, Filter & Action Toolbar */}
        <div className="bg-white rounded-2xl border border-[#E8E3DA] p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#746E66] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by guest name, email, phone, or meal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#E8E3DA] bg-[#F8F6F1] placeholder-[#746E66]/60 text-[#26231F] focus:border-[#C9A96E] focus:bg-white focus:ring-2 focus:ring-[#C9A96E]/20 outline-none transition-all"
              />
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs text-[#746E66] flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5 text-[#C9A96E]" />
                Filter:
              </span>
              {[
                { label: "All", value: "all" },
                { label: "Attending", value: "attending" },
                { label: "Declined", value: "declined" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setStatusFilter(tab.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    statusFilter === tab.value
                      ? "bg-[#C9A96E] text-white shadow-xs"
                      : "bg-[#F8F6F1] text-[#746E66] hover:bg-[#EFEAE1] hover:text-[#26231F]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}

              <button
                type="button"
                onClick={fetchData}
                className="p-1.5 text-[#746E66] hover:text-[#26231F] hover:bg-[#F8F6F1] rounded-lg transition-colors ml-2 cursor-pointer"
                title="Refresh list"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Responses Table / Cards */}
        <div className="bg-white rounded-2xl border border-[#E8E3DA] overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs uppercase tracking-widest text-[#746E66]">
                Loading RSVP responses...
              </p>
            </div>
          ) : rsvps.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No RSVP responses found"
                description={
                  searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search criteria or status filter."
                    : "No guests have submitted an RSVP response yet."
                }
              />
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[#E8E3DA] bg-[#FAF8F5] text-xs font-medium uppercase tracking-wider text-[#746E66]">
                      <th className="py-3.5 px-6">Guest</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Guests</th>
                      <th className="py-3.5 px-4">Meal Preference</th>
                      <th className="py-3.5 px-4">Message</th>
                      <th className="py-3.5 px-4">Response Date</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E3DA]/70">
                    {rsvps.map((rsvp) => (
                      <tr
                        key={rsvp._id}
                        className="hover:bg-[#FAF8F5]/60 transition-colors"
                      >
                        {/* Guest Info */}
                        <td className="py-4 px-6">
                          <div className="space-y-0.5">
                            <span className="font-medium text-[#26231F] block">
                              {rsvp.guest?.name || "Unknown Guest"}
                            </span>
                            <div className="flex items-center gap-3 text-xs text-[#746E66]">
                              {rsvp.guest?.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-[#C9A96E]" />
                                  {rsvp.guest.email}
                                </span>
                              )}
                              {rsvp.guest?.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-[#C9A96E]" />
                                  {rsvp.guest.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <StatusBadge status={rsvp.attendanceStatus} />
                        </td>

                        {/* Guests Count */}
                        <td className="py-4 px-4 text-[#26231F]">
                          {rsvp.attendanceStatus === "attending" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FAF8F5] border border-[#E8E3DA]">
                              <Users className="w-3 h-3 text-[#C9A96E]" />
                              {rsvp.numberOfGuests} guest{rsvp.numberOfGuests > 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span className="text-xs text-[#746E66]">0</span>
                          )}
                        </td>

                        {/* Meal Preference */}
                        <td className="py-4 px-4 text-xs text-[#26231F]">
                          {rsvp.mealPreference ? (
                            <span className="inline-flex items-center gap-1 text-[#26231F]">
                              <Utensils className="w-3 h-3 text-[#C9A96E]" />
                              {rsvp.mealPreference}
                            </span>
                          ) : (
                            <span className="text-[#746E66]/60 italic">—</span>
                          )}
                        </td>

                        {/* Message Preview */}
                        <td className="py-4 px-4 max-w-xs">
                          {rsvp.message ? (
                            <p
                              className="text-xs text-[#746E66] truncate italic"
                              title={rsvp.message}
                            >
                              "{rsvp.message}"
                            </p>
                          ) : (
                            <span className="text-xs text-[#746E66]/60 italic">—</span>
                          )}
                        </td>

                        {/* Response Date */}
                        <td className="py-4 px-4 text-xs text-[#746E66] whitespace-nowrap">
                          {formatDate(rsvp.submittedAt || rsvp.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenView(rsvp)}
                              className="p-1.5 text-[#746E66] hover:text-[#26231F] hover:bg-[#F8F6F1] rounded-lg transition-colors cursor-pointer"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(rsvp)}
                              className="p-1.5 text-[#746E66] hover:text-[#C9A96E] hover:bg-[#FAF8F5] rounded-lg transition-colors cursor-pointer"
                              title="Edit RSVP response"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setRsvpToDelete(rsvp)}
                              className="p-1.5 text-[#746E66] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete RSVP (resets to pending)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile / Tablet Cards View */}
              <div className="block lg:hidden divide-y divide-[#E8E3DA]/70">
                {rsvps.map((rsvp) => (
                  <div key={rsvp._id} className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-medium text-[#26231F]">
                          {rsvp.guest?.name || "Unknown Guest"}
                        </h4>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-[#746E66] mt-0.5">
                          {rsvp.guest?.email && <span>{rsvp.guest.email}</span>}
                          {rsvp.guest?.phone && <span>{rsvp.guest.phone}</span>}
                        </div>
                      </div>
                      <StatusBadge status={rsvp.attendanceStatus} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E3DA]">
                      <div>
                        <span className="text-[#746E66] block">Guests:</span>
                        <span className="font-medium text-[#26231F]">
                          {rsvp.attendanceStatus === "attending"
                            ? `${rsvp.numberOfGuests} attendee${rsvp.numberOfGuests > 1 ? "s" : ""}`
                            : "0"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#746E66] block">Diet / Meal:</span>
                        <span className="font-medium text-[#26231F]">
                          {rsvp.mealPreference || "None"}
                        </span>
                      </div>
                    </div>

                    {rsvp.message && (
                      <p className="text-xs text-[#746E66] italic bg-[#F8F6F1] p-2.5 rounded-lg border border-[#E8E3DA]/60">
                        "{rsvp.message}"
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-[#E8E3DA]/60">
                      <span className="text-[11px] text-[#746E66]">
                        {formatDate(rsvp.submittedAt || rsvp.createdAt)}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenView(rsvp)}
                          className="px-2.5 py-1 text-xs font-medium text-[#746E66] hover:text-[#26231F] bg-[#FAF8F5] border border-[#E8E3DA] rounded-lg transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(rsvp)}
                          className="p-1 text-[#746E66] hover:text-[#C9A96E] rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRsvpToDelete(rsvp)}
                          className="p-1 text-[#746E66] hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="RSVP Response Details"
        subtitle="Complete submission information from guest"
        maxWidth="md"
      >
        {selectedRsvp && (
          <div className="space-y-5">
            {/* Top Guest Overview Card */}
            <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E3DA] p-4 sm:p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-serif font-semibold text-[#26231F]">
                    {selectedRsvp.guest?.name}
                  </h4>
                  <p className="text-xs text-[#746E66] mt-0.5">
                    Invitation Allowance: Up to {selectedRsvp.guest?.maximumGuests || 1} guest
                    {selectedRsvp.guest?.maximumGuests && selectedRsvp.guest.maximumGuests > 1
                      ? "s"
                      : ""}
                  </p>
                </div>
                <StatusBadge status={selectedRsvp.attendanceStatus} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-[#E8E3DA]/70">
                {selectedRsvp.guest?.email && (
                  <div className="flex items-center gap-1.5 text-[#746E66]">
                    <Mail className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span>{selectedRsvp.guest.email}</span>
                  </div>
                )}
                {selectedRsvp.guest?.phone && (
                  <div className="flex items-center gap-1.5 text-[#746E66]">
                    <Phone className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span>{selectedRsvp.guest.phone}</span>
                  </div>
                )}
              </div>

              {selectedRsvp.guest?.invitationToken && (
                <div className="pt-2 border-t border-[#E8E3DA]/70 flex items-center justify-between">
                  <span className="text-[11px] text-[#746E66]">Invitation Link:</span>
                  <a
                    href={getInvitationUrl(selectedRsvp.guest.invitationToken)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#8C703E] hover:underline"
                  >
                    <span>Open Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Attendance & Dietary Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-[#E8E3DA] rounded-xl p-3.5 bg-white">
                <span className="text-[11px] uppercase tracking-wider text-[#746E66] block mb-1">
                  Confirmed Headcount
                </span>
                <p className="text-base font-semibold text-[#26231F] flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#C9A96E]" />
                  {selectedRsvp.attendanceStatus === "attending"
                    ? `${selectedRsvp.numberOfGuests} guest${selectedRsvp.numberOfGuests > 1 ? "s" : ""}`
                    : "0 (Declined)"}
                </p>
              </div>

              <div className="border border-[#E8E3DA] rounded-xl p-3.5 bg-white">
                <span className="text-[11px] uppercase tracking-wider text-[#746E66] block mb-1">
                  Meal / Dietary Preference
                </span>
                <p className="text-base font-semibold text-[#26231F] flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-[#C9A96E]" />
                  {selectedRsvp.mealPreference || "None specified"}
                </p>
              </div>
            </div>

            {/* Message to Couple */}
            {selectedRsvp.message ? (
              <div className="border border-[#E8E3DA] rounded-xl p-4 bg-white space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-[#746E66] block flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-[#C9A96E]" />
                  Message to Couple
                </span>
                <p className="text-xs text-[#26231F] italic leading-relaxed">
                  "{selectedRsvp.message}"
                </p>
              </div>
            ) : null}

            {/* Submission Time */}
            <div className="flex items-center gap-1.5 text-xs text-[#746E66] pt-2">
              <Calendar className="w-3.5 h-3.5 text-[#C9A96E]" />
              <span>
                Submitted on: {formatDate(selectedRsvp.submittedAt || selectedRsvp.createdAt)}
              </span>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E8E3DA]/80">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsViewModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* EDIT RSVP MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit RSVP Response"
        subtitle={`Editing response for ${selectedRsvp?.guest?.name || "Guest"}`}
        maxWidth="md"
      >
        <form onSubmit={handleUpdateRSVP} className="space-y-5">
          {/* Attendance Status */}
          <Select
            label="Attendance Status"
            options={[
              { label: "Attending", value: "attending" },
              { label: "Declined", value: "declined" },
            ]}
            value={editFormData.attendanceStatus}
            onChange={(e) =>
              setEditFormData((prev) => ({
                ...prev,
                attendanceStatus: e.target.value as "attending" | "declined",
              }))
            }
          />

          {/* Number of Guests (only if attending) */}
          {editFormData.attendanceStatus === "attending" && (
            <div>
              <Input
                label={`Number of Guests (Max Allowed: ${
                  selectedRsvp?.guest?.maximumGuests || 20
                })`}
                type="number"
                min={1}
                max={selectedRsvp?.guest?.maximumGuests || 20}
                value={editFormData.numberOfGuests}
                error={editErrors.numberOfGuests}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    numberOfGuests: Number(e.target.value),
                  }))
                }
              />
            </div>
          )}

          {/* Meal Preference */}
          {editFormData.attendanceStatus === "attending" && (
            <Input
              label="Dietary / Meal Preference"
              placeholder="e.g. Vegetarian, Halal, Gluten-free..."
              value={editFormData.mealPreference}
              onChange={(e) =>
                setEditFormData((prev) => ({
                  ...prev,
                  mealPreference: e.target.value,
                }))
              }
            />
          )}

          {/* Message */}
          <Textarea
            label="Message / Note"
            placeholder="Special wishes or notes..."
            rows={3}
            maxLength={1000}
            value={editFormData.message}
            onChange={(e) =>
              setEditFormData((prev) => ({
                ...prev,
                message: e.target.value,
              }))
            }
          />

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E3DA]/80">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE MODAL */}
      <ConfirmationModal
        isOpen={!!rsvpToDelete}
        onClose={() => setRsvpToDelete(null)}
        onConfirm={handleDeleteRSVP}
        title="Delete RSVP Response"
        message={`Are you sure you want to delete the RSVP response for "${
          rsvpToDelete?.guest?.name || "this guest"
        }"? The guest record will remain in your guest list, and their RSVP status will be reset to Pending.`}
        confirmText="Delete RSVP"
        cancelText="Cancel"
        danger={true}
        isLoading={deleting}
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
