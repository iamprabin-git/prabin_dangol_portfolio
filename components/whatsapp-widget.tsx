"use client";

import { FormEvent, useState } from "react";
import { interpolate, whatsappHref } from "@/lib/copy";
import type { SiteContent } from "@/lib/types";

function WhatsAppMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M19.05 4.91A9.87 9.87 0 0 0 12.04 2C6.55 2 2.08 6.45 2.08 11.92c0 1.75.46 3.45 1.34 4.95L2 22l5.27-1.38a10.07 10.07 0 0 0 4.77 1.21h.01c5.49 0 9.96-4.45 9.96-9.92 0-2.65-1.04-5.14-2.96-7Zm-7.01 15.24h-.01a8.35 8.35 0 0 1-4.25-1.16l-.3-.18-3.12.82.83-3.04-.2-.31a8.27 8.27 0 0 1-1.27-4.36c0-4.57 3.74-8.29 8.34-8.29 2.23 0 4.32.86 5.89 2.43a8.22 8.22 0 0 1 2.45 5.87c0 4.57-3.74 8.22-8.36 8.22Zm4.58-6.2c-.25-.13-1.48-.73-1.71-.81-.23-.08-.4-.13-.56.12-.17.25-.64.81-.79.98-.14.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.13.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.48-.6 1.69-1.19.21-.58.21-1.08.15-1.19-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}

export function WhatsAppWidget({ site }: { site: SiteContent }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const intro = interpolate(site.whatsapp.message || "", site);
  const href = whatsappHref(site.whatsapp.phone, draft.trim() || intro);

  if (!site.whatsapp.enabled || !whatsappHref(site.whatsapp.phone)) return null;

  function startChat(event: FormEvent) {
    event.preventDefault();
    if (!href) return;
    window.open(href, "_blank", "noreferrer");
  }

  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-30 flex flex-col items-end gap-3">
      {open ? (
        <div className="w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-panel)] shadow-[var(--header-shadow)]">
          <div className="flex items-center gap-3 bg-[#075e54] px-4 py-3 text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={site.photos.portrait}
              alt=""
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{site.name}</p>
              <p className="truncate text-xs text-white/75">{site.copy.whatsappGreeting}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-full text-white/80 hover:text-white"
              aria-label="Close chat"
            >
              ×
            </button>
          </div>
          <form onSubmit={startChat} className="grid gap-3 bg-[var(--bg-soft)] p-4">
            <p className="max-w-[90%] rounded-lg rounded-tl-sm bg-[var(--bg-panel)] px-3 py-2 text-sm leading-5">
              Hi, this is {site.name}. {site.copy.whatsappGreeting}
            </p>
            <label className="sr-only" htmlFor="whatsapp-draft">
              Message
            </label>
            <textarea
              id="whatsapp-draft"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={3}
              placeholder={intro || "Write a message"}
              className="resize-none rounded-lg border border-[var(--line)] bg-[var(--bg-panel)] px-3 py-2 text-sm outline-none focus:border-[#25d366]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25d366] px-4 py-2.5 text-sm font-semibold text-white"
            >
              <WhatsAppMark className="h-4 w-4" />
              {site.copy.whatsappCta}
            </button>
          </form>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="grid h-12 w-12 place-items-center rounded-full bg-[#25d366] text-white shadow-[0_10px_30px_rgba(37,211,102,0.45)] sm:h-14 sm:w-14"
        aria-expanded={open}
        aria-label={open ? "Close WhatsApp chat" : site.copy.whatsappLabel}
      >
        {open ? <span className="text-2xl leading-none">×</span> : <WhatsAppMark className="h-7 w-7" />}
      </button>
    </div>
  );
}

export function WhatsAppButton({
  site,
  className = "",
}: {
  site: SiteContent;
  className?: string;
}) {
  const href = whatsappHref(
    site.whatsapp.phone,
    interpolate(site.whatsapp.message || "", site),
  );
  if (!site.whatsapp.enabled || !href) return null;

  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      <WhatsAppMark className="h-4 w-4" />
      {site.copy.whatsappLabel}
    </a>
  );
}
