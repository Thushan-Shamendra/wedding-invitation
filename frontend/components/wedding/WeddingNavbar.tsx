"use client";

import React, { useState, useEffect } from "react";
import { Menu, X, Heart } from "lucide-react";
import { ThemeConfig, HEADING_FONT_MAP } from "@/utils/theme";

interface WeddingNavbarProps {
  brideName?: string;
  groomName?: string;
  theme: ThemeConfig;
  hasSchedule?: boolean;
}

export function WeddingNavbar({
  brideName,
  groomName,
  theme,
  hasSchedule = true,
}: WeddingNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headingFontFamily =
    HEADING_FONT_MAP[theme.headingFont] || "Georgia, serif";

  const brandName =
    brideName && groomName
      ? `${brideName} & ${groomName}`
      : brideName || groomName || "Our Wedding";

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "Our Story", href: "#couple" },
    { label: "Details", href: "#details" },
    { label: "Venue", href: "#venue" },
    ...(hasSchedule ? [{ label: "Schedule", href: "#schedule" }] : []),
    { label: "RSVP", href: "#rsvp" },
  ];

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-xs py-3 border-b"
          : "bg-transparent py-5"
      }`}
      style={{
        borderColor: scrolled ? `${theme.secondaryColor}40` : "transparent",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand / Couple Monogram */}
        <a
          href="#home"
          onClick={(e) => handleLinkClick(e, "#home")}
          className="group flex items-center gap-2 text-lg sm:text-xl font-semibold tracking-tight transition-transform hover:scale-102"
          style={{
            fontFamily: headingFontFamily,
            color: theme.textColor,
          }}
        >
          <Heart
            className="w-4 h-4 transition-transform group-hover:scale-110"
            style={{ color: theme.primaryColor, fill: `${theme.primaryColor}30` }}
          />
          <span>{brandName}</span>
        </a>

        {/* Desktop Navigation Links */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-6 lg:gap-8 text-xs lg:text-sm font-medium tracking-wide uppercase"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="relative py-1 transition-colors hover:opacity-100 group"
              style={{
                color: theme.textColor,
                opacity: 0.8,
              }}
            >
              <span>{link.label}</span>
              <span
                className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                style={{ backgroundColor: theme.primaryColor }}
              />
            </a>
          ))}
        </nav>

        {/* Mobile Menu Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          className="md:hidden p-2 rounded-xl border transition-colors cursor-pointer"
          style={{
            borderColor: `${theme.secondaryColor}60`,
            backgroundColor: `${theme.backgroundColor}CC`,
            color: theme.textColor,
          }}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-b shadow-lg transition-all px-6 py-6 space-y-4"
          style={{
            backgroundColor: theme.backgroundColor,
            borderColor: `${theme.secondaryColor}50`,
          }}
        >
          <nav aria-label="Mobile Navigation" className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="px-4 py-3 rounded-xl text-base font-medium transition-colors flex items-center justify-between"
                style={{
                  color: theme.textColor,
                  backgroundColor: "rgba(255, 255, 255, 0.6)",
                  border: `1px solid ${theme.secondaryColor}30`,
                }}
              >
                <span>{link.label}</span>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: theme.primaryColor }}
                />
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
