"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { inputClass, labelClass } from "@/components/admin/form-utils";

export function ForgotPasswordForm({
  recoveryHint,
  canSave,
}: {
  recoveryHint: string;
  canSave: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
        confirm: form.get("confirm"),
      }),
    });
    const data = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Could not reset password.");
      return;
    }
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <label className={labelClass}>
        Recovery email
        <input
          name="email"
          type="email"
          required
          autoFocus
          placeholder={recoveryHint}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        New password
        <input name="password" type="password" required minLength={8} className={inputClass} />
      </label>
      <label className={labelClass}>
        Confirm password
        <input name="confirm" type="password" required minLength={8} className={inputClass} />
      </label>
      {error ? <p className="text-sm text-[var(--accent-2)]">{error}</p> : null}
      {!canSave ? (
        <p className="rounded-lg border border-[var(--line)] bg-[var(--bg-soft)] px-3 py-3 text-sm leading-6 text-[var(--muted)]">
          This live site has no database yet, so a new password cannot be stored. In Vercel go to
          Storage → Create Database → Neon, connect Production, then Redeploy. Until then, sign in
          with the <code>ADMIN_PASSWORD</code> value in Environment Variables.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending || !canSave}
        className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--on-accent)] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Reset password"}
      </button>
      <Link href="/admin/login" className="text-center text-sm text-[var(--muted)] hover:text-[var(--text)]">
        Back to sign in
      </Link>
    </form>
  );
}
