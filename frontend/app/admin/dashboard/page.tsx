"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { guestService } from "@/services/guestService";
import { rsvpService } from "@/services/rsvpService";
import { RSVP } from "@/types";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Heart,
  MapPin,
  MailCheck,
  ArrowRight,
  ExternalLink,
  Globe,
  Sparkles,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalGuests: 0,
    attending: 0,
    declined: 0,
    pending: 0,
  });

  const [recentResponses, setRecentResponses] = useState<RSVP[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [liveStats, responses] = await Promise.all([
          guestService.getGuestStats(),
          rsvpService.getRSVPResponses({ limit: 5 }).catch(() => []),
        ]);
        setStats(liveStats);
        setRecentResponses(responses);
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      }
    };

    loadDashboardData();
  }, []);

  const quickActions = [
    {
      title: "Edit Wedding Details",
      description: "Update bride, groom, date, and ceremony times",
      href: "/admin/wedding-details",
      icon: Heart,
    },
    {
      title: "Manage Guests",
      description: "Add new guests and generate personalized links",
      href: "/admin/guests",
      icon: Users,
    },
    {
      title: "View RSVP Responses",
      description: "Review attendance confirmations and meal choices",
      href: "/admin/rsvp",
      icon: MailCheck,
    },
    {
      title: "Edit Venue",
      description: "Manage ceremony & reception locations and maps",
      href: "/admin/venue",
      icon: MapPin,
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#26231F] tracking-tight">
              Welcome Back, Wedding Admin
            </h2>
            <p className="text-sm text-[#746E66] mt-1">
              Here is an overview of your wedding invitation website.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Setup in progress
            </span>
          </div>
        </div>

        {/* 4 Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Total Guests"
            value={stats.totalGuests}
            subtitle="Invited to celebration"
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
            subtitle="Unable to attend"
            icon={<UserX className="w-5 h-5 text-rose-600" />}
            accent="rose"
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            subtitle="Awaiting response"
            icon={<Clock className="w-5 h-5 text-amber-600" />}
            accent="amber"
          />
        </div>

        {/* Main Grid: RSVP & Quick Actions on Left, Website Status on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          {/* Left Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent RSVP Responses Card */}
            <div className="bg-white rounded-2xl border border-[#E8E3DA] p-6 shadow-sm">
              <div className="flex items-center justify-between pb-5 border-b border-[#E8E3DA]/80">
                <div>
                  <h3 className="text-lg font-serif font-semibold text-[#26231F]">
                    Recent RSVP Responses
                  </h3>
                  <p className="text-xs text-[#746E66] mt-0.5">
                    Latest submissions from your invitation recipients
                  </p>
                </div>
                <Link
                  href="/admin/rsvp"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#8C703E] hover:text-[#26231F] transition-colors"
                >
                  <span>View All Responses</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Table or Empty State */}
              {recentResponses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm mt-4">
                    <thead>
                      <tr className="border-b border-[#E8E3DA] text-xs font-medium uppercase tracking-wider text-[#746E66]">
                        <th className="py-3 px-4">Guest Name</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Guests</th>
                        <th className="py-3 px-4 text-right">Response Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E3DA]/60">
                      {recentResponses.map((item) => (
                        <tr key={item._id} className="hover:bg-[#F8F6F1]/50">
                          <td className="py-3 px-4 font-medium text-[#26231F]">
                            {item.guest?.name || "Guest"}
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={item.attendanceStatus} />
                          </td>
                          <td className="py-3 px-4 text-[#746E66]">
                            {item.attendanceStatus === "attending"
                              ? item.numberOfGuests
                              : 0}
                          </td>
                          <td className="py-3 px-4 text-right text-xs text-[#746E66]">
                            {item.submittedAt
                              ? new Date(item.submittedAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  title="No RSVP responses yet."
                  description="Guest responses will appear here once guests RSVP through their invitation links."
                  action={
                    <Link
                      href="/admin/guests"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-[#C9A96E] hover:bg-[#B89658] text-white shadow-xs transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Manage Guests</span>
                    </Link>
                  }
                />
              )}
            </div>

            {/* Quick Actions Section */}
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-serif font-semibold text-[#26231F]">
                  Quick Actions
                </h3>
                <p className="text-xs text-[#746E66] mt-0.5">
                  Frequently accessed wedding administration tools
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      className="group bg-white rounded-2xl border border-[#E8E3DA] p-5 shadow-sm hover:border-[#C9A96E] hover:shadow-md transition-all duration-200 flex items-start gap-4"
                    >
                      <div className="w-11 h-11 rounded-xl bg-[#F8F6F1] border border-[#E8E3DA] text-[#C9A96E] flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-[#C9A96E] group-hover:text-white transition-all duration-200">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-[#26231F] group-hover:text-[#8C703E] transition-colors">
                            {action.title}
                          </h4>
                          <ArrowRight className="w-4 h-4 text-[#746E66] group-hover:text-[#C9A96E] group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <p className="text-xs text-[#746E66] mt-1 leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column (1 Col) */}
          <div className="space-y-6">
            {/* Website Status Card */}
            <div className="bg-white rounded-2xl border border-[#E8E3DA] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#F8F6F1] border border-[#E8E3DA] flex items-center justify-center text-[#C9A96E]">
                    <Globe className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-serif font-semibold text-[#26231F]">
                    Website Status
                  </h3>
                </div>
                <StatusBadge status="draft" label="Draft" />
              </div>

              <p className="text-xs text-[#746E66] leading-relaxed mb-6">
                Your wedding invitation website is currently in draft mode. Complete all wedding details and settings before making it live to guests.
              </p>

              <div className="space-y-2.5">
                <Link
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#E8E3DA] hover:bg-[#F8F6F1] text-xs font-medium text-[#26231F] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#C9A96E]" />
                  <span>Preview Website</span>
                </Link>

                <Link
                  href="/admin/settings"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#F8F6F1] hover:bg-[#ECE6DC] text-xs font-medium text-[#26231F] border border-[#E8E3DA] transition-colors"
                >
                  <span>Website Settings</span>
                </Link>
              </div>
            </div>

            {/* Quick Checklist / Setup Guide Card */}
            <div className="bg-white rounded-2xl border border-[#E8E3DA] p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#F8F6F1] border border-[#E8E3DA] flex items-center justify-center text-[#C9A96E]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-serif font-semibold text-[#26231F]">
                  Setup Checklist
                </h3>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Configure Wedding & Couple Details", href: "/admin/wedding-details" },
                  { label: "Set Ceremony & Reception Venues", href: "/admin/venue" },
                  { label: "Add Wedding Schedule Events", href: "/admin/schedule" },
                  { label: "Customize Invitation Message", href: "/admin/invitation-message" },
                  { label: "Add Wedding Guests", href: "/admin/guests" },
                  { label: "Customize Wedding Theme", href: "/admin/theme" },
                  { label: "Configure Background Music", href: "/admin/music" },
                ].map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F8F6F1] text-xs text-[#746E66] hover:text-[#26231F] transition-colors group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full border border-[#E8E3DA] flex items-center justify-center text-[10px] font-medium text-[#746E66]">
                        {idx + 1}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </span>
                    <ArrowRight className="w-3 h-3 text-[#746E66] group-hover:text-[#C9A96E] shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
