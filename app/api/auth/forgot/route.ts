import { NextResponse } from "next/server";
import { recoveryEmail, saveAdminPassword } from "@/lib/admin-auth";
import { getSite } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      confirm?: string;
    };
    const site = await getSite();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const confirm = String(body.confirm || "");

    if (!email || email !== recoveryEmail(site.email)) {
      return NextResponse.json(
        { error: "Use the studio recovery email (the public contact email, unless ADMIN_EMAIL is set)." },
        { status: 400 },
      );
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Use a password with at least 8 characters." }, { status: 400 });
    }
    if (password !== confirm) {
      return NextResponse.json({ error: "Those passwords do not match." }, { status: 400 });
    }

    await saveAdminPassword(password);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not reset password.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
