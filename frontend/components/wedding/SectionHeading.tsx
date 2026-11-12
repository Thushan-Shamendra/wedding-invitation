import { Hearts } from "./Hearts";

export function SectionHeading({ label, title }: { label: string; title: string }) {
  return (
    <div className="wedding-heading">
      <p className="wedding-eyebrow wedding-ruled">{label}</p>
      <h2>{title}</h2>
      <div className="wedding-flourish wedding-ruled" aria-hidden="true"><Hearts /></div>
    </div>
  );
}
