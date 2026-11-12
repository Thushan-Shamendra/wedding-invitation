"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Hearts } from "./Hearts";

interface WeddingNavbarProps {
  brideName?: string;
  groomName?: string;
  hasDetails: boolean;
  hasVenue: boolean;
  hasSchedule: boolean;
}

export function WeddingNavbar({ brideName, groomName, hasDetails, hasVenue, hasSchedule }: WeddingNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("#home");
  const brandName = [brideName?.trim(), groomName?.trim()].filter(Boolean).join(" & ") || "Our Wedding";

  useEffect(() => {
    const updateLink = () => setActiveLink(window.location.hash || "#home");
    updateLink();
    window.addEventListener("hashchange", updateLink);
    return () => window.removeEventListener("hashchange", updateLink);
  }, []);

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "Our Story", href: "#couple" },
    ...(hasDetails ? [{ label: "Details", href: "#details" }] : []),
    ...(hasVenue ? [{ label: "Venue", href: "#venue" }] : []),
    ...(hasSchedule ? [{ label: "Schedule", href: "#schedule" }] : []),
    { label: "RSVP", href: "#rsvp" },
  ];

  return (
    <header className="wedding-nav">
      <div className="wedding-container wedding-nav-inner">
        <a className="wedding-brand" href="#home" onClick={() => setMobileMenuOpen(false)}>
          <Hearts />
          <span>{brandName}</span>
        </a>
        <button
          className="wedding-menu-button"
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-controls="wedding-navigation"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
        <nav id="wedding-navigation" aria-label="Main navigation" data-open={mobileMenuOpen}>
          {navLinks.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              aria-current={activeLink === href ? "location" : undefined}
              onClick={() => setMobileMenuOpen(false)}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
