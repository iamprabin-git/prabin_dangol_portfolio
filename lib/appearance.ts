import type { AppearanceSettings, ThemePalette } from "./types";

export const FONT_SIZES = {
  sm: { label: "Small", value: "15px" },
  md: { label: "Medium", value: "16px" },
  lg: { label: "Large", value: "18px" },
  xl: { label: "Extra large", value: "20px" },
} as const;

export const RADIUS_OPTIONS = {
  sharp: { label: "Sharp", box: "2px", card: "6px" },
  soft: { label: "Soft", box: "12px", card: "16px" },
  round: { label: "Round", box: "22px", card: "28px" },
} as const;

export const FONT_SANS = {
  outfit: { label: "Outfit", family: "var(--font-outfit), sans-serif", href: "" },
  inter: {
    label: "Inter",
    family: "Inter, sans-serif",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
  },
  poppins: {
    label: "Poppins",
    family: "Poppins, sans-serif",
    href: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap",
  },
  "space-grotesk": {
    label: "Space Grotesk",
    family: '"Space Grotesk", sans-serif',
    href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap",
  },
  "dm-sans": {
    label: "DM Sans",
    family: '"DM Sans", sans-serif',
    href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap",
  },
} as const;

export const FONT_DISPLAY = {
  syne: { label: "Syne", family: "var(--font-syne), sans-serif", href: "" },
  playfair: {
    label: "Playfair Display",
    family: '"Playfair Display", serif',
    href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&display=swap",
  },
  fraunces: {
    label: "Fraunces",
    family: "Fraunces, serif",
    href: "https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700;800&display=swap",
  },
  oswald: {
    label: "Oswald",
    family: "Oswald, sans-serif",
    href: "https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&display=swap",
  },
  "source-serif": {
    label: "Source Serif",
    family: '"Source Serif 4", serif',
    href: "https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@600;700;800&display=swap",
  },
} as const;

export const FONT_MONO = {
  geist: { label: "Geist Mono", family: "var(--font-geist-mono), ui-monospace, monospace", href: "" },
  "ibm-plex": {
    label: "IBM Plex Mono",
    family: '"IBM Plex Mono", ui-monospace, monospace',
    href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap",
  },
  "jetbrains-mono": {
    label: "JetBrains Mono",
    family: '"JetBrains Mono", ui-monospace, monospace',
    href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap",
  },
} as const;

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isHex(value: string) {
  return HEX.test(value.trim());
}

function hex(value: string, fallback: string) {
  const next = value.trim();
  return isHex(next) ? next : fallback;
}

function expandHex(value: string) {
  const raw = value.trim();
  if (/^#[0-9a-f]{3}$/i.test(raw)) {
    return `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`;
  }
  return raw;
}

function parseRgb(value: string) {
  const full = expandHex(value).slice(1);
  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16),
  };
}

