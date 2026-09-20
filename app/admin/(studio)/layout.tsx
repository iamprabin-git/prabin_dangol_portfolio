import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { getSite } from "@/lib/content";
import { getReviews } from "@/lib/reviews";
import { canPersistWrites, storageLabel } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function StudioLayout({ children }: { children: ReactNode }) {
  const [site, reviews] = await Promise.all([getSite(), getReviews()]);
  const pendingReviews = reviews.filter((review) => review.status === "pending").length;
  return (
    <AdminShell
      storage={storageLabel()}
      writable={canPersistWrites()}
      site={site}
      pendingReviews={pendingReviews}
    >
      {children}
    </AdminShell>
  );
}
