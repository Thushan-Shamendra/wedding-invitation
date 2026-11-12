import { CalendarDays, Church, Clock, GlassWater, MapPin } from "lucide-react";
import { formatWeddingDate, formatWeddingTime } from "@/utils/formatters";
import { InvitationVenue } from "@/utils/weddingVenues";
import { SectionHeading } from "./SectionHeading";

export function WeddingDetails({ venues }: { venues: InvitationVenue[] }) {
  if (!venues.length) return null;

  return (
    <section id="details" className="wedding-section wedding-container">
      <SectionHeading label="The Celebration" title="Wedding Details" />
      <div className="wedding-details-list">
        {venues.map((venue) => {
          const Icon = venue.id === "ceremony" ? Church : GlassWater;
          const date = formatWeddingDate(venue.date, { includeWeekday: true });
          const time = formatWeddingTime(venue.time);

          return (
            <article key={venue.id} className="wedding-card wedding-details-card">
              <Icon className="wedding-details-icon" aria-hidden="true" />
              <div>
                <h3 className="wedding-eyebrow">{venue.label}</h3>
                {venue.description && <p className="wedding-details-description">{venue.description}</p>}
                <ul className="wedding-details-meta">
                  {date && <li><CalendarDays aria-hidden="true" /><span>{date}</span></li>}
                  {time && <li><Clock aria-hidden="true" /><span>{time}</span></li>}
                  {(venue.name || venue.hall || venue.address) && (
                    <li>
                      <MapPin aria-hidden="true" />
                      <div>
                        {venue.name && <strong>{venue.name}</strong>}
                        {venue.hall && <span>{venue.hall}</span>}
                        {venue.address && <span>{venue.address}</span>}
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
