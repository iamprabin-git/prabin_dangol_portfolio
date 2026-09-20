"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { navHref } from "@/lib/copy";
import type { SiteContent } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Header({ site }: { site: SiteContent }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const contactHref = navHref(site, "contact", "/#contact");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-[var(--line)] transition-colors",
        scrolled
          ? "bg-[var(--header-bg-scrolled)] shadow-[var(--header-shadow)] backdrop-blur-xl"
          : "bg-[var(--header-bg)] backdrop-blur-md",
      )}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:bg-[var(--accent)] focus:px-3 focus:py-2 focus:text-[var(--on-accent)]"
      >
        Skip to content
      </a>

      <div className="hidden border-b border-[var(--line)] md:block">
        <div className="mx-auto flex h-9 max-w-6xl items-center justify-between px-5 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted)] sm:px-8">
          <p className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            {site.availability}
          </p>
          <p>
            {site.location}
            <span className="mx-3 text-[var(--line)]">/</span>
            <a href={`mailto:${site.email}`} className="hover:text-[var(--text)]">
              {site.email}
            </a>
          </p>
        </div>
      </div>

      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 sm:px-8">
        <Link href="/" className="group flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={site.photos.portrait}
            alt={site.name}
            className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-[var(--line)] sm:h-10 sm:w-10"
          />
          <span className="min-w-0">
            <span className="block truncate font-display text-[1.02rem] font-extrabold tracking-[-0.03em] sm:text-lg">
              {site.name}
            </span>
            <span className="mt-0.5 hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted)] sm:flex">
              {site.role}
              <span className="h-px w-6 bg-[var(--accent)] transition-all group-hover:w-10" />
              {site.copy.brandTag}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {site.navigation.map((link) => {
            const active =
              link.href === "/projects"
                ? pathname.startsWith("/projects")
                : pathname === "/" && link.href.startsWith("/#");
            return (
              <Link
                key={link.id}
                href={link.href}
                data-active={active && link.href === "/projects" ? "true" : undefined}
                className="nav-link font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)] hover:text-[var(--text)]"
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <Link
            href={contactHref}
            className="hidden rounded-full bg-[var(--accent)] px-4 py-2 text-[11px] font-semibold tracking-wide text-[var(--on-accent)] sm:inline-flex"
          >
            {site.copy.headerCta}
          </Link>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="relative block h-3 w-4">
              <span
                className={cn(
                  "absolute left-0 h-px w-4 bg-[var(--text)] transition",
                  open ? "top-1.5 rotate-45" : "top-0",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-1.5 h-px w-4 bg-[var(--text)] transition",
                  open && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 h-px w-4 bg-[var(--text)] transition",
                  open ? "top-1.5 -rotate-45" : "top-3",
                )}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-14 z-40 overflow-y-auto border-t border-[var(--line)] bg-[var(--bg)] pb-[max(1.5rem,env(safe-area-inset-bottom))] md:top-[5.75rem] lg:hidden"
      >
        <nav className="mx-auto grid max-w-6xl gap-1 px-4 py-5 sm:px-8" aria-label="Mobile">
          {site.navigation.map((link, index) => (
            <Link
              key={link.id}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex items-baseline justify-between gap-4 border-b border-[var(--line)] py-3.5"
            >
              <span className="font-display text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl">
                {link.label}
              </span>
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                0{index + 1}
              </span>
            </Link>
          ))}
          <Link
            href={contactHref}
            onClick={() => setOpen(false)}
            className="mt-6 inline-flex w-fit rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--on-accent)]"
          >
            {site.copy.headerCta}
          </Link>
          <ThemeToggle className="mt-4" />
        </nav>
      </div>
    </header>
  );
}
