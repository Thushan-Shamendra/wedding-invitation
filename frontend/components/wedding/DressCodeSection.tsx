import { Shirt } from "lucide-react";

export function DressCodeSection({ dressCode }: { dressCode?: string }) {
  if (!dressCode?.trim()) return null;

  return (
    <section id="dresscode" className="wedding-section wedding-container">
      <div className="wedding-card wedding-attire">
        <Shirt aria-hidden="true" />
        <p className="wedding-eyebrow">Attire</p>
        <h2>Dress Code</h2>
        <p className="wedding-dress-code">{dressCode.trim()}</p>
      </div>
    </section>
  );
}
