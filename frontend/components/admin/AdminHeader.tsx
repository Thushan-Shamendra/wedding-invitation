"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Admin } from "@/types";
import { authService } from "@/services/authService";
import {
  Menu,
  ExternalLink,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";

interface AdminHeaderProps {
  title: string;
  onMenuClick: () => void;
  admin?: Admin | null;
}

export function AdminHeader({ title, onMenuClick, admin }: AdminHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const adminName = admin?.name || "Wedding Admin";
  const adminEmail = admin?.email || "admin@wedding.com";
  const initials = adminName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "WA";

  return (
    <header className="sticky top-0 z-30 h-18 bg-white/95 backdrop-blur-sm border-b border-[#E8E3DA] px-4 sm:px-8 flex items-center justify-between gap-4">
      {/* Left side: Hamburger + Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-[#746E66] hover:text-[#26231F] hover:bg-[#F8F6F1] lg:hidden cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl sm:text-2xl font-serif font-semibold text-[#26231F] tracking-tight">
          {title}
        </h1>
      </div>

      {/* Right side: Preview Button & Profile Dropdown */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Preview Website Button */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border border-[#E8E3DA] bg-white hover:bg-[#F8F6F1] text-[#26231F] shadow-xs transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#C9A96E]" />
          <span className="hidden sm:inline">Preview Website</span>
          <span className="sm:hidden">Preview</span>
        </Link>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1 sm:p-1.5 rounded-xl hover:bg-[#F8F6F1] transition-colors cursor-pointer text-left"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div className="w-9 h-9 rounded-full bg-[#F8F6F1] border border-[#C9A96E]/50 flex items-center justify-center text-[#8C703E] font-medium text-xs">
              {initials}
            </div>
            <div className="hidden md:block leading-tight text-left">
              <span className="block text-xs font-semibold text-[#26231F]">
                {adminName}
              </span>
              <span className="block text-[11px] text-[#746E66] truncate max-w-[140px]">
                {adminEmail}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-[#746E66] hidden sm:block" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-[#E8E3DA] shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-[#E8E3DA]/80">
                <p className="text-xs font-semibold text-[#26231F] truncate">
                  {adminName}
                </p>
                <p className="text-xs text-[#746E66] truncate mt-0.5">
                  {adminEmail}
                </p>
              </div>

              <div className="py-1">
                <Link
                  href="/admin/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#26231F] hover:bg-[#F8F6F1] transition-colors"
                >
                  <User className="w-4 h-4 text-[#746E66]" />
                  <span>Profile</span>
                </Link>
                <Link
                  href="/admin/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#26231F] hover:bg-[#F8F6F1] transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#746E66]" />
                  <span>Settings</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-[#E8E3DA]/80">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    authService.logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
