import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSite } from "@/lib/content";

export const metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }
  const site = await getSite();

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-[var(--bg-soft)] lg:block">
        <div className="grid-fade absolute inset-0 opacity-80" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent)]">
            {site.shortName} Studio
          </p>
          <div>
            <p className="font-display text-5xl font-extrabold tracking-[-0.05em]">
              Edit the live
              <br />
              portfolio.
            </p>
            <p className="mt-5 max-w-sm text-sm leading-6 text-[var(--muted)]">
              Profile, skills, copy, and projects — published the moment you save.
            </p>
          </div>
          <p className="text-sm text-[var(--muted)]">{site.name}</p>
        </div>
      </div>
      <div className="relative grid min-h-screen place-items-center px-4 py-16">
        <div className="absolute right-4 top-4 sm:right-5 sm:top-5">
          <ThemeToggle />
        </div>
        <div className="admin-card w-full max-w-md p-5 sm:p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent)]">
            Sign in
          </p>
          <h1 className="mt-3 font-display text-3xl font-extrabold">Welcome back</h1>
          <p className="mt-2 mb-8 text-sm text-[var(--muted)]">
            Enter the studio password to manage the public site.
          </p>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
