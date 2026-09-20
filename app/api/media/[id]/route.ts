import { getFile } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id || /[^a-zA-Z0-9._-]/.test(id)) {
    return new Response("Not found", { status: 404 });
  }

  const file = await getFile(id);
  if (!file) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.mime || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
