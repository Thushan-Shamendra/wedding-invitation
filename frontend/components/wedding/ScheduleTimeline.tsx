import { type CSSProperties } from "react";
import { Clock, Gem, GlassWater, Music2, Utensils } from "lucide-react";
import { ScheduleEvent } from "@/types";
import { formatWeddingTime } from "@/utils/formatters";
import { SectionHeading } from "./SectionHeading";

function eventIcon(name: string) {
  if (/ceremony|vows/i.test(name)) return Gem;
  if (/cocktail|drink|toast/i.test(name)) return GlassWater;
  if (/dinner|lunch|meal/i.test(name)) return Utensils;
  if (/music|dance|celebration|party/i.test(name)) return Music2;
  return Clock;
}

export function ScheduleTimeline({ events }: { events: ScheduleEvent[] }) {
  if (!events.length) return null;

  return (
    <section id="schedule" className="wedding-section wedding-container">
      <SectionHeading label="The Timeline" title="Wedding Schedule" />
      <ol className="wedding-card wedding-timeline" style={{ "--timeline-columns": Math.min(events.length, 4) } as CSSProperties}>
        {events.map((event, index) => {
          const Icon = eventIcon(event.eventName);
          return (
            <li key={event._id || index} className="wedding-timeline-event">
              <span className="wedding-event-icon"><Icon aria-hidden="true" /></span>
              {event.startTime && <p className="wedding-event-time">{formatWeddingTime(event.startTime)}</p>}
              <h3>{event.eventName}</h3>
              {event.description && <p>{event.description}</p>}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
