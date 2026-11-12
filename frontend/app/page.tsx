"use client";

import { useEffect, useState, useMemo, Suspense, type CSSProperties } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { weddingService } from "@/services/weddingService";
import { scheduleService } from "@/services/scheduleService";
import { Wedding, ScheduleEvent } from "@/types";
import {
  DEFAULT_THEME,
  HEADING_FONT_MAP,
  BODY_FONT_MAP,
  ThemeStyle,
  ThemeConfig,
} from "@/utils/theme";
import {
  Clock,
  ShieldCheck,
  AlertCircle,
  Heart,
} from "lucide-react";
import { getVenueQuery, getWeddingVenues } from "@/utils/weddingVenues";
import { WeddingNavbar } from "@/components/wedding/WeddingNavbar";
import { HeroSection } from "@/components/wedding/HeroSection";
import { Countdown } from "@/components/wedding/Countdown";
import { CoupleSection } from "@/components/wedding/CoupleSection";
import { WeddingDetails } from "@/components/wedding/WeddingDetails";
import { VenueSection } from "@/components/wedding/VenueSection";
import { ScheduleTimeline } from "@/components/wedding/ScheduleTimeline";
import { DressCodeSection } from "@/components/wedding/DressCodeSection";
import { RSVPInfoSection } from "@/components/wedding/RSVPInfoSection";
import { ContactSection } from "@/components/wedding/ContactSection";
import { WeddingFooter } from "@/components/wedding/WeddingFooter";
import { MusicPlayer } from "@/components/wedding/MusicPlayer";
import "./wedding.css";

