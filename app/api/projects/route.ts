import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { createProject, getProjects } from "@/lib/projects";

function parseTags(value: FormDataEntryValue | null) {
  return String(value || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export async function GET() {
  const projects = await getProjects();
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const image = form.get("image");
    const project = await createProject(
      {
        title: String(form.get("title") || ""),
        summary: String(form.get("summary") || ""),
        description: String(form.get("description") || ""),
        tags: parseTags(form.get("tags")),
        liveUrl: String(form.get("liveUrl") || ""),
        githubUrl: String(form.get("githubUrl") || ""),
        featured: form.get("featured") === "on" || form.get("featured") === "true",
        year: String(form.get("year") || ""),
      },
      image instanceof File ? image : null,
    );
    return NextResponse.json({ project });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save project.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
