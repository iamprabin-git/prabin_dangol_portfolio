"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { inputClass, labelClass, submitSite } from "@/components/admin/form-utils";
import {
  COLOR_PRESETS,
  FONT_DISPLAY,
  FONT_MONO,
  FONT_SANS,
  FONT_SIZES,
  RADIUS_OPTIONS,
  defaultAppearance,
  sanitizeAppearance,
} from "@/lib/appearance";
import type { AppearanceSettings, SiteContent, ThemePalette } from "@/lib/types";

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={labelClass}>
      {label}
      <span className="flex min-w-0 gap-2">
        <input
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-md border border-[var(--line)] bg-[var(--bg-panel)] p-1"
        />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClass} min-w-0`}
        />
      </span>
    </label>
  );
}

function PaletteFields({
  palette,
  onChange,
}: {
  palette: ThemePalette;
  onChange: (palette: ThemePalette) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <ColorField label="Background" value={palette.bg} onChange={(bg) => onChange({ ...palette, bg })} />
      <ColorField
        label="Soft background"
        value={palette.bgSoft}
        onChange={(bgSoft) => onChange({ ...palette, bgSoft })}
      />
      <ColorField
        label="Panel"
        value={palette.bgPanel}
        onChange={(bgPanel) => onChange({ ...palette, bgPanel })}
      />
      <ColorField label="Text" value={palette.text} onChange={(text) => onChange({ ...palette, text })} />
      <ColorField label="Muted text" value={palette.muted} onChange={(muted) => onChange({ ...palette, muted })} />
      <ColorField label="Accent" value={palette.accent} onChange={(accent) => onChange({ ...palette, accent })} />
      <ColorField
        label="Secondary accent"
        value={palette.accent2}
        onChange={(accent2) => onChange({ ...palette, accent2 })}
      />
    </div>
  );
}

export function SettingsForm({ site }: { site: SiteContent }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [appearance, setAppearance] = useState<AppearanceSettings>(
    sanitizeAppearance(site.appearance),
  );

  const preview = useMemo(() => appearance, [appearance]);

  function patch(next: Partial<AppearanceSettings>) {
    setAppearance((current) => ({
      ...current,
      ...next,
      dark: { ...current.dark, ...next.dark },
      light: { ...current.light, ...next.light },
    }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");
    try {
      await submitSite({ appearance: sanitizeAppearance(appearance) });
      setMessage("Settings saved. The public site and studio now use this look.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8">
      <section className="grid gap-4">
        <div>
          <h2 className="font-display text-lg font-bold">Type</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Font size scales the whole site. Families apply to body, headings, and mono labels.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Font size
            <select
              value={appearance.fontSize}
              onChange={(event) => patch({ fontSize: event.target.value as AppearanceSettings["fontSize"] })}
              className={inputClass}
            >
              {Object.entries(FONT_SIZES).map(([id, option]) => (
                <option key={id} value={id}>
                  {option.label} ({option.value})
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Corners
            <select
              value={appearance.radius}
              onChange={(event) => patch({ radius: event.target.value as AppearanceSettings["radius"] })}
              className={inputClass}
            >
              {Object.entries(RADIUS_OPTIONS).map(([id, option]) => (
                <option key={id} value={id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Body font
            <select
              value={appearance.fontSans}
              onChange={(event) => patch({ fontSans: event.target.value })}
              className={inputClass}
            >
              {Object.entries(FONT_SANS).map(([id, option]) => (
                <option key={id} value={id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Heading font
            <select
              value={appearance.fontDisplay}
              onChange={(event) => patch({ fontDisplay: event.target.value })}
              className={inputClass}
            >
              {Object.entries(FONT_DISPLAY).map(([id, option]) => (
                <option key={id} value={id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Mono font
            <select
              value={appearance.fontMono}
              onChange={(event) => patch({ fontMono: event.target.value })}
              className={inputClass}
            >
              {Object.entries(FONT_MONO).map(([id, option]) => (
                <option key={id} value={id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="grid gap-4">
        <div>
          <h2 className="font-display text-lg font-bold">Color palettes</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Dark and light each have their own colors. Visitors still pick the mode in the header.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => patch({ dark: preset.dark, light: preset.light })}
              className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs hover:border-[var(--accent)]"
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="grid gap-3">
            <p className="text-sm font-medium">Dark mode</p>
            <PaletteFields palette={appearance.dark} onChange={(dark) => patch({ dark })} />
          </div>
          <div className="grid gap-3">
            <p className="text-sm font-medium">Light mode</p>
            <PaletteFields palette={appearance.light} onChange={(light) => patch({ light })} />
          </div>
        </div>
      </section>

      <section
        className="overflow-hidden border border-[var(--line)] p-5"
        style={{
          background: preview.dark.bgSoft,
          color: preview.dark.text,
          borderRadius: RADIUS_OPTIONS[preview.radius].card,
          fontFamily: FONT_SANS[preview.fontSans as keyof typeof FONT_SANS]?.family,
        }}
      >
        <p
          className="text-[10px] uppercase tracking-[0.2em]"
          style={{ color: preview.dark.accent, fontFamily: FONT_MONO[preview.fontMono as keyof typeof FONT_MONO]?.family }}
        >
          Preview
        </p>
        <p
          className="mt-3 text-3xl font-extrabold"
          style={{ fontFamily: FONT_DISPLAY[preview.fontDisplay as keyof typeof FONT_DISPLAY]?.family }}
        >
          {site.name}
        </p>
        <p className="mt-2 text-sm" style={{ color: preview.dark.muted }}>
          {site.headline}
        </p>
        <div className="mt-4 flex gap-2">
          <span
            className="px-3 py-1.5 text-xs font-semibold"
            style={{
              background: preview.dark.accent,
              color: preview.dark.bg,
              borderRadius: RADIUS_OPTIONS[preview.radius].box,
            }}
          >
            Accent
          </span>
          <span
            className="px-3 py-1.5 text-xs"
            style={{
              border: `1px solid ${preview.dark.accent2}`,
              color: preview.dark.accent2,
              borderRadius: RADIUS_OPTIONS[preview.radius].box,
            }}
          >
            Secondary
          </span>
        </div>
      </section>

      {error ? <p className="text-sm text-[var(--accent-2)]">{error}</p> : null}
      {message ? <p className="text-sm text-[var(--accent)]">{message}</p> : null}
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--on-accent)] disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save settings"}
        </button>
        <button
          type="button"
          onClick={() => setAppearance(defaultAppearance)}
          className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm"
        >
          Reset look
        </button>
      </div>
    </form>
  );
}
