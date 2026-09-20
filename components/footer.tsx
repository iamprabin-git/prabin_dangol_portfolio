import Link from "next/link";
import { interpolate, navHref, whatsappHref } from "@/lib/copy";
import type { SiteContent } from "@/lib/types";

export function Footer({ site }: { site: SiteContent }) {
  const year = new Date().getFullYear();
  const contactHref = navHref(site, "contact", "/#contact");
  const chatHref = site.whatsapp.enabled
    ? whatsappHref(site.whatsapp.phone, interpolate(site.whatsapp.message || "", site))
    : "";
  const hasWhatsAppLink = site.socialLinks.some((item) =>
    item.href.toLowerCase().includes("wa.me") || item.label.toLowerCase().includes("whatsapp"),
  );

  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-[var(--bg-soft)]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-8 sm:flex-row sm:items-end sm:justify-between sm:pb-10">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={site.photos.portrait}
              alt={site.name}
              className="h-14 w-14 shrink-0 rounded-full object-cover ring-1 ring-[var(--line)] sm:h-16 sm:w-16"
            />
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--accent)]">
                {site.role}
              </p>
              <p className="mt-1 break-words font-display text-3xl font-extrabold tracking-[-0.05em] sm:mt-2 sm:text-5xl">
                {site.name}
              </p>
            </div>
          </div>
          <p className="max-w-sm text-sm leading-6 text-[var(--muted)]">{site.headline}</p>
        </div>

        <div className="grid gap-10 pt-10 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="footer-kicker">{site.copy.contactKicker}</p>
            <a
              href={`mailto:${site.email}`}
              className="mt-3 block break-all font-display text-lg font-bold tracking-[-0.03em] hover:text-[var(--accent)] sm:text-xl"
            >
              {site.email}
            </a>
            <p className="mt-3 text-sm text-[var(--muted)]">{site.location}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={contactHref}
                className="inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-[11px] font-semibold tracking-wide text-[var(--on-accent)]"
              >
                {site.copy.footerCta}
              </Link>
              {chatHref ? (
                <a
                  href={chatHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-full border border-[var(--line)] px-4 py-2 text-[11px] font-semibold tracking-wide hover:border-[#25d366]"
                >
                  {site.copy.whatsappLabel}
                </a>
              ) : null}
            </div>
          </div>

          <div className="lg:col-span-3">
            <p className="footer-kicker">{site.copy.footerSitemap}</p>
            <ul className="mt-4 grid gap-2.5">
              {site.navigation.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <p className="footer-kicker">{site.copy.footerSocial}</p>
            <ul className="mt-4 grid gap-2.5">
              {site.socialLinks
                .filter((item) => item.href)
                .map((item) => (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)]"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              {chatHref && !hasWhatsAppLink ? (
                <li>
                  <a
                    href={chatHref}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)]"
                  >
                    {site.copy.whatsappLabel}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="footer-kicker">{site.copy.footerStatus}</p>
            <p className="mt-4 flex items-center gap-2 text-sm text-[var(--text)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              {site.availability}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--line)] pb-[max(0px,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            © {year} {site.name}
          </p>
          <p className="flex flex-wrap gap-x-5 gap-y-2">
            <span>{site.copy.footerNote}</span>
            <Link href="/admin" className="hover:text-[var(--text)]">
              Admin
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
