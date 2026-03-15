import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";

/** Max size per file (4 MB) to stay under Vercel body limit */
const MAX_FILE_SIZE = 4 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { ok: false, error: "Blob storage not configured. Add BLOB_READ_WRITE_TOKEN in Vercel." },
      { status: 503 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid form data" }, { status: 400 });
  }

  const files = formData.getAll("file") as File[];
  if (!files?.length) {
    return NextResponse.json({ ok: false, error: "No files in request" }, { status: 400 });
  }

  const results: { name: string; url: string; type: string }[] = [];
  for (const file of files) {
    if (!file.size || !file.type.startsWith("image/")) continue;
    if (file.size > MAX_FILE_SIZE) continue;
    if (!ALLOWED_TYPES.includes(file.type)) continue;

    try {
      const pathname = `media/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const blob = await put(pathname, file, {
        access: "public",
        addRandomSuffix: true,
        contentType: file.type,
      });
      results.push({ name: file.name, url: blob.url, type: file.type });
    } catch (err) {
      console.error("Blob upload error:", err);
      return NextResponse.json(
        { ok: false, error: err instanceof Error ? err.message : "Upload failed" },
        { status: 500 }
      );
    }
  }

  if (results.length === 0) {
    return NextResponse.json({ ok: false, error: "No valid image files" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, files: results });
}
