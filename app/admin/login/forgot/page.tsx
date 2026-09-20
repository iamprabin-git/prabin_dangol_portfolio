import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "@/components/admin/forgot-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSite } from "@/lib/content";

export const metadata = {
  title: "Forgot password",
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage() {
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
              Reset the
              <br />
              studio password.
            </p>
            <p className="mt-5 max-w-sm text-sm leading-6 text-[var(--muted)]">
              Confirm the recovery email, then choose a new password. The next sign-in uses it
              immediately.
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
            Account
          </p>
          <h1 className="mt-3 font-display text-3xl font-extrabold">Forgot password</h1>
          <p className="mt-2 mb-8 text-sm text-[var(--muted)]">
            Use {site.email} unless you set <code>ADMIN_EMAIL</code>. Then pick a new studio
            password.
          </p>
          <ForgotPasswordForm recoveryHint={site.email} />
        </div>
      </div>
    </div>
  );
}
