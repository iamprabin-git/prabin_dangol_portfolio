import { PageHeader } from "@/components/admin/page-header";
import { ReviewInbox } from "@/components/admin/review-inbox";
import { getProjects } from "@/lib/projects";
import { getReviews } from "@/lib/reviews";

export const metadata = { title: "Reviews" };

export default async function ReviewsAdminPage() {
  const [reviews, projects] = await Promise.all([getReviews(), getProjects()]);
  const pending = reviews.filter((review) => review.status === "pending").length;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Moderation"
        title="Reviews"
        description={
          pending
            ? `${pending} waiting for approval. Approved reviews show on the matching project page.`
            : "Approve visitor notes or publish a review yourself. Only approved reviews appear on the site."
        }
      />
      <ReviewInbox reviews={reviews} projects={projects} />
    </div>
  );
}
