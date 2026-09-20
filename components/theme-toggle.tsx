"use client";

import { useEffect, useState } from "react";
import {
  THEME_STORAGE_KEY,
  applyTheme,
  isTheme,
  resolveTheme,
  type Theme,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

function SunIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="2.4" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M8 1.6v1.5M8 12.9v1.5M1.6 8h1.5M12.9 8h1.5M3.3 3.3l1.1 1.1M11.6 11.6l1.1 1.1M12.7 3.3l-1.1 1.1M4.4 11.6l-1.1 1.1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden>
      <path
        d="M13.2 10.1A5.4 5.4 0 0 1 5.9 2.8 5.5 5.5 0 1 0 13.2 10.1Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const options: { value: Theme; label: string; icon: typeof SunIcon }[] = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
];

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const current = resolveTheme();
    applyTheme(current);
    const sync = () => {
      setTheme(current);
      setReady(true);
    };
    queueMicrotask(sync);

    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY || !isTheme(event.newValue)) return;
      applyTheme(event.newValue, false);
      setTheme(event.newValue);
    };

    const media = window.matchMedia("(prefers-color-scheme: light)");
    const onSystem = (event: MediaQueryListEvent) => {
      if (localStorage.getItem(THEME_STORAGE_KEY)) return;
      const next = event.matches ? "light" : "dark";
      applyTheme(next, false);
      setTheme(next);
    };

    window.addEventListener("storage", onStorage);
    media.addEventListener("change", onSystem);
    return () => {
      window.removeEventListener("storage", onStorage);
      media.removeEventListener("change", onSystem);
    };
  }, []);

  function select(next: Theme) {
    applyTheme(next);
    setTheme(next);
  }

  return (
    <div
      role="group"
      aria-label="Color theme"
      className={cn(
        "inline-flex h-7 items-center rounded-full border border-[var(--line)] bg-[var(--bg-panel)] p-px",
        className,
      )}
    >
      {options.map((option) => {
        const active = ready && theme === option.value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            title={`${option.label} mode`}
            aria-label={`${option.label} mode`}
            aria-pressed={active}
            onClick={() => select(option.value)}
            className={cn(
              "inline-flex h-6 items-center gap-1 rounded-full px-1.5 text-[9px] font-medium tracking-wide transition-colors sm:px-2",
              active
                ? "bg-[var(--accent)] text-[var(--on-accent)]"
                : "text-[var(--muted)] hover:text-[var(--text)]",
            )}
          >
            <Icon />
            <span className="hidden md:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
