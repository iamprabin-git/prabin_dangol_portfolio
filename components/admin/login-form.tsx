"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { inputClass, labelClass } from "@/components/admin/form-utils";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: form.get("password") }),
    });
    const data = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Could not sign in.");
      return;
    }
    router.replace(searchParams.get("from") || "/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <label className={labelClass}>
        Admin password
        <input
          name="password"
          type="password"
          required
          autoFocus
          className={inputClass}
        />
      </label>
      {error ? <p className="text-sm text-[var(--accent-2)]">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--on-accent)] disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Enter dashboard"}
      </button>
      <Link
        href="/admin/login/forgot"
        className="rounded-full border border-[var(--line)] px-5 py-3 text-center text-sm font-semibold hover:border-[var(--accent)]"
      >
        Forgot password?
      </Link>
      <p className="text-xs text-[var(--muted)]">
        Local default is <code>admin</code> until you reset it. On Vercel, set{" "}
        <code>ADMIN_PASSWORD</code> or use forgot password with Blob storage.
      </p>
    </form>
  );
}
