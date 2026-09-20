import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAdminPassword } from "@/lib/admin-auth";
import { COOKIE_NAME, createSessionToken, sessionCookieOptions } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { password?: string };
  const password = String(body.password || "");
  if (!(await verifyAdminPassword(password))) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  const jar = await cookies();
  jar.set(COOKIE_NAME, await createSessionToken(), sessionCookieOptions());
  return NextResponse.json({ ok: true });
}
