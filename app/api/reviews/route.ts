import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { createReview, getReviews } from "@/lib/reviews";
import type { ReviewStatus } from "@/lib/types";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const reviews = await getReviews();
  return NextResponse.json({ reviews });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      projectId?: string;
      name?: string;
      role?: string;
      rating?: number;
      body?: string;
      website?: string;
      status?: ReviewStatus;
    };

    if (body.website) {
      return NextResponse.json({ ok: true });
    }

    const admin = await isAdminAuthenticated();
    const status: ReviewStatus = admin && body.status === "approved" ? "approved" : "pending";

    const review = await createReview(
      {
        projectId: String(body.projectId || ""),
        name: String(body.name || ""),
        role: String(body.role || ""),
        rating: Number(body.rating),
        body: String(body.body || ""),
      },
      status,
    );

    return NextResponse.json({
      ok: true,
      review: admin ? review : { id: review.id, status: review.status },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save review.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
