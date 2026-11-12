import { formatWeddingDate } from "@/utils/formatters";
import { Hearts } from "./Hearts";

interface WeddingFooterProps {
  brideName?: string;
  groomName?: string;
  weddingDate?: string;
  footerMessage?: string;
}

export function WeddingFooter({ brideName, groomName, weddingDate, footerMessage }: WeddingFooterProps) {
  const coupleNames = [brideName?.trim(), groomName?.trim()].filter(Boolean).join(" & ") || "Our Wedding";
  const formattedDate = formatWeddingDate(weddingDate);

  return (
    <footer className="wedding-footer">
      <div className="wedding-container">
        <Hearts />
        <p className="wedding-footer-names">{coupleNames}</p>
        {formattedDate && <p className="wedding-eyebrow">{formattedDate}</p>}
        <p className="wedding-footer-message">{footerMessage?.trim() || "With love and gratitude"}</p>
      </div>
    </footer>
  );
}