function withAlpha(value: string, alpha: number) {
  const { r, g, b } = parseRgb(value);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function onAccent(accent: string) {
  const { r, g, b } = parseRgb(accent);
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luma > 0.62 ? "#07080b" : "#f3f1ea";
}

export const defaultPalette = {
  dark: {
    bg: "#07080b",
    bgSoft: "#101218",
    bgPanel: "#16181f",
    text: "#f3f1ea",
    muted: "#9a9c96",
    accent: "#c6f135",
    accent2: "#ff7a45",
  },
  light: {
    bg: "#f3efe6",
    bgSoft: "#e8e2d6",
    bgPanel: "#fffcf7",
    text: "#16140f",
    muted: "#6a655b",
    accent: "#4f6d00",
    accent2: "#c2471d",
  },
} satisfies { dark: ThemePalette; light: ThemePalette };

export const defaultAppearance: AppearanceSettings = {
  fontSize: "md",
  fontSans: "outfit",
  fontDisplay: "syne",
  fontMono: "geist",
  radius: "sharp",
  dark: defaultPalette.dark,
  light: defaultPalette.light,
};

export const COLOR_PRESETS: Array<{ id: string; label: string; dark: ThemePalette; light: ThemePalette }> = [
  { id: "default", label: "Studio", ...defaultPalette },
  {
    id: "ocean",
    label: "Ocean",
    dark: {
      bg: "#071018",
      bgSoft: "#0c1a24",
      bgPanel: "#122331",
      text: "#e7f3f8",
      muted: "#8aa4b3",
      accent: "#4fd1c5",
      accent2: "#63b3ed",
    },
    light: {
      bg: "#eef6f8",
      bgSoft: "#dcecef",
      bgPanel: "#ffffff",
      text: "#10222b",
      muted: "#4f6b75",
      accent: "#0f766e",
      accent2: "#1d4e89",
    },
  },
  {
    id: "violet",
    label: "Violet",
    dark: {
      bg: "#0d0814",
      bgSoft: "#171022",
      bgPanel: "#1e1630",
      text: "#f4eefc",
      muted: "#a898bc",
      accent: "#c084fc",
      accent2: "#fb7185",
    },
    light: {
      bg: "#f6f1fb",
      bgSoft: "#ece4f5",
      bgPanel: "#fffdfd",
      text: "#1b1326",
      muted: "#6b5c7a",
      accent: "#6d28d9",
      accent2: "#be123c",
    },
  },
  {
    id: "warm",
    label: "Warm",
    dark: {
      bg: "#120c08",
      bgSoft: "#1c140e",
      bgPanel: "#261b14",
      text: "#f8efe4",
      muted: "#b3a090",
      accent: "#fbbf24",
      accent2: "#fb7185",
    },
    light: {
      bg: "#f7f1e8",
      bgSoft: "#eee4d6",
      bgPanel: "#fffaf3",
      text: "#1c140e",
      muted: "#6f6256",
      accent: "#b45309",
      accent2: "#9f1239",
    },
  },
];

export function sanitizeAppearance(input: Partial<AppearanceSettings> | null | undefined): AppearanceSettings {
  const base = defaultAppearance;
  const extra = input || {};
  const fontSize = extra.fontSize && extra.fontSize in FONT_SIZES ? extra.fontSize : base.fontSize;
  const fontSans = extra.fontSans && extra.fontSans in FONT_SANS ? extra.fontSans : base.fontSans;
  const fontDisplay = extra.fontDisplay && extra.fontDisplay in FONT_DISPLAY ? extra.fontDisplay : base.fontDisplay;
  const fontMono = extra.fontMono && extra.fontMono in FONT_MONO ? extra.fontMono : base.fontMono;
  const radius = extra.radius && extra.radius in RADIUS_OPTIONS ? extra.radius : base.radius;

  const palette = (from: ThemePalette | undefined, fallback: ThemePalette): ThemePalette => ({
    bg: hex(from?.bg || "", fallback.bg),
    bgSoft: hex(from?.bgSoft || "", fallback.bgSoft),
    bgPanel: hex(from?.bgPanel || "", fallback.bgPanel),
    text: hex(from?.text || "", fallback.text),
    muted: hex(from?.muted || "", fallback.muted),
    accent: hex(from?.accent || "", fallback.accent),
    accent2: hex(from?.accent2 || "", fallback.accent2),
  });

  return {
    fontSize,
    fontSans,
    fontDisplay,
    fontMono,
    radius,
    dark: palette(extra.dark, base.dark),
    light: palette(extra.light, base.light),
  };
}

function themeBlock(selector: string, palette: ThemePalette) {
  const on = onAccent(palette.accent);
  return `${selector} {
  --bg: ${palette.bg};
  --bg-soft: ${palette.bgSoft};
  --bg-panel: ${palette.bgPanel};
  --text: ${palette.text};
  --muted: ${palette.muted};
  --accent: ${palette.accent};
  --accent-2: ${palette.accent2};
  --on-accent: ${on};
  --line: ${withAlpha(palette.text, 0.12)};
  --overlay: ${withAlpha(palette.bg, 0.82)};
  --on-overlay: ${palette.text};
  --header-bg: ${withAlpha(palette.bg, 0.72)};
  --header-bg-scrolled: ${withAlpha(palette.bg, 0.92)};
  --grid-line: ${withAlpha(palette.text, 0.06)};
}`;
}

export function appearanceStylesheet(raw: AppearanceSettings) {
  const appearance = sanitizeAppearance(raw);
  const sans = FONT_SANS[appearance.fontSans as keyof typeof FONT_SANS] || FONT_SANS.outfit;
  const display = FONT_DISPLAY[appearance.fontDisplay as keyof typeof FONT_DISPLAY] || FONT_DISPLAY.syne;
  const mono = FONT_MONO[appearance.fontMono as keyof typeof FONT_MONO] || FONT_MONO.geist;
  const radius = RADIUS_OPTIONS[appearance.radius];
  const size = FONT_SIZES[appearance.fontSize];

  return `html {
  --font-sans: ${sans.family};
  --font-display: ${display.family};
  --font-mono: ${mono.family};
  --font-size-base: ${size.value};
  --radius-box: ${radius.box};
  --radius-card: ${radius.card};
  font-size: var(--font-size-base);
}
@media (max-width: 640px) {
  html { font-size: min(var(--font-size-base), 16px); }
}
${themeBlock('html.dark, html[data-theme="dark"]', appearance.dark)}
${themeBlock('html.light, html[data-theme="light"]', appearance.light)}
body, button, input, textarea, select { font-family: var(--font-sans); }
.font-display, .display { font-family: var(--font-display); }
.font-mono, .footer-kicker { font-family: var(--font-mono); }
.rounded-sm { border-radius: var(--radius-box); }
.admin-card { border-radius: var(--radius-card); }`;
}

export function appearanceFontLinks(raw: AppearanceSettings) {
  const appearance = sanitizeAppearance(raw);
  const hrefs = [
    FONT_SANS[appearance.fontSans as keyof typeof FONT_SANS]?.href || "",
    FONT_DISPLAY[appearance.fontDisplay as keyof typeof FONT_DISPLAY]?.href || "",
    FONT_MONO[appearance.fontMono as keyof typeof FONT_MONO]?.href || "",
  ].filter((href) => href.length > 0);
  return [...new Set(hrefs)];
}
