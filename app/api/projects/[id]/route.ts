import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { deleteProject, updateProject } from "@/lib/projects";

type RouteContext = { params: Promise<{ id: string }> };

function parseTags(value: FormDataEntryValue | null) {
  return String(value || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const form = await request.formData();
    const image = form.get("image");
    const logo = form.get("logo");
    const project = await updateProject(
      id,
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
      logo instanceof File ? logo : null,
    );
    return NextResponse.json({ project });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update project.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    await deleteProject(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete project.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
