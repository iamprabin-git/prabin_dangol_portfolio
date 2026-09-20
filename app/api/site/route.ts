import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSite, updateSite } from "@/lib/content";
import type { SiteContent } from "@/lib/types";

export async function GET() {
  const site = await getSite();
  return NextResponse.json({ site });
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const raw = String(form.get("data") || "{}");
    const patch = JSON.parse(raw) as Partial<SiteContent>;
    const portrait = form.get("portrait");
    const workspace = form.get("workspace");

    const site = await updateSite({
      ...patch,
      portrait: portrait instanceof File ? portrait : null,
      workspace: workspace instanceof File ? workspace : null,
    });

    return NextResponse.json({ site });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save site content.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
