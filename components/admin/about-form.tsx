"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { inputClass, labelClass, submitSite } from "@/components/admin/form-utils";
import type { ServiceItem, SiteContent } from "@/lib/types";

export function AboutForm({ site }: { site: SiteContent }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [services, setServices] = useState<ServiceItem[]>(site.services);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const about = String(form.get("about") || "")
      .split(/\n\s*\n/)
      .map((part) => part.trim())
      .filter(Boolean);
    try {
      await submitSite({
        about,
        services: services.map((service) => ({
          ...service,
          title: service.title.trim(),
          body: service.body.trim(),
        })),
        copy: {
          ...site.copy,
          aboutKicker: String(form.get("aboutKicker") || site.copy.aboutKicker),
          aboutHeading: String(form.get("aboutHeading") || site.copy.aboutHeading),
        },
      });
      setMessage("About page saved.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-6">
      <label className={labelClass}>
        Section label
        <input name="aboutKicker" defaultValue={site.copy.aboutKicker} className={inputClass} />
      </label>
      <label className={labelClass}>
        About heading
        <input name="aboutHeading" defaultValue={site.copy.aboutHeading} className={inputClass} />
        <span className="text-xs text-[var(--muted)]">
          Placeholders: {"{name}"}, {"{role}"}, {"{location}"}, {"{email}"}.
        </span>
      </label>
      <label className={labelClass}>
        About text
        <textarea
          name="about"
          rows={8}
          defaultValue={site.about.join("\n\n")}
          className={inputClass}
        />
        <span className="text-xs text-[var(--muted)]">Separate paragraphs with a blank line.</span>
      </label>
      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Services</p>
          <button
            type="button"
            className="text-sm text-[var(--accent)]"
            onClick={() =>
              setServices((current) => [
                ...current,
                { id: crypto.randomUUID(), title: "", body: "" },
              ])
            }
          >
            Add service
          </button>
        </div>
        <div className="mt-4 grid gap-4">
          {services.map((service, index) => (
            <div key={service.id} className="grid gap-3 border border-[var(--line)] p-4">
              <label className={labelClass}>
                Title
                <input
                  value={service.title}
                  onChange={(event) =>
                    setServices((current) =>
                      current.map((item, i) =>
                        i === index ? { ...item, title: event.target.value } : item,
                      ),
                    )
                  }
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Description
                <textarea
                  rows={3}
                  value={service.body}
                  onChange={(event) =>
                    setServices((current) =>
                      current.map((item, i) =>
                        i === index ? { ...item, body: event.target.value } : item,
                      ),
                    )
                  }
                  className={inputClass}
                />
              </label>
              <button
                type="button"
                className="w-fit text-sm text-[var(--accent-2)]"
                onClick={() => setServices((current) => current.filter((_, i) => i !== index))}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
      {error ? <p className="text-sm text-[var(--accent-2)]">{error}</p> : null}
      {message ? <p className="text-sm text-[var(--accent)]">{message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--on-accent)] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save about"}
      </button>
    </form>
  );
}
