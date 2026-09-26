/**
 * Utility functions for formatting dates and times in the wedding website.
 */

export function formatWeddingDate(
  dateStr?: string | null,
  options?: { includeWeekday?: boolean }
): string {
  if (!dateStr || typeof dateStr !== "string") return "";

  try {
    // If it's a date-only string like YYYY-MM-DD, parse year, month, day directly
    // to avoid time-zone shifting between UTC and local time
    const match = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
    let date: Date;

    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      date = new Date(year, month, day);
    } else {
      date = new Date(dateStr);
    }

    if (isNaN(date.getTime())) return dateStr;

    const formatterOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    if (options?.includeWeekday) {
      formatterOptions.weekday = "long";
    }

    return new Intl.DateTimeFormat("en-US", formatterOptions).format(date);
  } catch {
    return dateStr;
  }
}

export function formatWeddingTime(timeStr?: string | null): string {
  if (!timeStr || typeof timeStr !== "string") return "";

  const trimmed = timeStr.trim();
  if (!trimmed) return "";

  // Check if it already has AM/PM
  if (/am|pm/i.test(trimmed)) {
    return trimmed;
  }

  // Parse HH:mm or HH:mm:ss
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return trimmed;

  let hours = parseInt(match[1], 10);
  const minutes = match[2];

  if (isNaN(hours)) return trimmed;

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 hour should be 12

  return `${hours}:${minutes} ${ampm}`;
}
