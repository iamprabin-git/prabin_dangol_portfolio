import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { ProjectForm } from "@/components/admin/project-form";
import { ReviewInbox } from "@/components/admin/review-inbox";
import { getProjectById } from "@/lib/projects";
import { getReviews } from "@/lib/reviews";

export const metadata = { title: "Edit project" };

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, reviews] = await Promise.all([getProjectById(id), getReviews()]);
  if (!project) notFound();
  const projectReviews = reviews.filter((review) => review.projectId === project.id);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Work"
        title="Edit project"
        description={project.title}
      />
      <div className="admin-card p-5 sm:p-8">
        <ProjectForm project={project} />
      </div>
      <div className="mt-10">
        <PageHeader
          eyebrow="Moderation"
          title="Reviews"
          description="Approve a note to publish it on this project’s public page."
        />
        <ReviewInbox reviews={projectReviews} projects={[project]} defaultFilter="all" />
      </div>
    </div>
  );
}
