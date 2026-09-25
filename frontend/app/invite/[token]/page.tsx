"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { guestService } from "@/services/guestService";
import { PublicGuestInvitation } from "@/types";
import { Sparkles, Users, Heart, AlertCircle, ArrowRight } from "lucide-react";

export default function PublicInvitationPage() {
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [guest, setGuest] = useState<PublicGuestInvitation | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!token) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const fetchInvitation = async () => {
      try {
        setLoading(true);
        const data = await guestService.getGuestByInvitationToken(token);
        setGuest(data);
      } catch (err) {
        console.error("Failed to load invitation:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#F8F6F1]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-[#746E66]">
            Loading Invitation...
          </p>
        </div>
      </div>
    );
  }

  if (notFound || !guest) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#F8F6F1] text-[#26231F]">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#E8E3DA] p-8 sm:p-10 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-serif font-semibold text-[#26231F]">
            Invitation Not Found
          </h1>

          <p className="text-sm text-[#746E66] leading-relaxed">
            The invitation link may be invalid or no longer available.
          </p>

          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[#E8E3DA] bg-[#F8F6F1] hover:bg-[#EFEAE1] text-xs font-medium text-[#26231F] transition-colors"
            >
              <span>Go to Wedding Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#F8F6F1] text-[#26231F]">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-[#E8E3DA] p-8 sm:p-12 shadow-sm relative overflow-hidden text-center space-y-6">
        {/* Top Gold Border Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent" />

        {/* Monogram / Icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#FAF8F5] border border-[#E8E3DA] text-[#C9A96E] shadow-xs">
          <Sparkles className="w-6 h-6" />
        </div>

        {/* Header Tag */}
        <div>
          <span className="text-[11px] uppercase tracking-widest font-semibold text-[#8C703E]">
            Wedding Invitation
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-medium text-[#26231F] tracking-tight mt-2">
            Dear {guest.name},
          </h1>
        </div>

        {/* Personalized Message Card */}
        {guest.personalMessage && (
          <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E3DA] p-5 text-sm text-[#746E66] italic leading-relaxed">
            "{guest.personalMessage}"
          </div>
        )}

        {/* Formal Invitation Text */}
        <p className="text-sm sm:text-base text-[#746E66] leading-relaxed">
          You are warmly invited to celebrate our special day with us.
        </p>

        {/* Guest Allocation Pill */}
        <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E3DA] text-xs font-medium text-[#26231F]">
          <Users className="w-4 h-4 text-[#C9A96E]" />
          <span>
            Allowed Guests: <strong className="text-[#8C703E]">Up to {guest.maximumGuests} guest{guest.maximumGuests > 1 ? "s" : ""}</strong>
          </span>
        </div>

        {/* Decorative Divider */}
        <div className="flex items-center justify-center my-6">
          <div className="h-[1px] w-16 bg-[#E8E3DA]" />
          <Heart className="w-4 h-4 text-[#C9A96E] mx-3" />
          <div className="h-[1px] w-16 bg-[#E8E3DA]" />
        </div>

        {/* Action Button */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl bg-[#C9A96E] hover:bg-[#B89658] active:bg-[#A68345] text-white font-medium shadow-sm transition-all duration-200 cursor-pointer"
          >
            <span>View Wedding Invitation</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Footer Note */}
        <div className="pt-4 border-t border-[#E8E3DA]/80">
          <p className="text-[11px] text-[#746E66]/70">
            Personal invitation token: <code className="bg-[#F8F6F1] px-1.5 py-0.5 rounded text-[#26231F]">{guest.invitationToken}</code>
          </p>
        </div>
      </div>
    </div>
  );
}
