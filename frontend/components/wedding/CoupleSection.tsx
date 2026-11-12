import { Heart } from "lucide-react";
import { CouplePortrait } from "./CouplePortrait";
import { SectionHeading } from "./SectionHeading";

interface CoupleSectionProps {
  brideName?: string;
  brideDescription?: string;
  bridePhoto?: string;
  groomName?: string;
  groomDescription?: string;
  groomPhoto?: string;
}

export function CoupleSection({
  brideName,
  brideDescription,
  bridePhoto,
  groomName,
  groomDescription,
  groomPhoto,
}: CoupleSectionProps) {
  const profiles = [
    { role: "The Bride", name: brideName?.trim() || "Bride", description: brideDescription, photo: bridePhoto },
    { role: "The Groom", name: groomName?.trim() || "Groom", description: groomDescription, photo: groomPhoto },
  ];

  return (
    <section id="couple" className="wedding-section wedding-container">
      <SectionHeading label="The Happy Couple" title="Meet the Bride & Groom" />
      <div className="wedding-couple-grid">
        {profiles.map(({ role, name, description, photo }) => (
          <article key={role} className="wedding-card wedding-profile">
            <div className="wedding-profile-photo"><CouplePortrait photo={photo} name={name} /></div>
            <p className="wedding-eyebrow">{role}</p>
            <h3>{name}</h3>
            {description?.trim() && <p className="wedding-profile-description">{description}</p>}
          </article>
        ))}
        <span className="wedding-couple-heart" aria-hidden="true"><Heart fill="currentColor" /></span>
      </div>
    </section>
  );
}
