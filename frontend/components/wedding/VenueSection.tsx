"use client";

import { useState } from "react";
import { ArrowUpRight, Building2, MapPin } from "lucide-react";
import { getVenueQuery, InvitationVenue } from "@/utils/weddingVenues";
import { SectionHeading } from "./SectionHeading";

export function VenueSection({ venues }: { venues: InvitationVenue[] }) {
  const [activeVenue, setActiveVenue] = useState<InvitationVenue["id"]>("ceremony");
  const venue = venues.find(({ id }) => id === activeVenue) || venues[0];
  if (!venue) return null;

  const query = encodeURIComponent(getVenueQuery(venue));
  const mapsLink = venue.mapUrl?.trim() || `https://www.google.com/maps/search/?api=1&query=${query}`;
  const directionsLink = query ? `https://www.google.com/maps/dir/?api=1&destination=${query}` : mapsLink;

  return (
    <section id="venue" className="wedding-section wedding-container">
      <SectionHeading label="Locations & Directions" title="Venues & Maps" />
      {venues.length > 1 && (
        <div className="wedding-actions wedding-venue-switch" role="group" aria-label="Select a venue">
          {venues.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              aria-pressed={venue.id === id}
              className={`wedding-button wedding-button-${venue.id === id ? "gold" : "outline"}`}
              onClick={() => setActiveVenue(id)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      <article className="wedding-card wedding-venue-card">
        <div className="wedding-venue-content">
          <p className="wedding-eyebrow"><MapPin aria-hidden="true" /> {venue.label}</p>
          <h3>{venue.name || venue.hall || "Wedding Venue"}</h3>
          {(venue.address || (venue.hall && venue.name)) && (
            <div className="wedding-venue-address">
              <Building2 aria-hidden="true" />
              <div>
                {venue.hall && venue.name && <p>{venue.hall}</p>}
                {venue.address && <p>{venue.address}</p>}
              </div>
            </div>
          )}
          <div className="wedding-actions">
            <a className="wedding-button wedding-button-gold" href={directionsLink} target="_blank" rel="noopener noreferrer">Get Directions <ArrowUpRight aria-hidden="true" /></a>
            <a className="wedding-button wedding-button-outline" href={mapsLink} target="_blank" rel="noopener noreferrer"><MapPin aria-hidden="true" /> Open in Google Maps</a>
          </div>
        </div>
        <div className="wedding-map">
          {query ? (
            <iframe
              title={`Map for ${venue.name || venue.label}`}
              src={`https://maps.google.com/maps?q=${query}&hl=en&z=15&output=embed`}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <a href={mapsLink} target="_blank" rel="noopener noreferrer"><MapPin aria-hidden="true" /> View venue on Google Maps</a>
          )}
        </div>
      </article>
    </section>
  );
}
