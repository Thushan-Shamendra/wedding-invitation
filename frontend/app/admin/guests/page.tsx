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
import { guestService } from "@/services/guestService";
import { getInvitationUrl } from "@/utils/invitation";
import { Guest, GuestStats } from "@/types";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Plus,
  Search,
  Copy,
  ExternalLink,
  Pencil,
  Trash2,
  Eye,
  Check,
  Filter,
  Phone,
  Mail,
  Share2,
} from "lucide-react";

export default function GuestManagementPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [stats, setStats] = useState<GuestStats>({
    totalGuests: 0,
    attending: 0,
    declined: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreatedModalOpen, setIsCreatedModalOpen] = useState(false);

  // Active / Selected Guest State
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [createdGuest, setCreatedGuest] = useState<Guest | null>(null);
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);

  // Action Loading States
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    maximumGuests: 1,
    personalMessage: "",
    rsvpStatus: "pending" as "pending" | "attending" | "declined",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [guestList, guestStats] = await Promise.all([
        guestService.getGuests({
          search: searchTerm,
          status: statusFilter,
        }),
        guestService.getGuestStats(),
      ]);
      setGuests(guestList);
      setStats(guestStats);
    } catch (err) {
      console.error("Failed to load guests:", err);
      setToast({
        message: "Unable to load guests.",
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

  const copyToClipboard = async (token: string) => {
    try {
      const url = getInvitationUrl(token);
      await navigator.clipboard.writeText(url);
      setCopiedToken(token);
      setToast({
        message: "Invitation link copied.",
        type: "success",
      });
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const openAddModal = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      maximumGuests: 1,
      personalMessage: "",
      rsvpStatus: "pending",
    });
    setErrors({});
    setIsAddModalOpen(true);
  };

  const openEditModal = (guest: Guest) => {
    setSelectedGuest(guest);
    setFormData({
      name: guest.name,
      phone: guest.phone || "",
      email: guest.email || "",
      maximumGuests: guest.maximumGuests || 1,
      personalMessage: guest.personalMessage || "",
      rsvpStatus: guest.rsvpStatus || "pending",
    });
    setErrors({});
    setIsEditModalOpen(true);
  };

  const openViewModal = (guest: Guest) => {
    setSelectedGuest(guest);
    setIsViewModalOpen(true);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Guest name is required";
    } else if (formData.name.trim().length > 150) {
      newErrors.name = "Guest name cannot exceed 150 characters";
    }

    if (
      formData.maximumGuests < 1 ||
      formData.maximumGuests > 20 ||
      isNaN(Number(formData.maximumGuests))
    ) {
      newErrors.maximumGuests = "Allowed guests must be between 1 and 20";
    }

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    if (formData.personalMessage && formData.personalMessage.length > 1000) {
      newErrors.personalMessage =
        "Personal message cannot exceed 1000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    setToast(null);

    try {
      const res = await guestService.createGuest({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        maximumGuests: Number(formData.maximumGuests),
        personalMessage: formData.personalMessage.trim(),
      });

      setIsAddModalOpen(false);
      setCreatedGuest(res.data);
      setIsCreatedModalOpen(true);
      setToast({
        message: "Guest created successfully.",
        type: "success",
      });
      fetchData();
    } catch (err: unknown) {
      console.error("Create guest error:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Unable to create guest. Please try again.";
      setToast({
        message: msg,
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGuest || !selectedGuest._id) return;
    if (!validate()) return;

    setSubmitting(true);
    setToast(null);

    try {
      await guestService.updateGuest(selectedGuest._id, {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        maximumGuests: Number(formData.maximumGuests),
        personalMessage: formData.personalMessage.trim(),
        rsvpStatus: formData.rsvpStatus,
      });

      setIsEditModalOpen(false);
      setToast({
        message: "Guest updated successfully.",
        type: "success",
      });
      fetchData();
    } catch (err: unknown) {
      console.error("Update guest error:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Unable to update guest. Please try again.";
      setToast({
        message: msg,
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!guestToDelete || !guestToDelete._id) return;

    setDeleting(true);
    try {
      await guestService.deleteGuest(guestToDelete._id);
      setToast({
        message: "Guest deleted successfully.",
        type: "success",
      });
      setGuestToDelete(null);
      fetchData();
    } catch (err: unknown) {
      console.error("Delete guest error:", err);
      setToast({
        message: "Unable to delete guest. Please try again.",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const filterTabs = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Attending", value: "attending" },
    { label: "Declined", value: "declined" },
  ];

  return (
    <AdminLayout title="Guests">
      <div className="space-y-6 sm:space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#26231F] tracking-tight">
              Guests Management
            </h2>
            <p className="text-sm text-[#746E66] mt-1">
              Manage invited guests and personalized wedding invitation links.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={openAddModal}
            leftIcon={<Plus className="w-4 h-4" />}
            className="self-start sm:self-auto cursor-pointer"
          >
            Add Guest
          </Button>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Total Guests"
            value={stats.totalGuests}
            subtitle="Configured recipients"
            icon={<Users className="w-5 h-5 text-[#C9A96E]" />}
            accent="gold"
          />
          <StatCard
            title="Attending"
            value={stats.attending}
            subtitle="Confirmed attendance"
            icon={<UserCheck className="w-5 h-5 text-emerald-600" />}
            accent="emerald"
          />
          <StatCard
            title="Declined"
            value={stats.declined}
            subtitle="Regretfully declined"
            icon={<UserX className="w-5 h-5 text-rose-600" />}
            accent="rose"
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            subtitle="Awaiting RSVP response"
            icon={<Clock className="w-5 h-5 text-amber-600" />}
            accent="amber"
          />
        </div>

        {/* Top Controls: Search & Filter Tabs */}
        <div className="bg-white rounded-2xl border border-[#E8E3DA] p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#746E66]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by guest name, email or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-[#E8E3DA] bg-white pl-10 pr-4 py-2.5 text-sm text-[#26231F] placeholder:text-[#746E66]/60 focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 outline-none transition-all"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F8F6F1] rounded-xl border border-[#E8E3DA] overflow-x-auto">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                  statusFilter === tab.value
                    ? "bg-[#C9A96E] text-white shadow-xs"
                    : "text-[#746E66] hover:text-[#26231F]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content: Table on Desktop, Cards on Mobile, or Empty State */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-[#E8E3DA] p-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#746E66]">Loading guest list...</p>
          </div>
        ) : guests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8E3DA] p-8 shadow-sm">
            <EmptyState
              icon={<Users className="w-7 h-7 text-[#C9A96E]" />}
              title="No guests added yet."
              description={
                searchTerm || statusFilter !== "all"
                  ? "No guests match your current search or filter criteria."
                  : "Add your first guest to generate a personalized wedding invitation."
              }
              action={
                <Button
                  type="button"
                  variant="primary"
                  onClick={openAddModal}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add Guest
                </Button>
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table View (Hidden on mobile) */}
            <div className="hidden md:block bg-white rounded-2xl border border-[#E8E3DA] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#FAF8F5] border-b border-[#E8E3DA] text-xs font-semibold uppercase tracking-wider text-[#746E66]">
                    <tr>
                      <th className="py-3.5 px-5">Guest Name</th>
                      <th className="py-3.5 px-4">Contact</th>
                      <th className="py-3.5 px-4 text-center">Allowed</th>
                      <th className="py-3.5 px-4">RSVP Status</th>
                      <th className="py-3.5 px-4">Invitation Link</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E3DA]/70">
                    {guests.map((guest) => {
                      const invUrl = getInvitationUrl(guest.invitationToken);
                      return (
                        <tr
                          key={guest._id}
                          className="hover:bg-[#F8F6F1]/50 transition-colors"
                        >
                          {/* Name */}
                          <td className="py-4 px-5">
                            <span className="font-serif font-semibold text-[#26231F] block">
                              {guest.name}
                            </span>
                            {guest.personalMessage && (
                              <span className="text-[11px] text-[#746E66] line-clamp-1 italic max-w-xs mt-0.5">
                                "{guest.personalMessage}"
                              </span>
                            )}
                          </td>

                          {/* Contact */}
                          <td className="py-4 px-4 text-xs text-[#746E66]">
                            <div className="space-y-0.5">
                              {guest.phone && (
                                <div className="flex items-center gap-1.5 text-[#26231F]">
                                  <Phone className="w-3 h-3 text-[#C9A96E]" />
                                  <span>{guest.phone}</span>
                                </div>
                              )}
                              {guest.email && (
                                <div className="flex items-center gap-1.5">
                                  <Mail className="w-3 h-3 text-[#746E66]" />
                                  <span className="truncate max-w-[160px]">
                                    {guest.email}
                                  </span>
                                </div>
                              )}
                              {!guest.phone && !guest.email && (
                                <span className="text-gray-400">—</span>
                              )}
                            </div>
                          </td>

                          {/* Allowed Guests */}
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#FAF8F5] border border-[#E8E3DA] text-xs font-semibold text-[#8C703E]">
                              {guest.maximumGuests}
                            </span>
                          </td>

                          {/* RSVP Status */}
                          <td className="py-4 px-4">
                            <StatusBadge status={guest.rsvpStatus} />
                          </td>

                          {/* Invitation Link */}
                          <td className="py-4 px-4 text-xs font-mono text-[#746E66]">
                            <div className="flex items-center gap-2 max-w-[200px]">
                              <span className="truncate bg-[#FAF8F5] px-2 py-1 rounded border border-[#E8E3DA]">
                                /invite/{guest.invitationToken}
                              </span>
                              <button
                                onClick={() => copyToClipboard(guest.invitationToken)}
                                className="p-1 rounded text-[#746E66] hover:text-[#C9A96E] hover:bg-[#F8F6F1] transition-colors cursor-pointer shrink-0"
                                title="Copy link"
                                aria-label="Copy invitation link"
                              >
                                {copiedToken === guest.invitationToken ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openViewModal(guest)}
                                className="p-1.5 rounded-lg text-[#746E66] hover:text-[#26231F] hover:bg-[#F8F6F1] transition-colors cursor-pointer"
                                title="View details"
                                aria-label="View guest details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <a
                                href={`/invite/${guest.invitationToken}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg text-[#746E66] hover:text-[#C9A96E] hover:bg-[#F8F6F1] transition-colors cursor-pointer"
                                title="Open invitation"
                                aria-label="Open personalized invitation"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>

                              <button
                                onClick={() => openEditModal(guest)}
                                className="p-1.5 rounded-lg text-[#746E66] hover:text-[#26231F] hover:bg-[#F8F6F1] transition-colors cursor-pointer"
                                title="Edit guest"
                                aria-label="Edit guest"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => setGuestToDelete(guest)}
                                className="p-1.5 rounded-lg text-[#746E66] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete guest"
                                aria-label="Delete guest"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards View (Visible on small screens) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {guests.map((guest) => (
                <div
                  key={guest._id}
                  className="bg-white rounded-2xl border border-[#E8E3DA] p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-serif font-semibold text-[#26231F] text-base">
                        {guest.name}
                      </h4>
                      <p className="text-xs text-[#746E66] mt-0.5">
                        Allowed Guests: <strong>{guest.maximumGuests}</strong>
                      </p>
                    </div>
                    <StatusBadge status={guest.rsvpStatus} />
                  </div>

                  {/* Contact details */}
                  <div className="text-xs text-[#746E66] space-y-1 pt-1">
                    {guest.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#C9A96E]" />
                        <span>{guest.phone}</span>
                      </p>
                    )}
                    {guest.email && (
                      <p className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-[#746E66]" />
                        <span className="truncate">{guest.email}</span>
                      </p>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-[#E8E3DA]/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => copyToClipboard(guest.invitationToken)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E3DA] text-xs font-medium text-[#26231F] hover:bg-[#F8F6F1] transition-colors"
                    >
                      {copiedToken === guest.invitationToken ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#C9A96E]" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <a
                        href={`/invite/${guest.invitationToken}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl text-[#746E66] hover:text-[#C9A96E] hover:bg-[#F8F6F1]"
                        title="Open invitation"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => openEditModal(guest)}
                        className="p-2 rounded-xl text-[#746E66] hover:text-[#26231F] hover:bg-[#F8F6F1]"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setGuestToDelete(guest)}
                        className="p-2 rounded-xl text-[#746E66] hover:text-rose-600 hover:bg-rose-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ADD GUEST MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Guest"
        subtitle="Provide guest details to generate a unique personalized invitation link."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Guest Name"
            placeholder="e.g. Kasun Perera"
            value={formData.name}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, name: e.target.value }));
              if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
            }}
            error={errors.name}
            disabled={submitting}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              placeholder="e.g. 0771234567"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              disabled={submitting}
              leftIcon={<Phone className="w-4 h-4 text-[#746E66]" />}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. kasun@example.com"
              value={formData.email}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, email: e.target.value }));
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
              error={errors.email}
              disabled={submitting}
              leftIcon={<Mail className="w-4 h-4 text-[#746E66]" />}
            />
          </div>

          <Input
            label="Maximum Allowed Guests"
            type="number"
            min={1}
            max={20}
            value={formData.maximumGuests}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                maximumGuests: parseInt(e.target.value, 10) || 1,
              }));
              if (errors.maximumGuests)
                setErrors((prev) => ({ ...prev, maximumGuests: "" }));
            }}
            error={errors.maximumGuests}
            helperText="Number of guest seats allocated for this party (1 to 20)."
            disabled={submitting}
          />

          <Textarea
            label="Personal Message (Optional)"
            placeholder="Dear Kasun, we would love to celebrate our special day with you..."
            value={formData.personalMessage}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                personalMessage: e.target.value,
              }));
              if (errors.personalMessage)
                setErrors((prev) => ({ ...prev, personalMessage: "" }));
            }}
            error={errors.personalMessage}
            rows={3}
            disabled={submitting}
            helperText={`${formData.personalMessage.length}/1000 characters`}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E3DA]/80">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              isLoading={submitting}
              loadingText="Creating..."
            >
              Create Invitation
            </Button>
          </div>
        </form>
      </Modal>

      {/* INVITATION CREATED SUCCESS MODAL */}
      <Modal
        isOpen={isCreatedModalOpen}
        onClose={() => setIsCreatedModalOpen(false)}
        title="Invitation Created Successfully"
        subtitle="A personalized wedding invitation link has been generated."
        maxWidth="md"
      >
        {createdGuest && (
          <div className="space-y-5">
            <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E3DA] p-5 space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8C703E]">
                Invited Guest
              </span>
              <h4 className="text-xl font-serif font-semibold text-[#26231F]">
                {createdGuest.name}
              </h4>
              <p className="text-xs text-[#746E66]">
                Allowed Seats: <strong>{createdGuest.maximumGuests}</strong> |
                Initial Status: <strong>Pending</strong>
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#746E66] block mb-1.5">
                Personalized Invitation Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getInvitationUrl(createdGuest.invitationToken)}
                  className="flex-1 rounded-xl border border-[#E8E3DA] bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-[#26231F] outline-none select-all"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => copyToClipboard(createdGuest.invitationToken)}
                  leftIcon={
                    copiedToken === createdGuest.invitationToken ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-[#C9A96E]" />
                    )
                  }
                >
                  {copiedToken === createdGuest.invitationToken
                    ? "Copied"
                    : "Copy"}
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-[#E8E3DA]/80">
              <a
                href={`/invite/${createdGuest.invitationToken}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#E8E3DA] bg-white hover:bg-[#F8F6F1] text-xs font-medium text-[#26231F] transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-[#C9A96E]" />
                <span>Open Invitation</span>
              </a>

              <Button
                type="button"
                variant="primary"
                onClick={() => setIsCreatedModalOpen(false)}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* EDIT GUEST MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Guest"
        subtitle="Update guest information. The invitation link remains unchanged."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Guest Name"
            value={formData.name}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, name: e.target.value }));
              if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
            }}
            error={errors.name}
            disabled={submitting}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              disabled={submitting}
            />

            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, email: e.target.value }));
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
              error={errors.email}
              disabled={submitting}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Maximum Allowed Guests"
              type="number"
              min={1}
              max={20}
              value={formData.maximumGuests}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  maximumGuests: parseInt(e.target.value, 10) || 1,
                }));
                if (errors.maximumGuests)
                  setErrors((prev) => ({ ...prev, maximumGuests: "" }));
              }}
              error={errors.maximumGuests}
              disabled={submitting}
            />

            <Select
              label="RSVP Status"
              value={formData.rsvpStatus}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  rsvpStatus: e.target.value as "pending" | "attending" | "declined",
                }))
              }
              options={[
                { label: "Pending", value: "pending" },
                { label: "Attending", value: "attending" },
                { label: "Declined", value: "declined" },
              ]}
              disabled={submitting}
            />
          </div>

          <Textarea
            label="Personal Message"
            value={formData.personalMessage}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                personalMessage: e.target.value,
              }));
              if (errors.personalMessage)
                setErrors((prev) => ({ ...prev, personalMessage: "" }));
            }}
            error={errors.personalMessage}
            rows={3}
            disabled={submitting}
            helperText={`${formData.personalMessage.length}/1000 characters`}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E3DA]/80">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              isLoading={submitting}
              loadingText="Saving..."
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* VIEW GUEST DETAILS MODAL */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Guest Details"
        subtitle="Complete record and invitation information."
      >
        {selectedGuest && (
          <div className="space-y-4">
            <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E3DA] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-serif font-semibold text-[#26231F]">
                  {selectedGuest.name}
                </h4>
                <StatusBadge status={selectedGuest.rsvpStatus} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <span className="text-[#746E66] block">Phone:</span>
                  <span className="font-medium text-[#26231F]">
                    {selectedGuest.phone || "Not provided"}
                  </span>
                </div>
                <div>
                  <span className="text-[#746E66] block">Email:</span>
                  <span className="font-medium text-[#26231F]">
                    {selectedGuest.email || "Not provided"}
                  </span>
                </div>
                <div>
                  <span className="text-[#746E66] block">Allowed Guests:</span>
                  <span className="font-medium text-[#26231F]">
                    Up to {selectedGuest.maximumGuests} guest(s)
                  </span>
                </div>
                <div>
                  <span className="text-[#746E66] block">Created Date:</span>
                  <span className="font-medium text-[#26231F]">
                    {selectedGuest.createdAt
                      ? new Date(selectedGuest.createdAt).toLocaleDateString()
                      : "Recently"}
                  </span>
                </div>
              </div>

              {selectedGuest.personalMessage && (
                <div className="pt-2 border-t border-[#E8E3DA]/80">
                  <span className="text-[11px] text-[#746E66] font-semibold uppercase tracking-wider block mb-1">
                    Personalized Message:
                  </span>
                  <p className="text-xs text-[#746E66] italic">
                    "{selectedGuest.personalMessage}"
                  </p>
                </div>
              )}
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#746E66] block mb-1.5">
                Invitation URL
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getInvitationUrl(selectedGuest.invitationToken)}
                  className="flex-1 rounded-xl border border-[#E8E3DA] bg-gray-50 px-3 py-2 text-xs font-mono text-[#26231F] outline-none select-all"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => copyToClipboard(selectedGuest.invitationToken)}
                  leftIcon={
                    copiedToken === selectedGuest.invitationToken ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-[#C9A96E]" />
                    )
                  }
                >
                  {copiedToken === selectedGuest.invitationToken
                    ? "Copied"
                    : "Copy"}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E3DA]/80">
              <a
                href={`/invite/${selectedGuest.invitationToken}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E8E3DA] bg-white hover:bg-[#F8F6F1] text-xs font-medium text-[#26231F] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#C9A96E]" />
                <span>Open Invitation</span>
              </a>

              <Button
                type="button"
                variant="primary"
                onClick={() => setIsViewModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={Boolean(guestToDelete)}
        onClose={() => setGuestToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Guest?"
        message={`Are you sure you want to delete '${guestToDelete?.name}'? This action cannot be undone.`}
        confirmText="Delete Guest"
        cancelText="Cancel"
        isLoading={deleting}
        danger={true}
      />

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
