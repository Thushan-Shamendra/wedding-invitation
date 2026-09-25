export type ThemeStyle = "classic" | "modern" | "minimal" | "luxury";

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
  themeStyle: ThemeStyle;
}

export const DEFAULT_THEME: ThemeConfig = {
  primaryColor: "#C9A96E",
  secondaryColor: "#D8B4A0",
  backgroundColor: "#F8F6F1",
  textColor: "#26231F",
  headingFont: "Playfair Display",
  bodyFont: "Inter",
  themeStyle: "luxury",
};

export const HEADING_FONTS = [
  "Playfair Display",
  "Cormorant Garamond",
  "Libre Baskerville",
  "DM Serif Display",
] as const;

export const BODY_FONTS = [
  "Inter",
  "Poppins",
  "Lato",
  "Montserrat",
  "Open Sans",
] as const;

export const HEADING_FONT_MAP: Record<string, string> = {
  "Playfair Display": "var(--font-playfair), 'Playfair Display', Georgia, serif",
  "Cormorant Garamond": "'Cormorant Garamond', 'Garamond', Georgia, serif",
  "Libre Baskerville": "'Libre Baskerville', 'Baskerville', Georgia, serif",
  "DM Serif Display": "'DM Serif Display', Georgia, serif",
};

export const BODY_FONT_MAP: Record<string, string> = {
  "Inter": "var(--font-inter), 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  "Poppins": "'Poppins', 'Segoe UI', Roboto, sans-serif",
  "Lato": "'Lato', 'Segoe UI', Roboto, sans-serif",
  "Montserrat": "'Montserrat', 'Segoe UI', Roboto, sans-serif",
  "Open Sans": "'Open Sans', 'Segoe UI', Roboto, sans-serif",
};

export interface ThemeStyleOption {
  id: ThemeStyle;
  name: string;
  description: string;
  badge: string;
}

export const THEME_STYLE_OPTIONS: ThemeStyleOption[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional and elegant wedding styling with centered symmetry and timeless serif flourishes.",
    badge: "Traditional & Elegant",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Clean contemporary layout with crisp contrast, clean borders, and fresh typography.",
    badge: "Clean & Contemporary",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple and spacious design with generous breathing room, subtle lines, and understated beauty.",
    badge: "Spacious & Clean",
  },
  {
    id: "luxury",
    name: "Luxury",
    description: "Premium romantic appearance with champagne gold accents, gilded framing, and opulent aesthetics.",
    badge: "Champagne & Gold",
  },
];

export const isValidHexColor = (color: string): boolean => {
  if (!color || typeof color !== "string") return false;
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color.trim());
};
