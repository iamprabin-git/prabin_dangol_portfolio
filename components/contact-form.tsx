"use client";

import { FormEvent, useState } from "react";
import type { SiteCopy } from "@/lib/types";

export function ContactForm({
  to,
  copy,
}: {
  to: string;
  copy: Pick<SiteCopy, "formName" | "formEmail" | "formMessage" | "formSubmit" | "formSuccess">;
}) {
  const [status, setStatus] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "");
    const from = String(data.get("email") || "");
    const message = String(data.get("message") || "");
    const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${from})`);
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    setStatus(copy.formSuccess);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <label className="grid gap-2 text-sm">
        {copy.formName}
        <input
          name="name"
          required
          className="rounded-sm border border-[var(--line)] bg-[var(--bg-soft)] px-4 py-3 outline-none focus:border-[var(--accent)]"
        />
      </label>
      <label className="grid gap-2 text-sm">
        {copy.formEmail}
        <input
          name="email"
          type="email"
          required
          className="rounded-sm border border-[var(--line)] bg-[var(--bg-soft)] px-4 py-3 outline-none focus:border-[var(--accent)]"
        />
      </label>
      <label className="grid gap-2 text-sm">
        {copy.formMessage}
        <textarea
          name="message"
          required
          rows={5}
          className="resize-y rounded-sm border border-[var(--line)] bg-[var(--bg-soft)] px-4 py-3 outline-none focus:border-[var(--accent)]"
        />
      </label>
      <button
        type="submit"
        className="w-full rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--on-accent)] sm:mt-2 sm:w-fit"
      >
        {copy.formSubmit}
      </button>
      {status ? <p className="text-sm text-[var(--muted)]">{status}</p> : null}
    </form>
  );
}
