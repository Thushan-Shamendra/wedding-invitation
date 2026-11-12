"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

const secondsInDay = 86_400;

function targetTimestamp(weddingDate: string) {
  const match = weddingDate.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return new Date(weddingDate).getTime();

  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
}

export function Countdown({ weddingDate }: { weddingDate?: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!weddingDate) return;
    const tick = () => setNow(Date.now());
    const firstTick = window.setTimeout(tick, 0);
    const interval = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(firstTick);
      window.clearInterval(interval);
    };
  }, [weddingDate]);

  if (!weddingDate || now === null) return null;
  const remaining = (targetTimestamp(weddingDate) - now) / 1000;
  if (!Number.isFinite(remaining)) return null;

  const units = [
    { label: "Days", value: Math.floor(remaining / secondsInDay) },
    { label: "Hours", value: Math.floor((remaining % secondsInDay) / 3600) },
    { label: "Minutes", value: Math.floor((remaining % 3600) / 60) },
    { label: "Seconds", value: Math.floor(remaining % 60) },
  ];

  return (
    <section className="wedding-countdown">
      <div className="wedding-container">
        <h2 className="wedding-eyebrow wedding-ruled">Counting Down to Our Special Day</h2>
        {remaining > 0 ? (
          <>
            <p>Every moment brings us closer to celebrating with the people we love most.</p>
            <dl className="wedding-countdown-grid">
              {units.map(({ label, value }) => (
                <div key={label} className="wedding-card wedding-countdown-unit">
                  <dt>{label}</dt>
                  <dd>{String(value).padStart(2, "0")}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : (
          <p className="wedding-card wedding-countdown-message">
            <Heart aria-hidden="true" />
            {remaining > -secondsInDay ? "Today Is Our Special Day!" : "Thank you for celebrating our love with us."}
          </p>
        )}
      </div>
    </section>
  );
}
