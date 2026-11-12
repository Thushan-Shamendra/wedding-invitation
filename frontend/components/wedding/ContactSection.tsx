import { Headset, Phone, UserRound } from "lucide-react";

interface ContactSectionProps {
  contactBride?: string;
  contactGroom?: string;
  contactCoordinator?: string;
  brideName?: string;
  groomName?: string;
}

export function ContactSection({ contactBride, contactGroom, contactCoordinator, brideName, groomName }: ContactSectionProps) {
  const contacts = [
    { role: "The Bride", name: brideName || "Bride", phone: contactBride, Icon: UserRound },
    { role: "The Groom", name: groomName || "Groom", phone: contactGroom, Icon: UserRound },
    { role: "Wedding Coordinator", name: "Event Logistics & Inquiries", phone: contactCoordinator, Icon: Headset },
  ].filter(({ phone }) => phone?.trim());

  if (!contacts.length) return null;

  return (
    <section id="contact" className="wedding-section wedding-container wedding-contact">
      <p className="wedding-eyebrow wedding-ruled">Questions &amp; Support</p>
      <h2>Need Help?</h2>
      <p>Reach out with questions about travel, accommodation, or other details.</p>
      <div className="wedding-contacts">
        {contacts.map(({ role, name, phone, Icon }) => (
          <article key={role} className="wedding-card wedding-contact-card">
            <Icon aria-hidden="true" />
            <h3>{name}</h3>
            <p>{role}</p>
            <a href={`tel:${phone?.replace(/[^0-9+]/g, "")}`}><Phone aria-hidden="true" /> {phone}</a>
          </article>
        ))}
      </div>
    </section>
  );
}
