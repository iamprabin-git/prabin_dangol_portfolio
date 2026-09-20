import { PageHeader } from "@/components/admin/page-header";
import { ProjectForm } from "@/components/admin/project-form";

export const metadata = { title: "New project" };

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Work"
        title="Add a project"
        description="Cover image, write-up, live website, and GitHub. Featured items appear on the home page."
      />
      <div className="admin-card p-5 sm:p-8">
        <ProjectForm />
      </div>
    </div>
  );
}
