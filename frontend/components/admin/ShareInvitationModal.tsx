"use client";

import React, { useState, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Guest, Wedding } from "@/types";
import {
  getInvitationUrl,
  buildInvitationShareMessage,
  buildWhatsAppUrl,
  buildSmsUrl,
  normalizePhoneForWhatsApp,
} from "@/utils/shareInvitation";
import {
  Share2,
  Copy,
  Check,
  Link as LinkIcon,
  MessageCircle,
  MessageSquare,
  ExternalLink,
  Phone,
  Mail,
  Users,
} from "lucide-react";

export interface ShareInvitationModalProps {
  guest: Guest | null;
  wedding: Wedding | null;
  isOpen: boolean;
  onClose: () => void;
  onToast?: (message: string, type: "success" | "error") => void;
}

export function ShareInvitationModal({
  guest,
  wedding,
  isOpen,
  onClose,
  onToast,
}: ShareInvitationModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  const invitationUrl = useMemo(() => {
    if (!guest?.invitationToken) return "";
    return getInvitationUrl(guest.invitationToken);
  }, [guest?.invitationToken]);

  const shareMessage = useMemo(() => {
    if (!guest) return "";
    return buildInvitationShareMessage({
      brideName: wedding?.brideName,
      groomName: wedding?.groomName,
      guestName: guest.name,
      personalMessage: guest.personalMessage,
      invitationUrl,
    });
  }, [guest, wedding?.brideName, wedding?.groomName, invitationUrl]);

  const hasPhone = Boolean(guest?.phone && guest.phone.trim());
  const normalizedPhone = useMemo(() => {
    return normalizePhoneForWhatsApp(guest?.phone);
  }, [guest?.phone]);

  const handleCopyLink = async () => {
    if (!invitationUrl) return;
    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopiedLink(true);
      onToast?.("Invitation link copied.", "success");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      onToast?.("Failed to copy link to clipboard.", "error");
    }
  };

  const handleCopyMessage = async () => {
    if (!shareMessage) return;
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopiedMessage(true);
      onToast?.("Invitation message copied.", "success");
      setTimeout(() => setCopiedMessage(false), 2000);
    } catch (err) {
      console.error("Failed to copy message:", err);
      onToast?.("Failed to copy message to clipboard.", "error");
    }
  };

  const handleWhatsApp = () => {
    const waUrl = buildWhatsAppUrl(guest?.phone, shareMessage);
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const handleSms = () => {
    if (!hasPhone) {
      onToast?.("Guest has no phone number for SMS.", "error");
      return;
    }
    const smsUrl = buildSmsUrl(guest?.phone, shareMessage);
    window.location.href = smsUrl;

    // Show desktop advisory toast
    if (typeof window !== "undefined" && !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      onToast?.("SMS sharing is available on supported devices.", "success");
    }
  };

  const handleNativeShare = async () => {
    const coupleTitle =
      wedding?.brideName && wedding?.groomName
        ? `${wedding.brideName} & ${wedding.groomName}'s`
        : "Wedding";

    const shareData = {
      title: `${coupleTitle} Wedding Invitation`,
      text: shareMessage,
      url: invitationUrl,
    };

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share(shareData);
      } catch (err: unknown) {
        // Ignore user cancellation aborts
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Share failed:", err);
          handleCopyMessage();
        }
      }
    } else {
      // Fallback if Web Share API is unsupported
      handleCopyMessage();
      onToast?.("Web Share not supported on this device. Invitation message copied.", "success");
    }
  };

  if (!guest) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Invitation"
      subtitle="Send personalized invitation directly via WhatsApp, SMS, or native share."
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Guest Summary Card */}
        <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E3DA] p-4 sm:p-5 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div>
              <span className="text-[10px] uppercase font-semibold tracking-widest text-[#8C703E]">
                Recipient
              </span>
              <h4 className="text-lg sm:text-xl font-serif font-semibold text-[#26231F]">
                {guest.name}
              </h4>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#746E66]">
              <Users className="w-3.5 h-3.5 text-[#C9A96E]" />
              <span>Allowed Guests: <strong>{guest.maximumGuests}</strong></span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#746E66]">
            {hasPhone ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E8E3DA] text-[#26231F]">
                <Phone className="w-3 h-3 text-[#C9A96E]" />
                <span>{guest.phone}</span>
                {normalizedPhone && (
                  <span className="text-[10px] text-[#8C703E] bg-[#F8F6F1] px-1.5 py-0.5 rounded">
                    WA: +{normalizedPhone}
                  </span>
                )}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200 text-gray-500 italic">
                <Phone className="w-3 h-3 opacity-50" />
                <span>No phone number</span>
              </span>
            )}

            {guest.email && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E8E3DA] text-[#26231F]">
                <Mail className="w-3 h-3 text-[#746E66]" />
                <span className="truncate max-w-[200px]">{guest.email}</span>
              </span>
            )}
          </div>
        </div>

        {/* Invitation Link Input Box */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[#746E66] block mb-1.5">
            Personal Invitation URL
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={invitationUrl}
              className="flex-1 rounded-xl border border-[#E8E3DA] bg-gray-50 px-3.5 py-2 text-xs sm:text-sm font-mono text-[#26231F] outline-none select-all truncate"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCopyLink}
              leftIcon={
                copiedLink ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-[#C9A96E]" />
                )
              }
            >
              {copiedLink ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>

        {/* Message Preview Box */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[#746E66] block mb-1.5">
            Generated Invitation Message Preview
          </label>
          <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E3DA] p-3.5 sm:p-4 text-xs sm:text-sm text-[#26231F] whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto font-sans">
            {shareMessage}
          </div>
        </div>

        {/* Share Action Grid */}
        <div className="pt-2 border-t border-[#E8E3DA]/80 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Copy Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2.5 p-3 rounded-2xl border border-[#E8E3DA] bg-white hover:bg-[#F8F6F1] active:bg-[#EFEAE1] text-xs sm:text-sm font-medium text-[#26231F] transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs"
            >
              {copiedLink ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <LinkIcon className="w-4 h-4 text-[#C9A96E] shrink-0" />
              )}
              <span>{copiedLink ? "Link Copied!" : "Copy Link"}</span>
            </button>

            {/* 2. Copy Message */}
            <button
              type="button"
              onClick={handleCopyMessage}
              className="flex items-center justify-center gap-2.5 p-3 rounded-2xl border border-[#E8E3DA] bg-white hover:bg-[#F8F6F1] active:bg-[#EFEAE1] text-xs sm:text-sm font-medium text-[#26231F] transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs"
            >
              {copiedMessage ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Copy className="w-4 h-4 text-[#C9A96E] shrink-0" />
              )}
              <span>{copiedMessage ? "Message Copied!" : "Copy Message"}</span>
            </button>

            {/* 3. WhatsApp */}
            <button
              type="button"
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-2.5 p-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 active:bg-emerald-200 text-xs sm:text-sm font-medium text-emerald-800 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs"
              title={hasPhone ? `Open WhatsApp for ${guest.phone}` : "Open WhatsApp"}
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{hasPhone ? "WhatsApp" : "WhatsApp (Generic)"}</span>
            </button>

            {/* 4. Message / SMS */}
            <button
              type="button"
              onClick={handleSms}
              disabled={!hasPhone}
              className={`flex items-center justify-center gap-2.5 p-3 rounded-2xl border text-xs sm:text-sm font-medium transition-all duration-200 shadow-2xs ${
                hasPhone
                  ? "border-[#E8E3DA] bg-white hover:bg-[#F8F6F1] active:bg-[#EFEAE1] text-[#26231F] cursor-pointer hover:shadow-xs"
                  : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60"
              }`}
              title={hasPhone ? `Open SMS for ${guest.phone}` : "No phone number available for SMS"}
            >
              <MessageSquare className="w-4 h-4 text-[#C9A96E] shrink-0" />
              <span>Message</span>
            </button>
          </div>

          {/* 5. Native Share Button (Full Width) */}
          <button
            type="button"
            onClick={handleNativeShare}
            className="w-full flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-[#C9A96E] hover:bg-[#B89658] active:bg-[#A68345] text-white text-xs sm:text-sm font-medium transition-all duration-200 shadow-sm hover:shadow cursor-pointer"
          >
            <Share2 className="w-4 h-4 shrink-0" />
            <span>Share Invitation</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
