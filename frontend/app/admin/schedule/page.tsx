"use client";

import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { EmptyState } from "@/components/admin/EmptyState";
import { Toast } from "@/components/ui/Toast";
import { scheduleService } from "@/services/scheduleService";
import { ScheduleEvent } from "@/types";
import {
  Plus,
  Clock,
  Calendar,
  Pencil,
  Trash2,
  Sparkles,
  ArrowRight,
  Eye,
  CheckCircle2,
} from "lucide-react";

export default function WeddingSchedulePage() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);

  // Delete Confirmation State
  const [eventToDelete, setEventToDelete] = useState<ScheduleEvent | null>(null);

  // Toast State
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    eventName: "",
    eventDate: "",
    startTime: "",
    description: "",
    order: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper to format 24h time to 12h AM/PM for preview
  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const parts = timeStr.split(":");
    if (parts.length < 2) return timeStr;
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    if (isNaN(hours)) return timeStr;
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await scheduleService.getScheduleEvents();
      setEvents(data);
    } catch (err) {
      console.error("Failed to load schedule:", err);
      setToast({
        message: "Unable to load wedding schedule.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openAddModal = () => {
    setEditingEvent(null);
    const nextOrder = events.length > 0 ? Math.max(...events.map((e) => e.order || 0)) + 1 : 1;
    setFormData({
      eventName: "",
      eventDate: "",
      startTime: "",
      description: "",
      order: nextOrder,
    });
    setErrors({});
    setIsFormModalOpen(true);
  };

  const openEditModal = (event: ScheduleEvent) => {
    setEditingEvent(event);
    setFormData({
      eventName: event.eventName,
      eventDate: event.eventDate || "",
      startTime: event.startTime,
      description: event.description || "",
      order: event.order ?? 0,
    });
    setErrors({});
    setIsFormModalOpen(true);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.eventName.trim()) {
      newErrors.eventName = "Event name is required";
    } else if (formData.eventName.trim().length > 150) {
      newErrors.eventName = "Event name cannot exceed 150 characters";
    }

    if (!formData.startTime.trim()) {
      newErrors.startTime = "Start time is required";
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = "Description cannot exceed 1000 characters";
    }

    if (formData.order < 0 || isNaN(Number(formData.order))) {
      newErrors.order = "Order must be a valid non-negative number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    setToast(null);

    try {
      if (editingEvent && editingEvent._id) {
        // Edit existing
        const res = await scheduleService.updateScheduleEvent(
          editingEvent._id,
          {
            eventName: formData.eventName.trim(),
            eventDate: formData.eventDate.trim(),
            startTime: formData.startTime.trim(),
            description: formData.description.trim(),
            order: Number(formData.order),
          }
        );
        setIsFormModalOpen(false);
        setToast({
          message: res.message || "Schedule event updated successfully.",
          type: "success",
        });
      } else {
        // Create new
        const res = await scheduleService.createScheduleEvent({
          eventName: formData.eventName.trim(),
          eventDate: formData.eventDate.trim(),
          startTime: formData.startTime.trim(),
          description: formData.description.trim(),
          order: Number(formData.order),
        });
        setIsFormModalOpen(false);
        setToast({
          message: res.message || "Schedule event added successfully.",
          type: "success",
        });
      }
      // Refresh list
      await fetchEvents();
    } catch (err: unknown) {
      console.error("Save schedule event error:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Unable to update the wedding schedule. Please try again.";
      setToast({
        message: msg,
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete || !eventToDelete._id) return;

    setDeleting(true);
    try {
      const res = await scheduleService.deleteScheduleEvent(eventToDelete._id);
      setToast({
        message: res.message || "Schedule event deleted successfully.",
        type: "success",
      });
      setEventToDelete(null);
      await fetchEvents();
    } catch (err: unknown) {
      console.error("Delete schedule event error:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Unable to delete schedule event. Please try again.";
      setToast({
        message: msg,
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout title="Schedule">
      <div className="space-y-6 sm:space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#26231F] tracking-tight">
              Wedding Schedule
            </h2>
            <p className="text-sm text-[#746E66] mt-1">
              Manage the timeline and important events for your wedding day.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={openAddModal}
            leftIcon={<Plus className="w-4 h-4" />}
            className="self-start sm:self-auto cursor-pointer"
          >
            Add Schedule Event
          </Button>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-[#E8E3DA] p-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#746E66]">Loading timeline schedule...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8E3DA] p-8 shadow-sm">
            <EmptyState
              icon={<Clock className="w-7 h-7 text-[#C9A96E]" />}
              title="No schedule events yet."
              description="Add the first event to start building your wedding day timeline."
              action={
                <Button
                  type="button"
                  variant="primary"
                  onClick={openAddModal}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add Schedule Event
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
            {/* Left 2 Cols: Timeline List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-[#E8E3DA] p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between pb-5 border-b border-[#E8E3DA]/80 mb-6">
                  <div>
                    <h3 className="text-base font-serif font-semibold text-[#26231F]">
                      Day Timeline ({events.length} Events)
                    </h3>
                    <p className="text-xs text-[#746E66]">
                      Chronologically sorted by display order and start time
                    </p>
                  </div>
                  <span className="text-xs font-medium text-[#746E66] px-2.5 py-1 rounded-full bg-[#F8F6F1] border border-[#E8E3DA]">
                    Auto-sorted
                  </span>
                </div>

                {/* Vertical Timeline Items */}
                <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#E8E3DA]">
                  {events.map((event) => (
                    <div key={event._id} className="relative group">
                      {/* Timeline Node Icon */}
                      <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#F8F6F1] border-2 border-[#C9A96E] flex items-center justify-center text-[#C9A96E] shadow-xs group-hover:bg-[#C9A96E] group-hover:text-white transition-colors">
                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </div>

                      {/* Event Content Box */}
                      <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E3DA] p-5 hover:border-[#C9A96E] hover:shadow-xs transition-all duration-200">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1">
                            {/* Badges: Time & Order */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#E8E3DA] text-xs font-semibold text-[#8C703E]">
                                <Clock className="w-3 h-3 text-[#C9A96E]" />
                                <span>{formatTime(event.startTime)}</span>
                                <span className="text-[10px] text-[#746E66]">
                                  ({event.startTime})
                                </span>
                              </span>

                              {event.eventDate && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-[#E8E3DA] text-[11px] text-[#746E66]">
                                  <Calendar className="w-3 h-3 text-[#C9A96E]" />
                                  <span>{event.eventDate}</span>
                                </span>
                              )}

                              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-white text-[#746E66] border border-[#E8E3DA]">
                                Order #{event.order}
                              </span>
                            </div>

                            {/* Title */}
                            <h4 className="text-base sm:text-lg font-serif font-semibold text-[#26231F] pt-1">
                              {event.eventName}
                            </h4>

                            {/* Description */}
                            {event.description && (
                              <p className="text-xs sm:text-sm text-[#746E66] leading-relaxed pt-1">
                                {event.description}
                              </p>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 self-end sm:self-start shrink-0 pt-2 sm:pt-0">
                            <button
                              onClick={() => openEditModal(event)}
                              className="p-2 rounded-xl text-[#746E66] hover:text-[#26231F] hover:bg-white border border-transparent hover:border-[#E8E3DA] transition-all cursor-pointer"
                              title="Edit event"
                              aria-label="Edit event"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setEventToDelete(event)}
                              className="p-2 rounded-xl text-[#746E66] hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                              title="Delete event"
                              aria-label="Delete event"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 1 Col: Live Public Preview Card */}
            <div className="space-y-4 lg:sticky lg:top-24">
              <div className="flex items-center gap-2 px-1">
                <Eye className="w-4 h-4 text-[#C9A96E]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#746E66]">
                  Public Preview
                </span>
              </div>

              <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8E3DA] p-6 sm:p-7 shadow-sm relative overflow-hidden text-center">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent" />

                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-[#E8E3DA] text-[#C9A96E] mb-3 shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>

                <p className="text-[10px] uppercase font-semibold tracking-widest text-[#8C703E]">
                  Wedding Day Itinerary
                </p>
                <h4 className="text-lg font-serif font-semibold text-[#26231F] mt-1 mb-5">
                  Timeline Preview
                </h4>

                <div className="space-y-3.5 text-left">
                  {events.map((ev, idx) => (
                    <div
                      key={ev._id || idx}
                      className="p-3 rounded-xl bg-white border border-[#E8E3DA] hover:border-[#C9A96E]/60 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#8C703E]">
                          {formatTime(ev.startTime)}
                        </span>
                        <span className="text-[10px] text-[#746E66]">
                          #{ev.order}
                        </span>
                      </div>
                      <p className="text-xs font-serif font-medium text-[#26231F] mt-0.5 truncate">
                        {ev.eventName}
                      </p>
                      {ev.description && (
                        <p className="text-[11px] text-[#746E66] line-clamp-1 mt-0.5">
                          {ev.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-4 mt-5 border-t border-[#E8E3DA]/80">
                  <p className="text-[11px] text-[#746E66]/70 italic text-center">
                    Reflects live wedding itinerary visible to invited guests.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingEvent ? "Edit Schedule Event" : "Add Schedule Event"}
        subtitle={
          editingEvent
            ? "Update time, description, or sequence order for this event."
            : "Define a new event milestone for your wedding day program."
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-5">
          <Input
            label="Event Name"
            placeholder="e.g. Wedding Ceremony / Guest Arrival / Dinner"
            value={formData.eventName}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, eventName: e.target.value }));
              if (errors.eventName) setErrors((prev) => ({ ...prev, eventName: "" }));
            }}
            error={errors.eventName}
            disabled={submitting}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Time"
              type="time"
              value={formData.startTime}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, startTime: e.target.value }));
                if (errors.startTime) setErrors((prev) => ({ ...prev, startTime: "" }));
              }}
              error={errors.startTime}
              disabled={submitting}
              leftIcon={<Clock className="w-4 h-4 text-[#746E66]" />}
            />

            <Input
              label="Event Date (Optional)"
              type="date"
              value={formData.eventDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, eventDate: e.target.value }))
              }
              disabled={submitting}
            />
          </div>

          <Input
            label="Display Order"
            type="number"
            min={0}
            placeholder="1"
            value={formData.order}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                order: parseInt(e.target.value, 10) || 0,
              }));
              if (errors.order) setErrors((prev) => ({ ...prev, order: "" }));
            }}
            error={errors.order}
            helperText="Lower numbers appear earlier in the wedding timeline."
            disabled={submitting}
          />

          <Textarea
            label="Description (Optional)"
            placeholder="Additional context for guests (e.g. seating instructions, location changes, photo group details)..."
            value={formData.description}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, description: e.target.value }));
              if (errors.description) setErrors((prev) => ({ ...prev, description: "" }));
            }}
            error={errors.description}
            rows={3}
            disabled={submitting}
            helperText={`${formData.description.length}/1000 characters`}
          />

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E3DA]/80">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsFormModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              isLoading={submitting}
              loadingText={editingEvent ? "Saving..." : "Creating..."}
            >
              {editingEvent ? "Save Changes" : "Add Event"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={Boolean(eventToDelete)}
        onClose={() => setEventToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Schedule Event?"
        message={`Are you sure you want to delete '${eventToDelete?.eventName}'? This action cannot be undone.`}
        confirmText="Delete Event"
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
