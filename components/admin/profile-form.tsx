"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { inputClass, labelClass, submitSite } from "@/components/admin/form-utils";
import { LinksEditor } from "@/components/admin/links-editor";
import type { SiteContent, SocialLink } from "@/lib/types";

export function ProfileForm({ site }: { site: SiteContent }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(site.socialLinks);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitSite(
        {
          name: String(form.get("name") || ""),
          shortName: String(form.get("shortName") || ""),
          role: String(form.get("role") || ""),
          headline: String(form.get("headline") || ""),
          location: String(form.get("location") || ""),
          email: String(form.get("email") || ""),
          availability: String(form.get("availability") || ""),
          resumeUrl: String(form.get("resumeUrl") || ""),
          whatsapp: {
            phone: String(form.get("whatsappPhone") || ""),
            message: String(form.get("whatsappMessage") || ""),
            enabled: form.get("whatsappEnabled") === "on",
          },
          socialLinks: socialLinks
            .filter((item) => item.label.trim() && item.href.trim())
            .map((item) => ({ ...item, label: item.label.trim(), href: item.href.trim() })),
        },
        {
          portrait: form.get("portrait") instanceof File ? (form.get("portrait") as File) : null,
          workspace: form.get("workspace") instanceof File ? (form.get("workspace") as File) : null,
        },
      );
      setMessage("Profile saved. The live site is updated.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Full name
          <input name="name" required defaultValue={site.name} className={inputClass} />
        </label>
        <label className={labelClass}>
          Short name
          <input name="shortName" defaultValue={site.shortName} className={inputClass} />
        </label>
      </div>
      <label className={labelClass}>
        Role
        <input name="role" required defaultValue={site.role} className={inputClass} />
      </label>
      <label className={labelClass}>
        Headline
        <textarea name="headline" rows={3} defaultValue={site.headline} className={inputClass} />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Location
          <input name="location" defaultValue={site.location} className={inputClass} />
        </label>
        <label className={labelClass}>
          Email
          <input name="email" type="email" required defaultValue={site.email} className={inputClass} />
        </label>
      </div>
      <label className={labelClass}>
        Availability
        <input name="availability" defaultValue={site.availability} className={inputClass} />
      </label>
      <label className={labelClass}>
        Resume URL
        <input name="resumeUrl" defaultValue={site.resumeUrl} className={inputClass} />
      </label>
      <div className="grid gap-4 border border-[var(--line)] p-4">
        <p className="text-sm font-medium">WhatsApp chat</p>
        <p className="text-xs text-[var(--muted)]">
          Number with country code, no plus sign — for Nepal use 97798XXXXXXXX. The floating chat
          opens WhatsApp with the prefilled message.
        </p>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="whatsappEnabled"
            defaultChecked={site.whatsapp.enabled}
          />
          Show WhatsApp chat on the public site
        </label>
        <label className={labelClass}>
          WhatsApp number
          <input
            name="whatsappPhone"
            defaultValue={site.whatsapp.phone}
            placeholder="97798XXXXXXXX"
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Prefill message
          <textarea
            name="whatsappMessage"
            rows={3}
            defaultValue={site.whatsapp.message}
            className={inputClass}
          />
          <span className="text-xs text-[var(--muted)]">Use {"{name}"} to insert your name.</span>
        </label>
      </div>
      <div>
        <p className="text-sm font-medium">Social links</p>
        <p className="mt-1 text-xs text-[var(--muted)]">Shown in the footer. Add GitHub, LinkedIn, or any other profile.</p>
        <div className="mt-3">
          <LinksEditor
            items={socialLinks}
            onChange={setSocialLinks}
            addLabel="Add social link"
            emptyHint="Add a profile URL."
          />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Profile photo
          <input name="portrait" type="file" accept="image/*" className={inputClass} />
          {site.photos.portrait ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={site.photos.portrait} alt="" className="mt-2 h-24 w-24 rounded-full object-cover" />
          ) : null}
        </label>
        <label className={labelClass}>
          Workspace photo
          <input name="workspace" type="file" accept="image/*" className={inputClass} />
          {site.photos.workspace ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={site.photos.workspace} alt="" className="mt-2 h-24 w-36 object-cover" />
          ) : null}
        </label>
      </div>
      {error ? <p className="text-sm text-[var(--accent-2)]">{error}</p> : null}
      {message ? <p className="text-sm text-[var(--accent)]">{message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--on-accent)] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
