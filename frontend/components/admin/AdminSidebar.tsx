"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authService } from "@/services/authService";
import {
  LayoutDashboard,
  Heart,
  Users2,
  MapPin,
  Calendar,
  Users,
  MailCheck,
  MessageSquare,
  Palette,
  Music,
  Settings,
  LogOut,
  X,
  Sparkles,
} from "lucide-react";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Wedding Details", href: "/admin/wedding-details", icon: Heart },
    { label: "Couple Details", href: "/admin/couple-details", icon: Users2 },
    { label: "Venue", href: "/admin/venue", icon: MapPin },
    { label: "Schedule", href: "/admin/schedule", icon: Calendar },
    { label: "Guests", href: "/admin/guests", icon: Users },
    { label: "RSVP Responses", href: "/admin/rsvp", icon: MailCheck },
    { label: "Invitation Message", href: "/admin/invitation-message", icon: MessageSquare },
    { label: "Theme", href: "/admin/theme", icon: Palette },
    { label: "Music", href: "/admin/music", icon: Music },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[260px] bg-white border-r border-[#E8E3DA] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand / Header */}
        <div className="h-18 px-6 flex items-center justify-between border-b border-[#E8E3DA]">
          <Link
            href="/admin/dashboard"
            onClick={onClose}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F8F6F1] border border-[#E8E3DA] flex items-center justify-center text-[#C9A96E] group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="block font-serif font-semibold text-lg text-[#26231F] leading-tight">
                Wedding Admin
              </span>
              <span className="block text-[11px] uppercase tracking-wider text-[#746E66]">
                Portal Manager
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#746E66] hover:text-[#26231F] hover:bg-[#F8F6F1] lg:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[#746E66]">
            Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#C9A96E]/20 text-[#8C703E] font-semibold shadow-xs"
                    : "text-[#746E66] hover:text-[#26231F] hover:bg-[#F8F6F1]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? "text-[#C9A96E]" : "text-[#746E66]"
                  }`}
                />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C9A96E]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom Section / Logout */}
        <div className="p-4 border-t border-[#E8E3DA]">
          <button
            onClick={() => authService.logout()}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#746E66] hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-[#746E66] group-hover:text-red-600 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
