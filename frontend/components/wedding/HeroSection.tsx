import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { formatWeddingDate } from "@/utils/formatters";

interface HeroSectionProps {
  invitationHeading?: string;
  invitationMessage?: string;
  brideName?: string;
  groomName?: string;
  weddingDate?: string;
  location?: string;
}

export function HeroSection({
  invitationHeading,
  invitationMessage,
  brideName,
  groomName,
  weddingDate,
  location,
}: HeroSectionProps) {
  const formattedDate = formatWeddingDate(weddingDate, { includeWeekday: true });

  return (
    <section id="home" className="wedding-hero">
      <div className="wedding-hero-content">
        <p className="wedding-eyebrow wedding-ruled">{invitationHeading?.trim() || "The Wedding Of"}</p>
        <h1>
          <span>{brideName?.trim() || "Bride"}</span>
          <span className="wedding-ampersand wedding-ruled">&amp;</span>
          <span>{groomName?.trim() || "Groom"}</span>
        </h1>
        {(formattedDate || location) && (
          <div className="wedding-hero-meta">
            {formattedDate && <span><CalendarDays aria-hidden="true" /> {formattedDate}</span>}
            {location && <span><MapPin aria-hidden="true" /> {location}</span>}
          </div>
        )}
        <p className="wedding-hero-message">
          {invitationMessage?.trim() || "We warmly invite you to celebrate our union with family and friends."}
        </p>
        <div className="wedding-actions">
          <a className="wedding-button wedding-button-gold" href="#couple">View Our Wedding <ArrowRight aria-hidden="true" /></a>
          <a className="wedding-button wedding-button-outline" href="#rsvp"><CalendarDays aria-hidden="true" /> RSVP Information</a>
        </div>
      </div>
    </section>
  );
}