function HomeContent() {
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const searchParams = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(false);
        const [weddingData, scheduleData] = await Promise.all([
          weddingService.getWeddingDetails(),
          scheduleService.getScheduleEvents().catch((err) => {
            console.warn("Could not load schedule events:", err);
            return [] as ScheduleEvent[];
          }),
        ]);

        if (isMounted) {
          setWedding(weddingData);
          setScheduleEvents(scheduleData || []);
        }
      } catch (err) {
        console.error("Failed to load public wedding details:", err);
        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const theme: ThemeConfig = useMemo(() => {
    return {
      primaryColor: wedding?.primaryColor || DEFAULT_THEME.primaryColor,
      secondaryColor: wedding?.secondaryColor || DEFAULT_THEME.secondaryColor,
      backgroundColor: wedding?.backgroundColor || DEFAULT_THEME.backgroundColor,
      textColor: wedding?.textColor || DEFAULT_THEME.textColor,
      headingFont: wedding?.headingFont || DEFAULT_THEME.headingFont,
      bodyFont: wedding?.bodyFont || DEFAULT_THEME.bodyFont,
      themeStyle: (wedding?.themeStyle as ThemeStyle) || DEFAULT_THEME.themeStyle,
    };
  }, [wedding]);

  const headingFontFamily =
    HEADING_FONT_MAP[theme.headingFont] || "Georgia, serif";
  const bodyFontFamily =
    BODY_FONT_MAP[theme.bodyFont] || "sans-serif";

  // Minimal elegant loading state
  if (loading) {
    return (
      <div
        className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#F8F6F1] text-[#26231F]"
        style={{
          backgroundColor: theme.backgroundColor,
          color: theme.textColor,
        }}
      >
        <div className="flex flex-col items-center gap-4 text-center animate-fade-in">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center border shadow-xs animate-pulse"
            style={{
              borderColor: `${theme.secondaryColor}80`,
              backgroundColor: `${theme.primaryColor}15`,
            }}
          >
            <Heart className="w-6 h-6" style={{ color: theme.primaryColor }} />
          </div>
          <div className="space-y-1">
            <h2
              className="text-xl font-serif font-medium tracking-tight"
              style={{ fontFamily: headingFontFamily }}
            >
              Loading Our Special Day...
            </h2>
            <p className="text-xs opacity-60">Preparing your wedding invitation</p>
          </div>
        </div>
      </div>
    );
  }

  // Graceful error state (no MongoDB technical stack traces exposed)
  if (error || !wedding) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center p-6 bg-[#F8F6F1] text-[#26231F]"
        style={{
          backgroundColor: theme.backgroundColor,
          color: theme.textColor,
        }}
      >
        <div
          className="w-full max-w-md bg-white rounded-3xl border p-8 sm:p-10 shadow-sm text-center space-y-4"
          style={{ borderColor: `${theme.secondaryColor}80` }}
        >
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>

          <h1
            className="text-2xl font-serif font-semibold"
            style={{ fontFamily: headingFontFamily }}
          >
            Invitation Unavailable
          </h1>

          <p className="text-sm opacity-75 leading-relaxed">
            Unable to load the wedding invitation. Please try again later.
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl text-xs font-medium text-white shadow-2xs transition-all hover:opacity-95 cursor-pointer"
              style={{ backgroundColor: theme.primaryColor }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isDraft = wedding.websiteStatus === "draft" && !isPreview;

  const venues = getWeddingVenues(wedding);
  const detailVenues = venues.filter(({ name, address, time, description, hall }) => name || address || time || description || hall);
  const mapVenues = venues.filter((venue) => getVenueQuery(venue) || venue.mapUrl?.trim());
  const primaryLocation =
    wedding.ceremonyVenueName ||
    wedding.ceremonyVenue?.name ||
    wedding.receptionVenueName ||
    wedding.receptionVenue?.name ||
    "";
  const invitationStyle = {
    "--wedding-gold": theme.primaryColor,
    "--wedding-secondary": theme.secondaryColor,
    "--wedding-background": theme.backgroundColor,
    "--wedding-ink": theme.textColor,
    "--wedding-serif": headingFontFamily,
  } as CSSProperties;

  return (
    <div
      className="min-h-screen w-full transition-colors duration-200 selection:bg-amber-100 selection:text-amber-900"
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: bodyFontFamily,
      }}
    >
      {/* Draft Mode Gatekeeper */}
      {isDraft ? (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div
            className="w-full max-w-lg bg-white p-8 sm:p-12 text-center relative overflow-hidden rounded-3xl border shadow-sm transition-all duration-200"
            style={{ borderColor: theme.secondaryColor }}
          >
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full border mb-6 shadow-xs"
              style={{
                backgroundColor: `${theme.primaryColor}15`,
                color: theme.primaryColor,
                borderColor: theme.secondaryColor,
              }}
            >
              <Clock className="w-8 h-8" />
            </div>

            <h1
              className="text-3xl font-medium tracking-tight mb-3"
              style={{
                fontFamily: headingFontFamily,
                color: theme.textColor,
              }}
            >
              Our Wedding Website Is Coming Soon
            </h1>

            <p className="text-sm opacity-80 max-w-sm mx-auto leading-relaxed">
              We are currently putting together the final details for our special day. Please check back soon!
            </p>
          </div>
        </div>
      ) : (
        /* Complete Published or Admin Preview Wedding Invitation */
        <main className="wedding-site" data-theme={theme.themeStyle} style={invitationStyle}>
          {/* Admin Preview Floating Indicator */}
          {isPreview && (
            <aside
              aria-label="Admin Preview Mode Indicator"
              className="fixed top-20 right-4 sm:right-6 z-50 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50/95 backdrop-blur-md border border-amber-300 text-amber-900 text-xs font-medium shadow-md"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Admin Preview Mode</span>
              <Link
                href="/admin/settings"
                className="text-[11px] underline font-semibold ml-1 hover:text-amber-950"
              >
                Settings
              </Link>
            </aside>
          )}

          {/* 1. Navbar */}
          <WeddingNavbar
            brideName={wedding.brideName}
            groomName={wedding.groomName}
            hasDetails={detailVenues.length > 0}
            hasVenue={mapVenues.length > 0}
            hasSchedule={scheduleEvents.length > 0}
          />

          {/* 2. Hero Section */}
          <HeroSection
            invitationHeading={wedding.invitationHeading}
            invitationMessage={wedding.invitationMessage}
            brideName={wedding.brideName}
            groomName={wedding.groomName}
            weddingDate={wedding.weddingDate}
            location={primaryLocation}
          />

          {/* 3. Countdown Section */}
          <Countdown weddingDate={wedding.weddingDate} />

          {/* 4. Couple Section */}
          <CoupleSection
            brideName={wedding.brideName}
            brideDescription={wedding.brideDescription}
            bridePhoto={wedding.bridePhoto}
            groomName={wedding.groomName}
            groomDescription={wedding.groomDescription}
            groomPhoto={wedding.groomPhoto}
          />

          {/* 5. Wedding Details (Ceremony & Reception) */}
          <WeddingDetails venues={detailVenues} />

          {/* 6. Venue & Maps Section */}
          <VenueSection venues={mapVenues} />

          {/* 7. Schedule Timeline */}
          <ScheduleTimeline events={scheduleEvents} />

          {/* 8. Dress Code Section */}
          <DressCodeSection dressCode={wedding.dressCode} />

          {/* 9. RSVP Information Section */}
          <RSVPInfoSection
            rsvpEnabled={wedding.rsvpEnabled}
            contactCoordinator={wedding.contactCoordinator}
          />

          {/* 10. Contact Section */}
          <ContactSection
            contactBride={wedding.contactBride}
            contactGroom={wedding.contactGroom}
            contactCoordinator={wedding.contactCoordinator}
            brideName={wedding.brideName}
            groomName={wedding.groomName}
          />

          {/* 11. Footer */}
          <WeddingFooter
            brideName={wedding.brideName}
            groomName={wedding.groomName}
            weddingDate={wedding.weddingDate}
            footerMessage={wedding.footerMessage}
          />
        </main>
      )}

      {/* 12. Floating Background Music Player */}
      {wedding.musicEnabled && (wedding.backgroundMusicUrl || wedding.musicUrl) && (
        <MusicPlayer
          url={(wedding.backgroundMusicUrl || wedding.musicUrl) as string}
          title={wedding.musicTitle || "Wedding Music"}
          theme={theme}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F6F1] flex items-center justify-center text-sm text-[#746E66]">
          Loading Wedding Invitation...
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
