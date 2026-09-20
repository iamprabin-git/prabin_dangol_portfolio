import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { deleteReview, setReviewStatus } from "@/lib/reviews";
import type { ReviewStatus } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = (await request.json()) as { status?: ReviewStatus };
    if (!body.status) throw new Error("A status is required.");
    const review = await setReviewStatus(id, body.status);
    return NextResponse.json({ review });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update review.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    await deleteReview(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete review.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
