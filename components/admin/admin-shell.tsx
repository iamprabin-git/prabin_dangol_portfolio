"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import type { SiteContent } from "@/lib/types";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Overview", hint: "Dashboard" },
  { href: "/admin/profile", label: "Profile", hint: "Identity" },
  { href: "/admin/about", label: "About", hint: "Story" },
  { href: "/admin/timeline", label: "Timeline", hint: "Years" },
  { href: "/admin/skills", label: "Skills", hint: "Stack" },
  { href: "/admin/projects", label: "Projects", hint: "Work" },
  { href: "/admin/reviews", label: "Reviews", hint: "Notes" },
  { href: "/admin/contact", label: "Copy", hint: "Pages" },
  { href: "/admin/settings", label: "Settings", hint: "Look" },
];

function IconOverview() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
      <rect x="2.5" y="2.5" width="6.5" height="6.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="11" y="2.5" width="6.5" height="6.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="2.5" y="11" width="6.5" height="6.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="11" y="11" width="6.5" height="6.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconProfile() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
      <circle cx="10" cy="7" r="2.7" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4.5 16.2c.8-2.7 2.8-4.2 5.5-4.2s4.7 1.5 5.5 4.2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconAbout() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
      <path d="M4 5.5h12M4 10h8M4 14.5h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconTimeline() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
      <path d="M3 14.5 7.2 9.8l3.1 2.4L17 5.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 16.5h14" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconSkills() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
      <path d="m10 3 2.1 4.4 4.9.6-3.6 3.4.9 4.8L10 14.1 5.7 16.2l.9-4.8L3 8l4.9-.6L10 3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function IconProjects() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
      <rect x="3" y="4.5" width="14" height="11" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 8h14" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconReviews() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
      <path d="M4 4.5h12v8.5H8.5L4 16.5V4.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M7 8h6M7 10.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
      <path d="M6 4.5h8.5v11H6z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 6.5H4v11h9.5v-1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M10 3.2v1.6M10 15.2v1.6M3.2 10h1.6M15.2 10h1.6M5.2 5.2l1.1 1.1M13.7 13.7l1.1 1.1M14.8 5.2l-1.1 1.1M6.3 13.7l-1.1 1.1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

const icons = [
  IconOverview,
  IconProfile,
  IconAbout,
  IconTimeline,
  IconSkills,
  IconProjects,
  IconReviews,
  IconCopy,
  IconSettings,
];

export function AdminShell({
  site,
  storage,
  writable,
  pendingReviews,
  children,
}: {
  site: SiteContent;
  storage: string;
  writable: boolean;
  pendingReviews: number;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const current = links.find((link) =>
    link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href),
  );

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const nav = (
    <nav className="grid gap-1 px-3" aria-label="Studio">
      {links.map((link, index) => {
        const Icon = icons[index];
        const active = isActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-colors",
              active
                ? "bg-[var(--bg-panel)] text-[var(--text)] shadow-[inset_2px_0_0_var(--accent)]"
                : "text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]",
            )}
          >
            <Icon />
            <span className="flex-1">{link.label}</span>
            {link.href === "/admin/reviews" && pendingReviews ? (
              <span className="rounded-full bg-[var(--accent)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--on-accent)]">
                {pendingReviews}
              </span>
            ) : (
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] opacity-60">
                {link.hint}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/45 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[17.5rem] flex-col border-r border-[var(--line)] bg-[var(--bg-soft)]",
          open ? "flex" : "hidden lg:flex",
        )}
      >
        <div className="flex items-center gap-3 px-5 py-5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--accent)] font-display text-xs font-extrabold text-[var(--on-accent)]">
            {site.shortName}
          </span>
          <div className="min-w-0">
            <Link href="/admin" className="block truncate font-display text-[15px] font-bold">
              Studio
            </Link>
            <p className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
              Content OS
            </p>
          </div>
        </div>

        <p className="px-5 pb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
          Manage
        </p>
        {nav}

        <div className="mt-auto border-t border-[var(--line)] p-4">
          <div className="flex items-center gap-3 rounded-lg bg-[var(--bg)] px-3 py-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={site.photos.portrait}
              alt=""
              className="h-8 w-8 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{site.name}</p>
              <p className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                {storage}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-3 w-full rounded-lg border border-[var(--line)] px-3 py-2 text-left text-[13px] text-[var(--muted)] hover:text-[var(--text)]"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-[17.5rem]">
        <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--header-bg-scrolled)] backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between gap-2 px-3 sm:px-8">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-[var(--line)] lg:hidden"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
              >
                <span className="block h-3 w-3.5 border-y border-[var(--text)]" />
              </button>
              <div className="min-w-0">
                <p className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                  Admin / {current?.label ?? "Studio"}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <ThemeToggle />
              <Link
                href="/"
                className="whitespace-nowrap rounded-full border border-[var(--line)] px-2.5 py-1.5 text-[11px] font-medium hover:border-[var(--accent)] sm:px-3"
              >
                View site
              </Link>
            </div>
          </div>
        </header>

        {!writable ? (
          <div className="border-b border-[var(--accent-2)]/30 bg-[var(--accent-2)]/10 px-4 py-2.5 text-sm sm:px-8">
            Live saves need Vercel Postgres. In this project open Storage → Create Database → Neon,
            connect it, then redeploy.
          </div>
        ) : null}

        <div className="px-3 py-6 sm:px-8 lg:py-10">{children}</div>
      </div>
    </div>
  );
}
