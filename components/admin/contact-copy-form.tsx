"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { inputClass, labelClass, submitSite } from "@/components/admin/form-utils";
import { LinksEditor } from "@/components/admin/links-editor";
import type { NavItem, SiteContent, SiteCopy } from "@/lib/types";

const COPY_FIELDS: Array<{ name: keyof SiteCopy; label: string; rows?: number; hint?: string }> = [
  { name: "brandTag", label: "Header brand tag" },
  { name: "headerCta", label: "Header button" },
  { name: "heroPrimaryCta", label: "Hero primary button" },
  { name: "heroSecondaryCta", label: "Hero secondary button" },
  { name: "workKicker", label: "Home work label" },
  { name: "workHeading", label: "Home work heading" },
  { name: "workAllLink", label: "All projects link" },
  { name: "contactKicker", label: "Contact label" },
  { name: "contactHeading", label: "Contact heading" },
  { name: "projectsKicker", label: "Projects label" },
  { name: "projectsHeading", label: "Projects heading" },
  { name: "projectsIntro", label: "Projects intro", rows: 3 },
  { name: "projectsEmpty", label: "Empty projects message", rows: 2 },
  { name: "footerCta", label: "Footer button" },
  { name: "footerSitemap", label: "Footer sitemap heading" },
  { name: "footerSocial", label: "Footer social heading" },
  { name: "footerStatus", label: "Footer status heading" },
  { name: "footerNote", label: "Footer note" },
  { name: "formName", label: "Form: name" },
  { name: "formEmail", label: "Form: email" },
  { name: "formMessage", label: "Form: message" },
  { name: "formSubmit", label: "Form: submit" },
  { name: "formSuccess", label: "Form: success", rows: 2 },
  { name: "visitSite", label: "Visit site label" },
  { name: "caseStudy", label: "Case study label" },
  { name: "sourceLabel", label: "Source / GitHub label" },
  { name: "liveSite", label: "Open live site label" },
  { name: "moreWork", label: "More work heading" },
  { name: "backToProjects", label: "Back to projects" },
  { name: "reviewsKicker", label: "Reviews label" },
  { name: "reviewsHeading", label: "Reviews heading" },
  { name: "reviewsEmpty", label: "Empty reviews message", rows: 2 },
  { name: "reviewFormHeading", label: "Review form heading" },
  { name: "reviewFormName", label: "Review form: name" },
  { name: "reviewFormRole", label: "Review form: role" },
  { name: "reviewFormRating", label: "Review form: rating" },
  { name: "reviewFormBody", label: "Review form: body" },
  { name: "reviewFormSubmit", label: "Review form: submit" },
  { name: "reviewFormSuccess", label: "Review form: success", rows: 2 },
  { name: "whatsappLabel", label: "WhatsApp label" },
  { name: "whatsappGreeting", label: "WhatsApp greeting" },
  { name: "whatsappCta", label: "WhatsApp button" },
  { name: "skillsKicker", label: "Skills label" },
  { name: "skillsHeading", label: "Skills heading" },
  { name: "skillsLevel", label: "Skills proficiency label" },
  { name: "skillsYear", label: "Skills year label" },
  { name: "skillsEmpty", label: "Empty skills message" },
  { name: "timelineKicker", label: "Timeline label" },
  { name: "timelineHeading", label: "Timeline heading" },
  { name: "timelineWeb", label: "Web track name" },
  { name: "timelineDesign", label: "Design track name" },
  { name: "timelineEmpty", label: "Empty timeline message" },
  { name: "logosKicker", label: "Footer logo strip label" },
];

function copyFromForm(form: FormData, current: SiteCopy): SiteCopy {
  const next = { ...current };
  for (const field of COPY_FIELDS) {
    next[field.name] = String(form.get(field.name) ?? current[field.name]);
  }
  return next;
}

export function ContactFormAdmin({ site }: { site: SiteContent }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [navigation, setNavigation] = useState<NavItem[]>(site.navigation);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitSite({
        email: String(form.get("email") || site.email),
        summary: String(form.get("summary") || ""),
        navigation: navigation
          .filter((item) => item.label.trim() && item.href.trim())
          .map((item) => ({ ...item, label: item.label.trim(), href: item.href.trim() })),
        copy: copyFromForm(form, site.copy),
      });
      setMessage("Site copy saved. The live pages update immediately.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-8">
      <section className="grid gap-5">
        <div>
          <h2 className="font-display text-lg font-bold">Navigation</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Header and footer links. Use paths like <code>/#work</code> or <code>/projects</code>.
          </p>
        </div>
        <LinksEditor
          items={navigation}
          onChange={setNavigation}
          addLabel="Add nav link"
          emptyHint="Add the first header link."
        />
      </section>

      <section className="grid gap-5">
        <h2 className="font-display text-lg font-bold">Contact intro</h2>
        <label className={labelClass}>
          Contact intro
          <textarea name="summary" rows={4} defaultValue={site.summary} className={inputClass} />
        </label>
        <label className={labelClass}>
          Public email
          <input name="email" type="email" defaultValue={site.email} className={inputClass} />
        </label>
      </section>

      <section className="grid gap-5">
        <h2 className="font-display text-lg font-bold">Labels & buttons</h2>
        {COPY_FIELDS.map((field) =>
          field.rows ? (
            <label key={field.name} className={labelClass}>
              {field.label}
              <textarea
                name={field.name}
                rows={field.rows}
                defaultValue={site.copy[field.name]}
                className={inputClass}
              />
            </label>
          ) : (
            <label key={field.name} className={labelClass}>
              {field.label}
              <input name={field.name} defaultValue={site.copy[field.name]} className={inputClass} />
            </label>
          ),
        )}
      </section>

      {error ? <p className="text-sm text-[var(--accent-2)]">{error}</p> : null}
      {message ? <p className="text-sm text-[var(--accent)]">{message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--on-accent)] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save copy"}
      </button>
    </form>
  );
}
